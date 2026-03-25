import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  FlatList, 
  TouchableOpacity, 
  Animated,
  RefreshControl,
  Platform,
  TextInput // 👈 Added TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// ⚠️ UPDATE THIS IMPORT PATH TO YOUR ACTUAL FILE
import { getMentorBooking } from '../../../../src/services/user'; 
import { useNavigation } from '@react-navigation/native';

const THEME_COLOR = '#4F46E5'; // Premium Indigo

// --- Horizontal Chat Skeleton Loader ---
const ChatSkeletonItem = () => {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <View style={styles.chatItemContainer}>
      <Animated.View style={[styles.skeletonAvatar, { opacity: pulseAnim }]} />
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Animated.View style={[styles.skeletonText, { opacity: pulseAnim, width: '50%', height: 16 }]} />
          <Animated.View style={[styles.skeletonText, { opacity: pulseAnim, width: '15%', height: 12 }]} />
        </View>
        <Animated.View style={[styles.skeletonText, { opacity: pulseAnim, width: '70%', height: 14, marginTop: 8 }]} />
      </View>
    </View>
  );
};

export default function MentorChatList() {
  const [chatList, setChatList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 👉 NEW: Search States
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigation = useNavigation();

  // --- Fetch API Data ---
  const fetchBookedMentors = async () => {
    try {
      const res = await getMentorBooking();
      let bookingsArray = [];
      if (Array.isArray(res)) {
        bookingsArray = res;
      } else if (res && res.data && Array.isArray(res.data)) {
        bookingsArray = res.data;
      } else if (res && res.bookings && Array.isArray(res.bookings)) {
        bookingsArray = res.bookings;
      }
      setChatList(bookingsArray);
    } catch (error) {
      console.error("Chat list fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookedMentors();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookedMentors();
  };

  // 👉 NEW: Filtered Data Logic
  const filteredChatList = chatList.filter((item) => {
    const mentor = item.mentor || item.mentorId || item;
    const mentorName = mentor.name || '';
    // Case-insensitive search
    return mentorName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // --- UI Components ---
  const renderChatItem = ({ item }) => {
    const mentor = item.mentor || item.mentorId || item; 
    const sessionDate = item.date ? new Date(item.date).toLocaleDateString() : 'Upcoming Session';

    return (
      <TouchableOpacity 
        style={styles.chatItemContainer}
        activeOpacity={0.7}
        onPress={() => {
          navigation.navigate('ChatRoom', { 
            mentorId: mentor._id, 
            mentorName: mentor.name,
            mentorImage: mentor.profilePicture || mentor.image
          });
        }}
      >
        <View style={styles.avatarContainer}>
          <Image 
            source={{ uri: mentor.profilePicture || mentor.image || 'https://via.placeholder.com/150' }} 
            style={styles.avatar} 
          />
          <View style={styles.onlineIndicator} />
        </View>

        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.mentorName} numberOfLines={1}>
              {mentor.name || 'Mentor Name'}
            </Text>
            <Text style={styles.timeText}>
              {item.time || '10:00 AM'}
            </Text>
          </View>

          <View style={styles.chatSubHeader}>
            <Text style={styles.lastMessage} numberOfLines={1}>
              Tap to start chatting regarding your session on {sessionDate}...
            </Text>
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>1</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.mainContainer}>

      {/* 👉 UPDATED: Dynamic Header */}
      <View style={styles.header}>
        {isSearching ? (
          // Search Mode Active
          <View style={styles.searchContainer}>
            <TouchableOpacity 
              onPress={() => {
                setIsSearching(false);
                setSearchQuery(''); // Clear search when closing
              }}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#111827" />
            </TouchableOpacity>
            
            <TextInput
              style={styles.searchInput}
              placeholder="Search mentor by name..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={true} // Keyboard apne aap khul jayega
            />
            
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 5 }}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          // Normal Default Header
          <>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={24} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Messages</Text>
            <TouchableOpacity 
              style={styles.headerIcon}
              onPress={() => setIsSearching(true)} // Search bar kholne ke liye
            >
              <Ionicons name="search-outline" size={24} color="#111827" />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* List Area */}
      {loading ? (
        <View style={styles.listContent}>
           <ChatSkeletonItem />
           <ChatSkeletonItem />
           <ChatSkeletonItem />
           <ChatSkeletonItem />
           <ChatSkeletonItem />
        </View>
      ) : (
        <FlatList
          data={filteredChatList} // 👉 UPDATED: Normal chatList ki jagah filteredChatList use kiya hai
          keyExtractor={(item, index) => item._id || index.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={renderChatItem}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              colors={[THEME_COLOR]} 
              tintColor={THEME_COLOR} 
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name={searchQuery ? "search-outline" : "chatbubbles-outline"} size={40} color={THEME_COLOR} />
                </View>
                <Text style={styles.emptyTitle}>
                  {searchQuery ? 'No Results Found' : 'No Messages Yet'}
                </Text>
                <Text style={styles.emptyText}>
                  {searchQuery 
                    ? `No mentor found matching "${searchQuery}"` 
                    : 'When you book a session with a mentor, you can chat with them here.'}
                </Text>
                {!searchQuery && (
                  <TouchableOpacity 
                    style={styles.findMentorBtn}
                    onPress={() => navigation.navigate('AllMentor')}
                  >
                    <Text style={styles.findMentorBtnText}>Find a Mentor</Text>
                  </TouchableOpacity>
                )}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    minHeight: 60, // UI jhatka na khaye search toggle hone pe
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerIcon: {
    padding: 5,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  // 👉 NEW: Search bar styles
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  backButton: {
    padding: 5,
  },
  listContent: {
    flexGrow: 1,
  },
  
  // --- Chat Item Styles ---
  chatItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EEF2FF',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981', 
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  chatInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  mentorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    marginRight: 10,
  },
  timeText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  chatSubHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
    marginRight: 15,
  },
  unreadBadge: {
    backgroundColor: THEME_COLOR,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },

  // --- Skeleton Styles ---
  skeletonAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EEF2FF',
    marginRight: 15,
  },
  skeletonText: {
    backgroundColor: '#EEF2FF',
    borderRadius: 4,
  },

  // --- Empty State Styles ---
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    marginTop: 100,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25,
  },
  findMentorBtn: {
    backgroundColor: THEME_COLOR,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: THEME_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  findMentorBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});