import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// ==========================================
// MOCK DATA (Isay apne API data se replace karlena)
// ==========================================
const MOCK_SESSIONS = [
  {
    _id: '1',
    studentName: 'Aarav Sharma',
    avatar: 'https://ui-avatars.com/api/?name=Aarav+Sharma&background=E5E7EB&color=374151',
    topic: 'Career Counseling',
    date: '2026-03-26T10:00:00.000Z',
    time: '10:00 AM - 11:00 AM',
    status: 'upcoming',
    isStartingSoon: true, // Agar session 15-30 min me start hone wala hai
  },
  {
    _id: '2',
    studentName: 'Priya Verma',
    avatar: 'https://ui-avatars.com/api/?name=Priya+Verma&background=E5E7EB&color=374151',
    topic: 'Mock Interview Prep',
    date: '2026-03-27T14:30:00.000Z',
    time: '02:30 PM - 03:15 PM',
    status: 'upcoming',
    isStartingSoon: false,
  },
  {
    _id: '3',
    studentName: 'Rahul Mehta',
    avatar: 'https://ui-avatars.com/api/?name=Rahul+Mehta&background=E5E7EB&color=374151',
    topic: 'Resume Review',
    date: '2026-03-28T09:00:00.000Z',
    time: '09:00 AM - 09:30 AM',
    status: 'upcoming',
    isStartingSoon: false,
  },
];

const THEME_COLOR = '#10B981';

// ==========================================
// ANIMATED CARD COMPONENT
// ==========================================
const SessionCard = ({ item, index, onJoin, onReschedule }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // 🌟 Staggered Entry Animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 150, // Har card thoda late aayega (Stagger effect)
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        delay: index * 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, fadeAnim, slideAnim]);

  // 🌟 Button Press Animation
  const animatePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
  };
  const animatePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  const sessionDate = new Date(item.date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {/* Starting Soon Badge */}
      {item.isStartingSoon && (
        <View style={styles.startingSoonBadge}>
          <View style={styles.pulsingDot} />
          <Text style={styles.startingSoonText}>Starting Soon</Text>
        </View>
      )}

      {/* Top Row: Info */}
      <View style={styles.topRow}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.infoBlock}>
          <Text style={styles.studentName} numberOfLines={1}>
            {item.studentName}
          </Text>
          <Text style={styles.topicText} numberOfLines={1}>
            {item.topic}
          </Text>
        </View>
        <View style={styles.dateBlock}>
          <Text style={styles.dateText}>{sessionDate}</Text>
        </View>
      </View>

      {/* Middle Row: Time Info */}
      <View style={styles.timeRow}>
        <View style={styles.timeTag}>
          <Ionicons name="time-outline" size={16} color={THEME_COLOR} />
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
        <View style={styles.durationTag}>
          <Ionicons name="videocam-outline" size={16} color="#6B7280" />
          <Text style={styles.durationText}>Video Call</Text>
        </View>
      </View>

      {/* Bottom Row: Actions */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.secondaryButton}
          activeOpacity={0.7}
          onPress={() => onReschedule(item)}
        >
          <Text style={styles.secondaryButtonText}>Reschedule</Text>
        </TouchableOpacity>

        <Animated.View style={{ flex: 1, transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.9}
            onPressIn={animatePressIn}
            onPressOut={animatePressOut}
            onPress={() => onJoin(item)}
          >
            <Ionicons name="log-in-outline" size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Join Session</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

// ==========================================
// MAIN LIST COMPONENT
// ==========================================
export default function UpcomingSessions() {
  const [sessions, setSessions] = useState(MOCK_SESSIONS);

  const handleJoin = (session) => {
    console.log("Navigating to Video Call for:", session._id);
    // navigation.navigate('VideoCall', { roomId: session._id });
  };

  const handleReschedule = (session) => {
    console.log("Rescheduling session for:", session.studentName);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Upcoming Sessions</Text>
        <TouchableOpacity style={styles.headerAction}>
          <Text style={styles.headerActionText}>View All</Text>
        </TouchableOpacity>
      </View>

      {/* List Section */}
      <FlatList
        data={sessions}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <SessionCard
            item={item}
            index={index}
            onJoin={handleJoin}
            onReschedule={handleReschedule}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-clear-outline" size={60} color="#D1D5DB" />
            <Text style={styles.emptyText}>No upcoming sessions</Text>
            <Text style={styles.emptySubText}>Your schedule is clear for now!</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// ==========================================
// STYLES
// ==========================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6', // Light gray background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  headerActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME_COLOR,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  startingSoonBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginRight: 6,
  },
  startingSoonText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DC2626',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F3F4F6',
  },
  infoBlock: {
    flex: 1,
    marginLeft: 14,
  },
  studentName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  topicText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  dateBlock: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  timeText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  durationTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    marginLeft: 4,
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12, // React Native 0.71+ supports gap
  },
  secondaryButton: {
    flex: 0.45,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: THEME_COLOR,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
});