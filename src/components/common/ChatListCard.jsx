import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Platform,
  FlatList,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

// ==========================================
// 1. SKELETON ANIMATION COMPONENT
// ==========================================
export const SkeletonCard = () => {
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
      <View style={styles.leftColumn}>
        <Animated.View style={[styles.skeletonAvatar, { opacity: fadeAnim }]} />
        <Animated.View style={[styles.skeletonBadge, { opacity: fadeAnim }]} />
      </View>
      <View style={styles.rightColumn}>
        <View style={styles.headerRow}>
          <Animated.View style={[styles.skeletonText, { width: '50%', opacity: fadeAnim }]} />
          <Animated.View style={[styles.skeletonText, { width: '20%', height: 16, opacity: fadeAnim }]} />
        </View>
        <Animated.View style={[styles.skeletonText, { width: '70%', marginTop: 8, opacity: fadeAnim }]} />
        <Animated.View style={[styles.skeletonText, { width: '40%', marginTop: 8, opacity: fadeAnim }]} />
        <View style={styles.bottomRow}>
          <Animated.View style={[styles.skeletonButton, { opacity: fadeAnim }]} />
        </View>
      </View>
    </View>
  );
};

// ==========================================
// 2. REAL BOOKING CARD COMPONENT (API Mapped)
// ==========================================
export const BookingCard = ({ item, themeColor = "#3B82F6", onActionPress, onCardPress }) => {
  const consultant = item?.consultantId;
  const bookingDate = item?.date ? new Date(item.date).toLocaleDateString() : 'N/A';

  const navigation = useNavigation();



  // 👉 Check if booking is confirmed
  const isConfirmed = item?.status === 'confirmed';



  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => onCardPress && onCardPress(item)}
    >
      <View style={styles.leftColumn}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: consultant?.profilePicture || 'https://via.placeholder.com/150' }}
            style={styles.image}
          />
          {consultant?.isActive && <View style={styles.onlineDot} />}
        </View>
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={10} color="#F59E0B" />
          <Text style={styles.ratingText}>
            {consultant?.averageRating || 0}
          </Text>
        </View>
      </View>

      <View style={styles.rightColumn}>
        <View style={styles.headerRow}>
          <Text style={styles.nameText} numberOfLines={1}>
            {consultant?.name || 'Unknown Consultant'}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: isConfirmed ? '#D1FAE5' : '#FEE2E2' }]}>
            <Text style={[styles.statusText, { color: isConfirmed ? '#065F46' : '#991B1B' }]}>
              {item?.status?.toUpperCase() || 'PENDING'}
            </Text>
          </View>
        </View>

        <Text style={styles.titleText}>{consultant?.specialization || 'Consultant'}</Text>

        <View style={styles.infoRow}>
          <View style={styles.iconInfo}>
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text style={styles.infoText}>{bookingDate}</Text>
          </View>
          <View style={[styles.iconInfo, { marginLeft: 15 }]}>
            <Ionicons name="time-outline" size={14} color="#6B7280" />
            <Text style={styles.infoText}>{item?.time || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.bottomRow}>
          {isConfirmed && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: themeColor }]}
              activeOpacity={0.8}
              onPress={() => {
                // 👉 Jaise hi click hoga, VideoCall screen khulegi aur auto-connect hogi
                navigation.navigate('VideoCall', {
                  roomName: `room_${item?._id}`, // Unique ID
                });
              }}
            >
              <Ionicons style={{ color: "#ffff" }} name="videocam" size={18} />
              <Text style={{ color: "#ffff" }}> Join</Text>
            </TouchableOpacity>
          )}

          {/* Message Button - Update here 👇 */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                // Confirmed hai to theme color (Blue defaults), warna gray
                backgroundColor: isConfirmed ? themeColor : '#E5E7EB',
                // Thoda border dete hain disabled state me
                borderColor: isConfirmed ? themeColor : '#D1D5DB',
                borderWidth: isConfirmed ? 0 : 1,
              }
            ]}
            onPress={() => isConfirmed && onActionPress && onActionPress(item)}
            activeOpacity={isConfirmed ? 0.8 : 1}
            disabled={!isConfirmed} // Disable button if not confirmed
          >
            <Ionicons
              name="chatbubbles"
              size={18}
              color={isConfirmed ? "#FFFFFF" : "#9CA3AF"} // Icon gray ho jayega
            />
            <Text
              style={[
                styles.actionButtonText,
                { color: isConfirmed ? "#ffffff" : "#9CA3AF" } // Text gray ho jayega
              ]}
            >
              Message
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ==========================================
// 3. MAIN COMPONENT EXPORT
// ==========================================
export default function ChatListCard({
  data = [],
  isLoading = false,
  onCardPress,
  onActionPress,
  customThemeColor
}) {


  useEffect(() => {
    if (!searchText) {
      setFilteredData(data);
    } else {
      const filtered = data.filter((item) =>
        item?.consultantId?.name
          ?.toLowerCase()
          .includes(searchText.toLowerCase())
      );
      setFilteredData(filtered);
    }
  }, [searchText, data]);

  const role = useSelector((state) => state.auth?.role);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState(data);
  // Theme color dynamically set kiya hai
  const primaryColor = customThemeColor || (role === 'Consultant' ? '#10B981' : '#3B82F6');

  if (isLoading) {
    return (
      <View style={styles.container}>
        {[1, 2, 3].map((key) => <SkeletonCard key={key} />)}
      </View>
    );
  }

  if (!isLoading && data.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <Ionicons name="calendar-outline" size={40} color="#9CA3AF" />
        <Text style={styles.emptyText}>No bookings found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item?._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <BookingCard
            item={item}
            themeColor={primaryColor}
            onCardPress={onCardPress}
            onActionPress={onActionPress}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, marginTop: 100},
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 50 },
  emptyText: { color: '#6B7280', fontSize: 16, marginTop: 10 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
      android: { elevation: 2 }
    })
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  leftColumn: { width: 75, alignItems: 'center', marginRight: 15 },
  imageContainer: { position: 'relative', marginBottom: 8 },
  image: { width: 66, height: 66, borderRadius: 33, backgroundColor: '#E5E7EB' },
  onlineDot: { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: '#10B981', borderWidth: 2, borderColor: '#FFFFFF' },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  ratingText: { fontSize: 10, color: '#D97706', fontWeight: 'bold', marginLeft: 3 },
  rightColumn: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 },
  nameText: { fontSize: 15, fontWeight: 'bold', color: '#111827', flex: 1 },
  statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 9, fontWeight: '800' },
  titleText: { fontSize: 13, color: '#6B7280', marginBottom: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconInfo: { flexDirection: 'row', alignItems: 'center' },
  infoText: { fontSize: 12, color: '#4B5563', marginLeft: 4, fontWeight: '500' },
  // Skeleton Styles
  skeletonAvatar: { width: 66, height: 66, borderRadius: 33, backgroundColor: '#E5E7EB', marginBottom: 10 },
  skeletonBadge: { width: 50, height: 18, borderRadius: 8, backgroundColor: '#E5E7EB' },
  skeletonText: { height: 14, borderRadius: 6, backgroundColor: '#E5E7EB' },
  skeletonButton: { width: 100, height: 32, borderRadius: 20, backgroundColor: '#E5E7EB' },
});