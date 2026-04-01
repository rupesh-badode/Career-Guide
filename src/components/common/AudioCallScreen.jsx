import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { io } from 'socket.io-client';
import { RTCPeerConnection, RTCIceCandidate, RTCSessionDescription, mediaDevices } from 'react-native-webrtc';
import InCallManager from 'react-native-incall-manager';
import { backendConfig } from '../../constants/MainContent';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';

const SOCKET_URL = backendConfig.origin;

export default function AudioCallScreen({ route }) {
  const roomName = "room_123"; // Replace with route.params.roomName
  const navigation = useNavigation();

  const { userData } = useSelector((state) => state.auth);
  const myRole = userData?.role;

  // ==========================================
  // STATES
  // ==========================================
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null); // Kept in case you need it later for audio visualizers

  // Controls States
  const [micOn, setMicOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false); // Default false for earpiece routing

  // Call Status States (idle -> calling/waiting -> ringing -> connected)
  const [callStatus, setCallStatus] = useState(myRole === "User" ? "calling" : "waiting");
  const [pendingOffer, setPendingOffer] = useState(null);

  // ==========================================
  // REFS
  // ==========================================
  const socketRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const pendingIceCandidates = useRef([]);

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

    // Start InCallManager for Audio Routing (Set to 'audio' for voice calls)
    InCallManager.start({ media: 'audio' });

    // Agar Caller (User) hai, toh turant stream start karke call lagao
    if (myRole === "User") {
      startMyStreamAndCall();
    }

    // ==========================================
    // SOCKET LISTENERS
    // ==========================================

    socketRef.current.on('offer', async (offer) => {
      console.log("Received Offer");
      if (myRole !== "User") {
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
        pendingIceCandidates.current.push(candidate);
      }
    });

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
        video: false, // 👉 No video requested
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

  const acceptCall = async () => {
    setCallStatus("connected");

    const stream = await getMediaStream();
    setupPeerConnection(stream);

    try {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(pendingOffer));
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      socketRef.current.emit('answer', { roomId: roomName, answer });

      pendingIceCandidates.current.forEach(async (candidate) => {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      });
      pendingIceCandidates.current = [];

    } catch (err) {
      console.error("Error accepting call:", err);
    }
  };

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

  const toggleSpeaker = () => {
    const nextState = !isSpeakerOn;
    setIsSpeakerOn(nextState);
    InCallManager.setForceSpeakerphoneOn(nextState);
  };

  const cleanupMedia = () => {
    if (peerConnectionRef.current) peerConnectionRef.current.close();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (socketRef.current) socketRef.current.disconnect();

    InCallManager.stop();

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

  if (callStatus === "ringing") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <View style={styles.avatarBigPlaceholder}>
            <Ionicons name="person" size={60} color="#FFF" />
          </View>
          <Text style={styles.titleText}>Incoming Audio Call...</Text>
          <Text style={styles.subText}>Consultant/User is calling</Text>
        </View>

        <View style={styles.ringingActions}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#EF4444' }]} onPress={rejectCall}>
            <Ionicons name="call" size={32} color="#FFF" style={{ transform: [{ rotate: '135deg' }] }} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#10B981' }]} onPress={acceptCall}>
            <Ionicons name="call" size={32} color="#FFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centerContent}>
        {/* Active Call Avatar */}
        <View style={[styles.avatarBigPlaceholder, callStatus === 'connected' && styles.avatarConnected]}>
          <Ionicons name="person" size={80} color="#FFF" />
        </View>
        <Text style={styles.titleText}>Consultant / User</Text>
        
        {/* Status Text */}
        {callStatus === "connected" ? (
          <Text style={styles.statusTextSuccess}>Connected</Text>
        ) : (
          <View style={{ alignItems: 'center', marginTop: 10 }}>
            <Text style={styles.subText}>
              {myRole === "User" ? "Calling..." : "Waiting for Call..."}
            </Text>
            <ActivityIndicator size="small" color="#F27A21" style={{ marginTop: 10 }} />
          </View>
        )}
      </View>

      {/* Control Bar Extended (Simplified for Audio) */}
      <View style={styles.controlBar}>
        {/* Speakerphone */}
        <TouchableOpacity style={styles.controlBtn} onPress={toggleSpeaker}>
          <Ionicons name={isSpeakerOn ? "volume-high" : "volume-medium"} size={28} color={isSpeakerOn ? "#10B981" : "#FFF"} />
        </TouchableOpacity>

        {/* End Call (Center & Bigger) */}
        <TouchableOpacity style={styles.endCallBtn} onPress={endCall}>
          <Ionicons name="call" size={32} color="#FFF" style={{ transform: [{ rotate: '135deg' }] }} />
        </TouchableOpacity>

        {/* Mic */}
        <TouchableOpacity style={styles.controlBtn} onPress={toggleMic}>
          <Ionicons name={micOn ? "mic" : "mic-off"} size={28} color={micOn ? "#FFF" : "#EF4444"} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#030712', // Deep dark background
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  avatarBigPlaceholder: { 
    width: 140, 
    height: 140, 
    borderRadius: 70, 
    backgroundColor: '#1F2937', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 30,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  avatarConnected: {
    borderWidth: 3,
    borderColor: '#10B981', // Green ring when connected
  },
  titleText: { 
    color: '#F9FAFB', 
    fontSize: 26, 
    fontWeight: 'bold',
    marginBottom: 8
  },
  subText: { 
    color: '#9CA3AF', 
    fontSize: 18 
  },
  statusTextSuccess: {
    color: '#10B981',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8
  },

  // Ringing specific
  ringingActions: { 
    flexDirection: 'row', 
    justifyContent: 'space-evenly', 
    width: '100%', 
    marginBottom: 60 
  },
  actionBtn: { 
    width: 75, 
    height: 75, 
    borderRadius: 37.5, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 5 
  },

  // Audio Controls
  controlBar: { 
    flexDirection: 'row', 
    justifyContent: 'space-evenly', 
    alignItems: 'center', 
    width: '85%',
    backgroundColor: 'rgba(31, 41, 55, 0.9)', 
    paddingVertical: 20, 
    paddingHorizontal: 20, 
    borderRadius: 50,
    marginBottom: 40
  },
  controlBtn: { 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    backgroundColor: '#374151', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  endCallBtn: { 
    width: 75, 
    height: 75, 
    borderRadius: 37.5, 
    backgroundColor: '#EF4444', 
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 5
  },
});