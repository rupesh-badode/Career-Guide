import React, { useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, Modal, TouchableOpacity, 
  Animated, Image, Dimensions, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function IncomingCallModal({ 
  visible, 
  callerName = "Unknown Caller", 
  callerAvatar, 
  callType = "video", // 'audio' ya 'video'
  onAccept, 
  onReject 
}) {
  // 🔥 Pulse Animation for Ringing Effect
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (visible) {
      // 1. Slide Up Modal
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();

      // 2. Pulse Animation for Avatar Loop
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true })
        ])
      ).start();
    } else {
      // Slide Down when closed
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        
        {/* Animated Card */}
        <Animated.View style={[styles.modalCard, { transform: [{ translateY: slideAnim }] }]}>
          
          <Text style={styles.incomingText}>
            Incoming {callType === 'video' ? 'Video' : 'Audio'} Call...
          </Text>

          {/* Glowing Avatar */}
          <View style={styles.avatarWrapper}>
            <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }] }]} />
            <Image 
              source={{ uri: callerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(callerName)}&background=10B981&color=fff` }} 
              style={styles.avatar} 
            />
          </View>

          <Text style={styles.callerName} numberOfLines={1}>{callerName}</Text>
          <Text style={styles.subText}>Consultation Session</Text>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            {/* Reject Button */}
            <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={onReject} activeOpacity={0.8}>
              <Ionicons name="call" size={28} color="#FFF" style={{ transform: [{ rotate: '135deg' }] }} />
            </TouchableOpacity>

            {/* Accept Button */}
            <TouchableOpacity style={[styles.actionBtn, styles.acceptBtn]} onPress={onAccept} activeOpacity={0.8}>
              <Ionicons name={callType === 'video' ? "videocam" : "call"} size={28} color="#FFF" />
            </TouchableOpacity>
          </View>
        </Animated.View>

      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)', // Dark blur effect
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: width * 0.85,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingVertical: 35,
    paddingHorizontal: 20,
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20 },
      android: { elevation: 15 }
    })
  },
  incomingText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 30,
  },
  avatarWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  pulseCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(16, 185, 129, 0.2)', // Light Green pulse
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    zIndex: 10,
  },
  callerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 6,
  },
  subText: {
    fontSize: 15,
    color: '#9CA3AF',
    marginBottom: 35,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '75%',
  },
  actionBtn: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5 },
      android: { elevation: 8 }
    })
  },
  rejectBtn: {
    backgroundColor: '#EF4444',
  },
  acceptBtn: {
    backgroundColor: '#10B981',
  },
});