import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Animated, 
  Platform,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ==========================================
// 1. SKELETON ANIMATION COMPONENT
// ==========================================
const CallSkeleton = () => {
  const fadeAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [fadeAnim]);

  return (
    <View style={styles.card}>
      <Animated.View style={[styles.skeletonAvatar, { opacity: fadeAnim }]} />
      <View style={styles.centerContent}>
        <Animated.View style={[styles.skeletonText, { width: '60%', marginBottom: 8, opacity: fadeAnim }]} />
        <Animated.View style={[styles.skeletonText, { width: '40%', height: 12, opacity: fadeAnim }]} />
      </View>
      <Animated.View style={[styles.skeletonIcon, { opacity: fadeAnim }]} />
    </View>
  );
};

// ==========================================
// 2. HELPER FUNCTION FOR CALL STATUS ICONS
// ==========================================
const getStatusDetails = (status) => {
  switch(status) {
    case 'missed': 
      return { icon: 'arrow-down', color: '#EF4444', text: 'Missed' }; // Red
    case 'incoming': 
      return { icon: 'arrow-down', color: '#10B981', text: 'Incoming' }; // Green
    case 'outgoing': 
      return { icon: 'arrow-up', color: '#6B7280', text: 'Outgoing' }; // Gray
    default: 
      return { icon: 'call-outline', color: '#6B7280', text: 'Unknown' };
  }
};

// ==========================================
// 3. REAL CALL LIST ITEM COMPONENT
// ==========================================
const CallItem = ({ item, onCallPress, onProfilePress }) => {
  const statusDetails = getStatusDetails(item.status);
  
  // Audio ya Video call ke hisab se right side wala icon decide karna
  const ActionIcon = item.type === 'video' ? 'videocam' : 'call';
  const actionColor = item.type === 'video' ? '#8B5CF6' : '#3B82F6'; // Purple for Video, Blue for Audio

  return (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.7}
      onPress={() => onProfilePress(item)} 
    >
      {/* Left: Avatar */}
      <Image source={{ uri: item.image }} style={styles.avatar} />

      {/* Center: Name & Call Details */}
      <View style={styles.centerContent}>
        <Text style={[styles.nameText, item.status === 'missed' && { color: '#EF4444' }]} numberOfLines={1}>
          {item.name}
        </Text>
        
        <View style={styles.detailsRow}>
          <Ionicons name={statusDetails.icon} size={14} color={statusDetails.color} />
          <Text style={styles.timeText}>
            {item.time} {item.duration ? `• ${item.duration}` : ''}
          </Text>
        </View>
      </View>

      {/* Right: Action Button (Redial) */}
      <TouchableOpacity 
        style={[styles.actionBtn, { backgroundColor: `${actionColor}15` }]} // 15 is hex for slight opacity
        onPress={() => onCallPress(item)}
      >
        <Ionicons name='videocam' size={22} color='#8B5CF6' />
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.actionBtn, { backgroundColor: `${actionColor}15` }]} // 15 is hex for slight opacity
        onPress={() => onCallPress(item)}
      >
        <Ionicons name='call' size={22} color='#3B82F6' />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

// ==========================================
// 4. MAIN EXPORT COMPONENT
// ==========================================
export default function CallHistoryList({ role = 'User' }) {
  const [isLoading, setIsLoading] = useState(true);

  // Role ke hisab se data badal sakte hain, filhal dummy data common rakha hai
  const DUMMY_CALLS = [
    {
      id: '1',
      name: role === 'User' ? 'Dr. Sarah Lee' : 'Rahul Kumar',
      image: 'https://randomuser.me/api/portraits/women/44.jpg',
      type: 'video', 
      status: 'incoming', 
      time: 'Today, 10:30 AM',
      duration: '15 mins',
    },
    {
      id: '2',
      name: role === 'User' ? 'Amit Patel' : 'Priya S.',
      image: 'https://randomuser.me/api/portraits/men/45.jpg',
      type: 'audio',
      status: 'missed',
      time: 'Yesterday, 04:15 PM',
      duration: null, // Missed call toh duration nahi hogi
    },
    {
      id: '3',
      name: role === 'User' ? 'Neha Gupta' : 'Vikram Singh',
      image: 'https://randomuser.me/api/portraits/women/72.jpg',
      type: 'video',
      status: 'outgoing',
      time: 'Mon, 09:00 AM',
      duration: '45 mins',
    },
    {
      id: '4',
      name: 'Anjali Verma',
      image: 'https://randomuser.me/api/portraits/women/55.jpg',
      type: 'audio',
      status: 'incoming',
      time: 'Sun, 02:00 PM',
      duration: '5 mins',
    },
  ];

  // Simulating 2.5 seconds API loading time
  useEffect(() => {
    const timer = setTimeout(() => { setIsLoading(false); }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeading}>Recent Calls</Text>
      
      {isLoading ? (
        <>
          <CallSkeleton />
          <CallSkeleton />
          <CallSkeleton />
          <CallSkeleton />
          <CallSkeleton />
          <CallSkeleton />
          <CallSkeleton />
        </>
      ) : (
        <FlatList
          data={DUMMY_CALLS}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false} // True kar dein agar ye screen ka akela component hai
          renderItem={({ item }) => (
            <CallItem 
              item={item} 
              onProfilePress={(user) => console.log('Open profile for:', user.name)}
              onCallPress={(user) => console.log(`Starting ${user.type} call with:`, user.name)} 
            />
          )}
        />
      )}
    </View>
  );
}

// ==========================================
// STYLES
// ==========================================
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 15,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4 },
      android: { elevation: 2 },
      web: { boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.03)' },
    }),
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E5E7EB',
    marginRight: 15,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 6,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },

  // --- Skeleton Styles ---
  skeletonAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E5E7EB',
    marginRight: 15,
  },
  skeletonText: {
    height: 14,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
  },
  skeletonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    marginLeft: 10,
  },
});