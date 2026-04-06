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
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { myBooking } from '../../../../src/services/consultantAPI'; // Ensure path is correct
import { useNavigation } from '@react-navigation/native';

const THEME_COLOR = '#F27A21';
const FILTER_OPTIONS = ['All', 'Confirmed', 'Pending', 'Completed', 'Cancelled'];

// ==========================================
// ANIMATED LARGE CARD COMPONENT
// ==========================================

const ChatListItem = ({ item, index, onPressChat, onPressVideoCall, onPressAudioCall }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;

  const scaleAnimAudio = useRef(new Animated.Value(1)).current;
  const scaleAnimVideo = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 100, // Slightly faster staggered entry
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        delay: index * 100,
        useNativeDriver: true,
      })
    ]).start();
  }, [index, fadeAnim, translateY]);

  const animatePressIn = (anim) => Animated.spring(anim, { toValue: 0.94, useNativeDriver: true }).start();
  const animatePressOut = (anim) => Animated.spring(anim, { toValue: 1, useNativeDriver: true }).start();

  const student = item?.studentId || {};
  const name = student?.name || 'Unknown User';
  const avatar = student?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff`;

  const bookingDate = new Date(item.date || Date.now());
  const formattedDate = bookingDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const isConfirmed = item.status === 'confirmed';
  const statusColor = isConfirmed ? "#32943a" : (item.status === 'cancelled' ? '#DC2626' : '#D97706');
  const statusBg = isConfirmed ? '#ECFDF5' : (item.status === 'cancelled' ? '#FEF2F2' : '#FEF3C7');

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY }] }}>
      <View style={styles.card}>
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

          <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.status ? item.status.toUpperCase() : 'PENDING'}
            </Text>
          </View>
        </View>

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

        {isConfirmed ? (
          <View>
            <TouchableOpacity
              style={[styles.actionBtn, styles.msgBtn, { marginBottom: 12 }]}
              activeOpacity={0.7}
              onPress={() => onPressChat(item)}
            >
              <Ionicons name="chatbubbles" size={20} color={THEME_COLOR} />
              <Text style={styles.msgBtnText}>Message Student</Text>
            </TouchableOpacity>

            <View style={styles.callActionRow}>
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
  
  // Filtering & Modal State
  const [activeFilter, setActiveFilter] = useState('All');
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);

  const fetchAPI = async () => {
    try {
      setLoading(true);
      // Dummy data fallback for testing without API
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

  // Applied Filtering Logic (Search + Top Filter)
  const filteredData = data.filter((item) => {
    const name = item?.studentId?.name || 'Unknown User';
    const matchesSearch = !searchQuery || name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const status = (item?.status || 'pending').toLowerCase();
    const matchesFilter = activeFilter === 'All' || status === activeFilter.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* Header with Filter Icon */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Upcoming Sessions</Text>
          <Text style={styles.headerSubtitle}>Manage your Sessions</Text>
        </View>
        <TouchableOpacity 
          style={styles.filterIconBtn} 
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="options" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* Horizontal Top Filter Chips */}
      {/* <View style={styles.filterWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
          {FILTER_OPTIONS.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setActiveFilter(filter)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View> */}

      {/* List Content */}
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
              onPressAudioCall={(selectedItem) => {
                navigation.navigate('AudioCall', { roomName: `room_${selectedItem?._id}` });
              }}
              onPressVideoCall={(selectedItem) => {
                navigation.navigate('VideoCall', { roomName: `room_${selectedItem?._id}` });
              }}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-clear-outline" size={60} color="#D1D5DB" />
              <Text style={styles.emptyText}>No bookings found</Text>
            </View>
          }
        />
      )}

      {/* Modern Bottom-Sheet Modal for Filters */}
      <Modal
        visible={isFilterModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setFilterModalVisible(false)}>
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Sessions</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color="#4B5563" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>By Status</Text>
            <View style={styles.modalOptionsGrid}>
              {FILTER_OPTIONS.map((filter) => (
                <TouchableOpacity
                  key={`modal-${filter}`}
                  style={[
                    styles.modalOptionBtn,
                    activeFilter === filter && styles.modalOptionBtnActive
                  ]}
                  onPress={() => {
                    setActiveFilter(filter);
                    setFilterModalVisible(false); // Auto close on select
                  }}
                >
                  <Text style={[
                    styles.modalOptionText,
                    activeFilter === filter && styles.modalOptionTextActive
                  ]}>
                    {filter}
                  </Text>
                  {activeFilter === filter && (
                    <Ionicons name="checkmark-circle" size={20} color={THEME_COLOR} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity 
              style={styles.modalApplyBtn} 
              onPress={() => setFilterModalVisible(false)}
            >
              <Text style={styles.modalApplyText}>Show Results</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

// ==========================================
// STYLES
// ==========================================
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3F4F6' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Header
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingHorizontal: 20, 
    paddingTop: 0, 
    paddingBottom: 10, 
    backgroundColor: '#F3F4F6' 
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#111827' },
  headerSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  filterIconBtn: {
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },

  // Top Filter Chips
  filterWrapper: { paddingBottom: 10 },
  filterContainer: { paddingHorizontal: 16, gap: 10 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: '#FFF0E5', // Light theme color tint
    borderColor: THEME_COLOR,
  },
  filterChipText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  filterChipTextActive: { color: THEME_COLOR },

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

  // Button Styles
  callActionRow: { flexDirection: 'row', gap: 12 }, 
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12 },
  msgBtn: { width: '100%', backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  msgBtnText: { fontSize: 15, fontWeight: '700', color: '#4B5563', marginLeft: 8 },
  audioCallBtn: { flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: THEME_COLOR },
  audioCallBtnText: { fontSize: 14, fontWeight: '700', color: THEME_COLOR, marginLeft: 6 },
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
    backgroundColor: '#F9FAFB', 
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
  
  pendingFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB', paddingVertical: 12, borderRadius: 10 },
  pendingFooterText: { fontSize: 12, color: '#6B7280', marginLeft: 6, fontStyle: 'italic' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { marginTop: 12, fontSize: 16, color: '#9CA3AF', fontWeight: '500' },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 350,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  closeBtn: { padding: 4 },
  modalSubtitle: { fontSize: 14, fontWeight: '600', color: '#6B7280', marginBottom: 12 },
  modalOptionsGrid: { gap: 10, marginBottom: 24 },
  modalOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalOptionBtnActive: {
    backgroundColor: '#FFF0E5',
    borderColor: THEME_COLOR,
  },
  modalOptionText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  modalOptionTextActive: { color: THEME_COLOR },
  modalApplyBtn: {
    backgroundColor: THEME_COLOR,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalApplyText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});