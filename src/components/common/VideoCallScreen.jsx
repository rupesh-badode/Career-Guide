import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { io } from 'socket.io-client';
import { RTCPeerConnection, RTCIceCandidate, RTCSessionDescription, mediaDevices, RTCView } from 'react-native-webrtc';
import { backendConfig } from '../../constants/MainContent';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux'; // 👉 REDUX IMPORT (Bahut zaroori)

const SOCKET_URL = backendConfig.origin;

export default function VideoCallScreen({ route }) {
  // const { roomName } = route.params;
  const roomName  = "room_123";


  const navigation = useNavigation();

  // 👉 REDUX SE ROLE NIKALNA
  const { userData } = useSelector((state) => state.auth);
  const myRole = userData?.role; 
  console.log("myrole",myRole)// "User" ya "Consultant"

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);

  // REFS (Inka use instantly data access karne ke liye hota hai)
  const socketRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null); // Fix for stream availability

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

    const startLocalStream = async () => {
      try {
        const stream = await mediaDevices.getUserMedia({
          audio: true,
          video: { width: 1280, height: 720, frameRate: 30, facingMode: 'user' },
        });
        
        setLocalStream(stream);
        localStreamRef.current = stream; // Stream instantly Ref mein daal do

        // 👉 CALLER vs RECEIVER LOGIC
        if (myRole === "User") {
          console.log("Role: User -> Initiating Call (Sending Offer)");
          initiateCall(stream);
        } else {
          console.log("Role: Consultant -> Waiting for Incoming Offer");
          // Consultant kuch nahi karega, bas socket par offer aane ka wait karega
        }
      } catch (err) {
        console.error('Error accessing media devices:', err);
      }
    };

    startLocalStream();

    // ==========================================
    // SOCKET LISTENERS
    // ==========================================

    socketRef.current.on('offer', async (offer) => {
      console.log("Received Offer from Caller");
      
      // Safety check: Setup PC using the Ref stream
      if (!peerConnectionRef.current) {
        setupPeerConnection(localStreamRef.current);
      }

      try {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        
        socketRef.current.emit('answer', { roomId: roomName, answer });
      } catch (err) {
        console.error("Error handling offer:", err);
      }
    });

    socketRef.current.on('answer', async (answer) => {
      console.log("Received Answer from Receiver");
      if (peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (err) {
          console.error("Error setting remote answer:", err);
        }
      }
    });

    socketRef.current.on('ice-candidate', async (candidate) => {
      if (peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.log('Error adding ICE candidate', e);
        }
      }
    });

    return () => {
      cleanupMedia();
    };
  }, [roomName]); 

  // ==========================================
  // WEBRTC LOGIC
  // ==========================================

  const setupPeerConnection = (stream) => {
    // 👉 DOUBLE CONNECTION GUARD: Agar pehle se bana hai, toh wapas mat banao
    if (peerConnectionRef.current) {
      console.log("Peer connection already exists. Skipping setup.");
      return; 
    }

    const pc = new RTCPeerConnection(rtcConfig);
    peerConnectionRef.current = pc;

    if (stream) {
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });
    }

    pc.ontrack = (event) => {
      console.log("Received Remote Track!");
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

  const cleanupMedia = () => {
    if (peerConnectionRef.current) peerConnectionRef.current.close();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (socketRef.current) socketRef.current.disconnect();
    
    // Clear refs
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

  // UI Code (Same as before)
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
          <Text style={styles.waitingText}>Secure Room Setup</Text>
          <Text style={styles.subText}>Waiting for the other person to join...</Text>
          <ActivityIndicator size="large" color="#059669" style={{ marginTop: 20 }} />
        </View>
      )}

      {localStream && cameraOn && (
        <View style={styles.localVideoContainer}>
          <RTCView streamURL={localStream.toURL()} style={styles.localVideo} objectFit="cover" zOrder={1} />
        </View>
      )}

      <View style={styles.controlBar}>
        <TouchableOpacity style={styles.controlBtn} onPress={toggleMic}>
          <Ionicons name={micOn ? "mic" : "mic-off"} size={26} color={micOn ? "#FFF" : "#EF4444"} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.endCallBtn} onPress={endCall}>
          <Ionicons name="call" size={26} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlBtn} onPress={toggleCamera}>
          <Ionicons name={cameraOn ? "videocam" : "videocam-off"} size={26} color={cameraOn ? "#FFF" : "#EF4444"} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Styles remain unchanged
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#030712' },
  fullscreenVideo: { width: '100%', height: '100%' },
  remoteVideoContainer: { ...StyleSheet.absoluteFillObject },
  waitingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  avatarPlaceholder: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#1F2937', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  waitingText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  subText: { color: '#9CA3AF', fontSize: 16, marginTop: 8 },
  localVideoContainer: { position: 'absolute', bottom: 120, right: 20, width: 110, height: 150, borderRadius: 16, overflow: 'hidden', backgroundColor: '#1F2937' },
  localVideo: { width: '100%', height: '100%' },
  controlBar: { position: 'absolute', bottom: 30, left: '10%', right: '10%', flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', backgroundColor: 'rgba(31, 41, 55, 0.85)', paddingVertical: 16, borderRadius: 40 },
  controlBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#374151', justifyContent: 'center', alignItems: 'center' },
  endCallBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center', transform: [{ rotate: '135deg' }] },
});