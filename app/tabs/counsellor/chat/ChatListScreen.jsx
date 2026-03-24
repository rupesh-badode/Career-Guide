import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Animated,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { myBooking } from '../../../../src/services/consultantAPI'; // Apne path ke hisaab se check kar lena
import { useNavigation } from '@react-navigation/native';

// ==========================================
// ANIMATED LIST ITEM COMPONENT
// ==========================================
const ChatListItem = ({ item, index, onPressChat, onPressProfile, onPressVideoCall }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100, // Stagger effect
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      })
    ]).start();
  }, [index, fadeAnim, translateY]);

  // Extracting details with fallbacks
  const student = item?.studentId || {};
  const name = student?.name || 'Unknown User';
  const avatar = student?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff`;

  // Format the date (e.g., "14 Mar")
  const bookingDate = new Date(item.date);
  const formattedDate = bookingDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  // CHECK: Kya booking confirmed hai?
  const isConfirmed = item.status === 'confirmed';
  const statusColor = isConfirmed ? '#10B981' : '#F59E0B'; 

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY }] }}>
      <View style={styles.chatItem}>
        
        {/* TOP ROW: Avatar & Info (Poora Clickable Chat ke liye) */}
        <TouchableOpacity 
          style={styles.topRow} 
          activeOpacity={0.7}
          onPress={() => onPressChat(item)}
        >
          {/* Profile Picture (Alag se clickable Profile ke liye) */}
          <TouchableOpacity
            style={styles.avatarContainer}
            activeOpacity={0.8}
            onPress={(e) => {
              e.stopPropagation(); // Ye child click ko parent tak jane se rokega
              onPressProfile(item);
            }} 
          >
            <Image source={{ uri: avatar }} style={styles.avatar} />
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          </TouchableOpacity>

          {/* Name & Booking Info */}
          <View style={styles.chatInfo}>
            <Text style={styles.chatName} numberOfLines={1}>{name}</Text>
            <View style={styles.messageRow}>
              <Ionicons
                name={isConfirmed ? "checkmark-done" : "time-outline"}
                size={16}
                color={statusColor}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.chatMessage} numberOfLines={1}>
                Booking: {item.time} ({item.status})
              </Text>
            </View>
          </View>

          {/* Date */}
          <View style={styles.chatMeta}>
            <Text style={styles.chatDate}>{formattedDate}</Text>
          </View>
        </TouchableOpacity>

        {/* BOTTOM ROW: Action Buttons (Message & Video Call) */}
        {isConfirmed ? (
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.msgButton]} 
              activeOpacity={0.8}
              onPress={() => onPressChat(item)}
            >
              <Ionicons name="chatbubbles" size={16} color="#3B82F6" />
              <Text style={styles.msgButtonText}>Message</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.videoButton]} 
              activeOpacity={0.8}
              onPress={() => onPressVideoCall(item)}
            >
              <Ionicons name="videocam" size={16} color="#FFFFFF" />
              <Text style={styles.videoButtonText}>Join Call</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Pending status ke liye message */
          <View style={styles.pendingNote}>
            <Text style={styles.pendingNoteText}>Buttons will appear once confirmed</Text>
          </View>
        )}

      </View>
    </Animated.View>
  );
};

// ==========================================
// MAIN SCREEN COMPONENT
// ==========================================
export default function ChatListScreen() {
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

  return (
    <SafeAreaView style={styles.safeArea}>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item._id}
          // Yahan paddingBottom di gayi hai taaki aakhiri item tab bar ke upar rahe
          contentContainerStyle={[styles.listContainer, { paddingBottom: 100 }]}
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
                  consultationId: selectedItem?._id
                });
              }}
              
              onPressProfile={(selectedItem) => {
                navigation.navigate('StudentProfile', {
                  studentData: selectedItem.studentId, 
                  bookingData: {
                    status: selectedItem.status,
                    date: selectedItem.date,
                    time: selectedItem.time
                  }
                });
              }}

              onPressVideoCall={(selectedItem) => {
                navigation.navigate('VideoCall', {
                  roomName: `room_${selectedItem?._id}`, 
                });
              }}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={50} color="#D1D5DB" />
              <Text style={styles.emptyText}>No bookings found.</Text>
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
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB', 
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  listContainer: {
    paddingTop: 10,
  },
  chatItem: {
    paddingTop: 15,
    paddingBottom: 10,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12, 
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E5E7EB',
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  chatInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  chatName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatMessage: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  chatMeta: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    marginLeft: 10,
  },
  chatDate: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6'
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    flex: 0.48, 
  },
  msgButton: {
    backgroundColor: '#EFF6FF', 
  },
  msgButtonText: {
    color: '#3B82F6', 
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 14,
  },
  videoButton: {
    backgroundColor: '#10B981', 
  },
  videoButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#9CA3AF',
  },
  pendingNote: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    alignItems: 'center',
  },
  pendingNoteText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
});