import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Animated,
  Platform,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { myBooking } from '../../../../src/services/consultantAPI'; // Ensure path is correct
import { useNavigation } from '@react-navigation/native';

const THEME_COLOR = '#F27A21';

// ==========================================
// ANIMATED LARGE CARD COMPONENT
// ==========================================

const ChatListItem = ({ item, index, onPressChat, onPressVideoCall, onPressAudioCall }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;

  // Separate scale animations for Audio and Video buttons
  const scaleAnimAudio = useRef(new Animated.Value(1)).current;
  const scaleAnimVideo = useRef(new Animated.Value(1)).current;

  // ✨ Staggered Entry Animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 150,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        delay: index * 150,
        useNativeDriver: true,
      })
    ]).start();
  }, [index, fadeAnim, translateY]);

  // ✨ Button Press Animations
  const animatePressIn = (anim) => Animated.spring(anim, { toValue: 0.94, useNativeDriver: true }).start();
  const animatePressOut = (anim) => Animated.spring(anim, { toValue: 1, useNativeDriver: true }).start();

  // Extracting Data Safely
  const student = item?.studentId || {};
  const name = student?.name || 'Unknown User';
  const avatar = student?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff`;

  // Format Date
  const bookingDate = new Date(item.date);
  const formattedDate = bookingDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const isConfirmed = item.status === 'confirmed';
  const statusColor = isConfirmed ? "#32943a" : '#505050';
  const statusBg = isConfirmed ? '#ECFDF5' : '#FEF3C7';

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY }] }}>
      <View style={styles.card}>

        {/* TOP SECTION: Student Info & Status */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.profileSection} activeOpacity={0.8}>
            <Image source={{ uri: avatar }} style={styles.avatar} />
            <View style={styles.nameContainer}>
              <Text style={styles.nameText} numberOfLines={1}>{name}</Text>
              {student?.neetScore && (
                <Text style={styles.scoreText}>NEET Score: {student.neetScore}</Text>
              )}
            </View>
          </TouchableOpacity>

          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.status ? item.status.toUpperCase() : 'PENDING'}
            </Text>
          </View>
        </View>

        {/* MIDDLE SECTION: Schedule Box */}
        <View style={styles.scheduleBox}>
          <View style={styles.scheduleItem}>
            <Ionicons name="calendar" size={18} color={THEME_COLOR} />
            <View style={styles.scheduleTextContainer}>
              <Text style={styles.scheduleLabel}>Date</Text>
              <Text style={styles.scheduleValue}>{formattedDate}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.scheduleItem}>
            <Ionicons name="time" size={18} color={THEME_COLOR} />
            <View style={styles.scheduleTextContainer}>
              <Text style={styles.scheduleLabel}>Time</Text>
              <Text style={styles.scheduleValue}>{item.time || 'TBA'}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.scheduleItem}>
            <Ionicons name="hourglass" size={18} color={THEME_COLOR} />
            <View style={styles.scheduleTextContainer}>
              <Text style={styles.scheduleLabel}>Duration</Text>
              <Text style={styles.scheduleValue}>{item.duration ? `${item.duration} Min` : 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* BOTTOM SECTION: Actions */}
        {isConfirmed ? (
          <View>
            {/* Top row of actions: Message */}
            <TouchableOpacity
              style={[styles.actionBtn, styles.msgBtn, { marginBottom: 12 }]}
              activeOpacity={0.7}
              onPress={() => onPressChat(item)}
            >
              <Ionicons name="chatbubbles" size={20} color={THEME_COLOR} />
              <Text style={styles.msgBtnText}>Message Student</Text>
            </TouchableOpacity>

            {/* Bottom row of actions: Audio & Video Call */}
            <View style={styles.callActionRow}>

              {/* Audio Call Button */}
              <Animated.View style={{ flex: 1, transform: [{ scale: scaleAnimAudio }] }}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.audioCallBtn]}
                  activeOpacity={0.9}
                  onPressIn={() => animatePressIn(scaleAnimAudio)}
                  onPressOut={() => animatePressOut(scaleAnimAudio)}
                  onPress={() => onPressAudioCall(item)}
                >
                  <Ionicons name="call" size={18} color={THEME_COLOR} />
                  <Text style={styles.audioCallBtnText}>Audio Call</Text>
                </TouchableOpacity>
              </Animated.View>

              {/* Video Call Button */}
              <Animated.View style={{ flex: 1, transform: [{ scale: scaleAnimVideo }] }}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.callBtn]}
                  activeOpacity={0.9}
                  onPressIn={() => animatePressIn(scaleAnimVideo)}
                  onPressOut={() => animatePressOut(scaleAnimVideo)}
                  onPress={() => onPressVideoCall(item)}
                >
                  <Ionicons name="videocam" size={18} color="#FFF" />
                  <Text style={styles.callBtnText}>Video Call</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        ) : (
          <View style={styles.pendingFooter}>
            <Ionicons name="information-circle-outline" size={16} color="#9CA3AF" />
            <Text style={styles.pendingFooterText}>Action buttons will appear once confirmed</Text>
          </View>
        )}

      </View>
    </Animated.View>
  );
};

// ==========================================
// MAIN SCREEN COMPONENT
// ==========================================
export default function ChatListScreen({ searchQuery = "" }) {
  const navigation = useNavigation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAPI = async () => {
    try {
      setLoading(true);
      const res = await myBooking();
      if (res.success) {
        const apiData = res.data?.data || res.data || [];
        setData(apiData);
      } else {
        console.error("API Error message:", res.message);
      }
    } catch (err) {
      console.error("Fetch API Err", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAPI();
  }, []);

  const filteredData = data.filter((item) => {
    if (!searchQuery) return true; // Agar search khali hai, toh sab dikhao

    // ChatListItem ke hisaab se student ka naam nikal rahe hain
    const name = item?.studentId?.name || 'Unknown User';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Upcoming Sessions</Text>
        <Text style={styles.headerSubtitle}>Manage your Sessions</Text>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={THEME_COLOR} />
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <ChatListItem
              item={item}
              index={index}
              onPressChat={(selectedItem) => {
                navigation.navigate('ChatScreen', {
                  receiverId: selectedItem?.studentId?._id,
                  receiverName: selectedItem?.studentId?.name,
                  receiverAvatar: selectedItem?.studentId?.profilePicture,
                  consultationId: selectedItem?._id,
                  senderId: selectedItem?.consultantId,
                });
              }}
              // 👉 NAYA: Audio Call Navigation
              onPressAudioCall={(selectedItem) => {
                navigation.navigate('AudioCall', { // Make sure name matches your stack navigator
                  roomName: `room_${selectedItem?._id}`,
                });
              }}
              // 👉 EXISTING: Video Call Navigation
              onPressVideoCall={(selectedItem) => {
                navigation.navigate('VideoCall', {
                  roomName: `room_${selectedItem?._id}`,
                });
              }}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-clear-outline" size={60} color="#D1D5DB" />
              <Text style={styles.emptyText}>No upcoming bookings</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

// ==========================================
// STYLES
// ==========================================
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3F4F6' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15, backgroundColor: '#F3F4F6' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#111827' },
  headerSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  listContainer: { paddingHorizontal: 16, paddingBottom: 100, paddingTop: 10 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 3 }
    })
  },
  // Button Styles Updates
  actionRow: { flexDirection: 'row', gap: 12 },
  callActionRow: { flexDirection: 'row', gap: 12 }, // Naya row audio/video ke liye
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12 },
  
  // Message Button (Full width now)
  msgBtn: { width: '100%', backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  msgBtnText: { fontSize: 15, fontWeight: '700', color: '#4B5563', marginLeft: 8 },
  
  // Audio Call Button (Outline Style)
  audioCallBtn: { flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: THEME_COLOR },
  audioCallBtnText: { fontSize: 14, fontWeight: '700', color: THEME_COLOR, marginLeft: 6 },
  
  // Video Call Button (Solid Style)
  callBtn: { flex: 1, backgroundColor: THEME_COLOR, shadowColor: THEME_COLOR, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 4 },
  callBtnText: { fontSize: 14, fontWeight: '700', color: '#FFF', marginLeft: 6 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  profileSection: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 10 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#F3F4F6' },
  nameContainer: { marginLeft: 12, flex: 1 },
  nameText: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
  scoreText: { fontSize: 12, fontWeight: '600', color: THEME_COLOR },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  scheduleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB', // Light gray/greenish tint
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#F3F4F6'
  },
  scheduleItem: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  scheduleTextContainer: { marginLeft: 8 },
  scheduleLabel: { fontSize: 11, color: '#6B7280', fontWeight: '500', marginBottom: 2 },
  scheduleValue: { fontSize: 13, color: '#111827', fontWeight: '700' },
  divider: { width: 1, height: '80%', backgroundColor: '#E5E7EB', marginHorizontal: 10 },
  actionRow: { flexDirection: 'row', gap: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12 },
  msgBtn: { flex: 0.45, backgroundColor: '#fdf9ec', borderWidth: 1, borderColor: '#fae9d1' },
  msgBtnText: { fontSize: 15, fontWeight: '700', color: THEME_COLOR, marginLeft: 8 },
  callBtn: { flex: 1, backgroundColor: THEME_COLOR, shadowColor: THEME_COLOR, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 4 },
  callBtnText: { fontSize: 15, fontWeight: '700', color: '#FFF', marginLeft: 8 },
  pendingFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB', paddingVertical: 12, borderRadius: 10 },
  pendingFooterText: { fontSize: 12, color: '#6B7280', marginLeft: 6, fontStyle: 'italic' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { marginTop: 12, fontSize: 16, color: '#9CA3AF', fontWeight: '500' },
});