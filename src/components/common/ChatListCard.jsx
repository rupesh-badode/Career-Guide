import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Platform,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

// ==========================================
// 1. SKELETON ANIMATION COMPONENT (UPDATED PERFECT LAYOUT)
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
      <View style={styles.cardContent}>
        {/* LEFT COLUMN */}
        <View style={styles.leftColumn}>
          <Animated.View style={[styles.skeletonAvatar, { opacity: fadeAnim }]} />
          <Animated.View style={[styles.skeletonBadge, { opacity: fadeAnim }]} />
        </View>

        {/* RIGHT COLUMN */}
        <View style={styles.rightColumn}>
          <View style={styles.headerRow}>
            <Animated.View style={[styles.skeletonText, { width: '60%', height: 18, opacity: fadeAnim }]} />
            <Animated.View style={[styles.skeletonBadge, { width: 50, height: 20, opacity: fadeAnim }]} />
          </View>
          
          <Animated.View style={[styles.skeletonText, { width: '40%', height: 14, marginTop: 4, marginBottom: 12, opacity: fadeAnim }]} />
          
          {/* Info Grid Box (Exact match with real card) */}
          <View style={styles.infoGrid}>
            <View style={styles.infoCol}>
              <Animated.View style={[styles.skeletonText, { width: '80%', height: 12, opacity: fadeAnim }]} />
              <Animated.View style={[styles.skeletonText, { width: '60%', height: 12, marginTop: 10, opacity: fadeAnim }]} />
            </View>
            <View style={styles.infoCol}>
              <Animated.View style={[styles.skeletonText, { width: '80%', height: 12, opacity: fadeAnim }]} />
              <Animated.View style={[styles.skeletonText, { width: '70%', height: 12, marginTop: 10, opacity: fadeAnim }]} />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      {/* BOTTOM ROW (3 Buttons layout) */}
      <View style={styles.bottomRow}>
        <Animated.View style={[styles.skeletonButton, { opacity: fadeAnim }]} />
        <Animated.View style={[styles.skeletonButton, { opacity: fadeAnim }]} />
        <Animated.View style={[styles.skeletonIconButton, { opacity: fadeAnim }]} />
      </View>
    </View>
  );
};


// ==========================================
// 2. REAL BOOKING CARD COMPONENT
// ==========================================
export const BookingCard = ({ item, themeColor = "#F59E0B", onActionPress, onCardPress }) => {
  const consultant = item?.consultantId;
  const bookingDate = item?.date ? new Date(item.date).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  }) : 'N/A';

  const navigation = useNavigation();

  // Status checks
  const isConfirmed = item?.status === 'confirmed';
  const isPaid = item?.paymentStatus === 'paid';
  const isKycVerified = consultant?.isKycVerified;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => onCardPress && onCardPress(item)}
    >
      <View style={styles.cardContent}>
        {/* LEFT COLUMN: Avatar & Rating */}
        <View style={styles.leftColumn}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: consultant?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(consultant?.name)}&background=0D8ABC&color=fff` }}
              style={styles.image}
            />
            {consultant?.isActive && <View style={styles.onlineDot} />}
          </View>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text style={styles.ratingText}>
              {consultant?.averageRating || 0}
            </Text>
          </View>
        </View>

        {/* RIGHT COLUMN: Info & Details */}
        <View style={styles.rightColumn}>
          {/* Header: Name, KYC & Status */}
          <View style={styles.headerRow}>
            <View style={styles.nameContainer}>
              <Text style={styles.nameText} numberOfLines={1}>
                {consultant?.name || 'Unknown Consultant'}
              </Text>
              {isKycVerified && (
                <Ionicons name="checkmark-circle" size={16} color="#10B981" style={{ marginLeft: 4 }} />
              )}
            </View>
            <View style={[styles.statusBadge, { backgroundColor: isConfirmed ? '#D1FAE5' : '#FEF2F2' }]}>
              <Text style={[styles.statusText, { color: isConfirmed ? '#065F46' : '#991B1B' }]}>
                {item?.status?.toUpperCase() || 'PENDING'}
              </Text>
            </View>
          </View>

          {/* Subheader: Specialization */}
          <Text style={styles.titleText}>{consultant?.specialization || 'Consultant'}</Text>

          {/* Info Grid (Date, Time, Duration, Amount) */}
          <View style={styles.infoGrid}>
            <View style={styles.infoCol}>
              <View style={styles.iconInfo}>
                <Ionicons name="calendar-outline" size={14} color={themeColor} />
                <Text style={styles.infoText}>{bookingDate}</Text>
              </View>
              <View style={[styles.iconInfo, { marginTop: 6 }]}>
                <Ionicons name="time-outline" size={14} color={themeColor} />
                <Text style={styles.infoText}>{item?.time || 'N/A'}</Text>
              </View>
            </View>
            
            <View style={styles.infoCol}>
              <View style={styles.iconInfo}>
                <Ionicons name="hourglass-outline" size={14} color={themeColor} />
                <Text style={styles.infoText}>{item?.duration ? `${item.duration} mins` : 'N/A'}</Text>
              </View>
              <View style={[styles.iconInfo, { marginTop: 6 }]}>
                <Ionicons name="wallet-outline" size={14} color={themeColor} />
                <Text style={styles.infoText}>₹{item?.amount || 0} </Text>
                {isPaid && (
                  <Text style={styles.paidText}>(Paid)</Text>
                )}
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      {/* ==========================================
          ACTION BUTTONS ROW 
      ========================================== */}
      <View style={styles.bottomRow}>
        {isConfirmed ? (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton, { borderColor: themeColor }]}
              activeOpacity={0.7}
              onPress={() => {
                navigation.navigate('AudioCall', {
                  roomName: `room_${item?._id}`,
                  consultantName: consultant?.name
                });
              }}
            >
              <Ionicons name="call" size={18} color={themeColor} />
              <Text style={[styles.actionButtonText, { color: themeColor }]}>Audio</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton, { backgroundColor: themeColor }]}
              activeOpacity={0.7}
              onPress={() => {
                navigation.navigate('VideoCall', {
                  roomName: `room_${item?._id}`,
                  consultantName: consultant?.name
                });
              }}
            >
              <Ionicons name="videocam" size={18} color="#FFFFFF" />
              <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Video</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: '#F3F4F6' }]}
              onPress={() => onActionPress && onActionPress(item)}
            >
               <Ionicons name="chatbubble-ellipses" size={20} color={themeColor} />
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.pendingActionContainer}>
            <Text style={styles.pendingActionText}>Waiting for confirmation...</Text>
          </View>
        )}
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
  isRefreshing = false, 
  onRefresh,            
  onScroll,
  onActionPress,
  customThemeColor,
  contentPaddingTop,
}) {

  const role = useSelector((state) => state.auth?.role);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState(data);
  const primaryColor = customThemeColor || (role === 'Consultant' ? '#F59E0B' : '#F59E0B');

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
        <Ionicons name="calendar-clear-outline" size={48} color="#D1D5DB" />
        <Text style={styles.emptyText}>No bookings found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.FlatList
        data={filteredData} 
        keyExtractor={(item) => item?._id || Math.random().toString()}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        refreshControl={
           <RefreshControl 
             refreshing={isRefreshing}
             onRefresh={onRefresh}
             tintColor={primaryColor} // Spinner color
             colors={[primaryColor]} // Android spinner color
           />
        }
        contentContainerStyle={{
          paddingTop: contentPaddingTop,
          paddingBottom: 100
        }}
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

// ==========================================
// STYLES
// ==========================================
const styles = StyleSheet.create({
  container: { 
    paddingHorizontal: 16, 
    marginTop: 10 
  },
  emptyContainer: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 150 
  },
  emptyText: { 
    color: '#6B7280', 
    fontSize: 16, 
    marginTop: 12,
    fontWeight: '500'
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 3 }
    })
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
  },
  leftColumn: { 
    width: 70, 
    alignItems: 'center', 
    marginRight: 16 
  },
  imageContainer: { 
    position: 'relative', 
    marginBottom: 10 
  },
  image: { 
    width: 64, 
    height: 64, 
    borderRadius: 32, 
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#F9FAFB'
  },
  onlineDot: { 
    position: 'absolute', 
    bottom: 2, 
    right: 2, 
    width: 14, 
    height: 14, 
    borderRadius: 7, 
    backgroundColor: '#10B981', 
    borderWidth: 2, 
    borderColor: '#FFFFFF' 
  },
  ratingBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFFBEB', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEF3C7'
  },
  ratingText: { 
    fontSize: 11, 
    color: '#D97706', 
    fontWeight: '700', 
    marginLeft: 4 
  },
  rightColumn: { 
    flex: 1 
  },
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 4 
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8
  },
  nameText: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#111827', 
    flexShrink: 1
  },
  statusBadge: { 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 12 
  },
  statusText: { 
    fontSize: 10, 
    fontWeight: '700',
    letterSpacing: 0.5
  },
  titleText: { 
    fontSize: 13, 
    color: '#6B7280', 
    marginBottom: 12,
    fontWeight: '500'
  },
  infoGrid: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 10,
    gap: 12,
  },
  infoCol: {
    flex: 1,
  },
  iconInfo: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  infoText: { 
    fontSize: 12, 
    color: '#374151', 
    marginLeft: 6, 
    fontWeight: '600' 
  },
  paidText: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '700',
    marginLeft: 4
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    width: '100%'
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    paddingHorizontal: 16,
    gap: 10,
    backgroundColor: '#FFFFFF'
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  primaryButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2, 
  },
  secondaryButton: {
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  pendingActionContainer: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8
  },
  pendingActionText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontStyle: 'italic'
  },
  // ==========================================
  // SKELETON STYLES (Perfectly matching the real card)
  // ==========================================
  skeletonAvatar: { 
    width: 64, 
    height: 64, 
    borderRadius: 32, 
    backgroundColor: '#E5E7EB', 
    marginBottom: 10 
  },
  skeletonBadge: { 
    width: 48, 
    height: 20, 
    borderRadius: 12, 
    backgroundColor: '#E5E7EB' 
  },
  skeletonText: { 
    borderRadius: 6, 
    backgroundColor: '#E5E7EB' 
  },
  skeletonButton: { 
    flex: 1, 
    height: 40, 
    borderRadius: 10, 
    backgroundColor: '#E5E7EB' 
  },
  skeletonIconButton: {
    width: 40, 
    height: 40, 
    borderRadius: 10, 
    backgroundColor: '#E5E7EB'
  },
});