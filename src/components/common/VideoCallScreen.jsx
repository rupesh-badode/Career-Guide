import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { io } from 'socket.io-client';
import { RTCPeerConnection, RTCIceCandidate, RTCSessionDescription, mediaDevices, RTCView } from 'react-native-webrtc';
import InCallManager from 'react-native-incall-manager'; // 👉 NEW: Loudspeaker control
import { backendConfig } from '../../constants/MainContent';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';

const SOCKET_URL = backendConfig.origin;

export default function VideoCallScreen({ route }) {
  const roomName = "room_123"; // Replace with route.params.roomName
  const navigation = useNavigation();

  const { userData } = useSelector((state) => state.auth);
  const myRole = userData?.role;

  // ==========================================
  // STATES
  // ==========================================
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  // Controls States
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false); // 👉 NEW: Loudspeaker state

  // Call Status States (idle -> calling/waiting -> ringing -> connected)
  const [callStatus, setCallStatus] = useState(myRole === "User" ? "calling" : "waiting");
  const [pendingOffer, setPendingOffer] = useState(null);

  // ==========================================
  // REFS
  // ==========================================
  const socketRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const pendingIceCandidates = useRef([]); // 👉 NEW: To hold ICE candidates until call is accepted

  const rtcConfig = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  };

  useEffect(() => {
    // 1. Initialize Socket Connection
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'],
      forceNew: true,
    });

    socketRef.current.emit('joinCallRoom', { roomId: roomName });

    // Start InCallManager for Audio Routing
    InCallManager.start({ media: 'video' });

    // Agar Caller (User) hai, toh turant camera on karke call lagao
    if (myRole === "User") {
      startMyStreamAndCall();
    }

    // ==========================================
    // SOCKET LISTENERS
    // ==========================================

    socketRef.current.on('offer', async (offer) => {
      console.log("Received Offer");
      if (myRole !== "User") {
        // Receiver ko popup dikhao, call turant connect mat karo
        setPendingOffer(offer);
        setCallStatus("ringing");
      }
    });

    socketRef.current.on('answer', async (answer) => {
      console.log("Received Answer from Receiver");
      if (peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
          setCallStatus("connected");
        } catch (err) {
          console.error("Error setting remote answer:", err);
        }
      }
    });

    socketRef.current.on('ice-candidate', async (candidate) => {
      if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
        try {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.log('Error adding ICE candidate', e);
        }
      } else {
        // Agar call abhi accept nahi hui hai, toh candidates ko save kar lo
        pendingIceCandidates.current.push(candidate);
      }
    });

    // Handle Call Rejection from other side
    socketRef.current.on('call-rejected', () => {
      alert("Call was rejected");
      endCall();
    });
    

    return () => {
      cleanupMedia();
    };
  }, []);

  // ==========================================
  // WEBRTC LOGIC
  // ==========================================

  const startMyStreamAndCall = async () => {
    const stream = await getMediaStream();
    if (stream) {
      initiateCall(stream);
      setCallStatus("calling");
    }
  };

  const getMediaStream = async () => {
    try {
      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: { width: 1280, height: 720, frameRate: 30, facingMode: 'user' },
      });
      setLocalStream(stream);
      localStreamRef.current = stream;
      return stream;
    } catch (err) {
      console.error('Error accessing media devices:', err);
      return null;
    }
  };

  const setupPeerConnection = (stream) => {
    if (peerConnectionRef.current) return;

    const pc = new RTCPeerConnection(rtcConfig);
    peerConnectionRef.current = pc;

    if (stream) {
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });
    }

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit('ice-candidate', { roomId: roomName, candidate: event.candidate });
      }
    };
  };

  const initiateCall = async (stream) => {
    setupPeerConnection(stream);
    try {
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      socketRef.current.emit('offer', { roomId: roomName, offer });
    } catch (err) {
      console.error("Error creating offer:", err);
    }
  };

  // 👉 NEW: Accept Incoming Call
  const acceptCall = async () => {
    setCallStatus("connected");

    // 1. Start camera
    const stream = await getMediaStream();

    // 2. Setup connection
    setupPeerConnection(stream);

    // 3. Process the stored offer
    try {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(pendingOffer));
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      socketRef.current.emit('answer', { roomId: roomName, answer });

      // 4. Add any ICE candidates that arrived while phone was ringing
      pendingIceCandidates.current.forEach(async (candidate) => {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      });
      pendingIceCandidates.current = []; // clear queue

    } catch (err) {
      console.error("Error accepting call:", err);
    }
  };

  // 👉 NEW: Reject Incoming Call
  const rejectCall = () => {
    socketRef.current.emit('call-rejected', { roomId: roomName });
    endCall();
  };

  // ==========================================
  // CONTROLS & CLEANUP
  // ==========================================

  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !micOn;
      });
      setMicOn(!micOn);
    }
  };

  const toggleCamera = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !cameraOn;
      });
      setCameraOn(!cameraOn);
    }
  };

  // 👉 NEW: Flip Camera
  const flipCamera = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track._switchCamera(); // React Native WebRTC method
      });
    }
  };

  // 👉 NEW: Toggle Loudspeaker
  const toggleSpeaker = () => {
    const nextState = !isSpeakerOn;
    setIsSpeakerOn(nextState);
    InCallManager.setForceSpeakerphoneOn(nextState); // Route audio
  };

  const cleanupMedia = () => {
    if (peerConnectionRef.current) peerConnectionRef.current.close();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (socketRef.current) socketRef.current.disconnect();

    InCallManager.stop(); // Stop audio routing

    peerConnectionRef.current = null;
    localStreamRef.current = null;
  };

  const endCall = () => {
    cleanupMedia();
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] });
    }
  };

  // ==========================================
  // RENDER UI
  // ==========================================

  // 👉 NEW: Ringing UI
  if (callStatus === "ringing") {
    return (
      <SafeAreaView style={styles.ringingContainer}>
        <View style={styles.avatarBigPlaceholder}>
          <Ionicons name="person" size={60} color="#FFF" />
        </View>
        <Text style={styles.incomingText}>Incoming Video Call...</Text>
        <Text style={styles.subText}>Consultant/User is calling</Text>

        <View style={styles.ringingActions}>
          <TouchableOpacity style={[styles.ringingBtn, { backgroundColor: '#EF4444' }]} onPress={rejectCall}>
            <Ionicons name="call" size={32} color="#FFF" style={{ transform: [{ rotate: '135deg' }] }} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.ringingBtn, { backgroundColor: '#10B981' }]} onPress={acceptCall}>
            <Ionicons name="call" size={32} color="#FFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Active Call UI
  return (
    <SafeAreaView style={styles.container}>
      {remoteStream ? (
        <View style={styles.remoteVideoContainer}>
          <RTCView streamURL={remoteStream.toURL()} style={styles.fullscreenVideo} objectFit="cover" />
        </View>
      ) : (
        <View style={styles.waitingContainer}>
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="videocam" size={40} color="#059669" />
          </View>
          <Text style={styles.waitingText}>
            {myRole === "User" ? "Calling..." : "Waiting for Call..."}
          </Text>
          <ActivityIndicator size="large" color="#059669" style={{ marginTop: 20 }} />
        </View>
      )}

      {localStream && cameraOn && (
        <View style={styles.localVideoContainer}>
          <RTCView streamURL={localStream.toURL()} style={styles.localVideo} objectFit="cover" zOrder={1} />
        </View>
      )}

      {/* Control Bar Extended */}
      <View style={styles.controlBar}>
        {/* Flip Camera */}
        <TouchableOpacity style={styles.controlBtn} onPress={flipCamera}>
          <Ionicons name="camera-reverse" size={26} color="#FFF" />
        </TouchableOpacity>

        {/* Mic */}
        <TouchableOpacity style={styles.controlBtn} onPress={toggleMic}>
          <Ionicons name={micOn ? "mic" : "mic-off"} size={26} color={micOn ? "#FFF" : "#EF4444"} />
        </TouchableOpacity>

        {/* End Call */}
        <TouchableOpacity style={styles.endCallBtn} onPress={endCall}>
          <Ionicons name="call" size={26} color="#FFF" />
        </TouchableOpacity>

        {/* Video Camera */}
        <TouchableOpacity style={styles.controlBtn} onPress={toggleCamera}>
          <Ionicons name={cameraOn ? "videocam" : "videocam-off"} size={26} color={cameraOn ? "#FFF" : "#EF4444"} />
        </TouchableOpacity>

        {/* Loudspeaker */}
        <TouchableOpacity style={styles.controlBtn} onPress={toggleSpeaker}>
          <Ionicons name={isSpeakerOn ? "volume-high" : "volume-medium"} size={26} color={isSpeakerOn ? "#10B981" : "#FFF"} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#030712' },
  fullscreenVideo: { width: '100%', height: '100%' },
  remoteVideoContainer: { ...StyleSheet.absoluteFillObject },
  waitingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  avatarPlaceholder: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#1F2937', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  waitingText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  subText: { color: '#9CA3AF', fontSize: 16, marginTop: 8 },
  localVideoContainer: { position: 'absolute', bottom: 120, right: 20, width: 110, height: 150, borderRadius: 16, overflow: 'hidden', backgroundColor: '#1F2937', elevation: 5 },
  localVideo: { width: '100%', height: '100%' },

  // Controls
  controlBar: { position: 'absolute', bottom: 30, left: '5%', right: '5%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(31, 41, 55, 0.85)', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 40 },
  controlBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#374151', justifyContent: 'center', alignItems: 'center' },
  endCallBtn: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center', transform: [{ rotate: '135deg' }] },

  // Ringing UI Styles
  ringingContainer: { flex: 1, backgroundColor: '#111827', justifyContent: 'center', alignItems: 'center' },
  avatarBigPlaceholder: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#374151', justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  incomingText: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  ringingActions: { flexDirection: 'row', justifyContent: 'space-around', width: '60%', marginTop: 60 },
  ringingBtn: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', elevation: 5 },
});