import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// 👉 UPDATE THIS IMPORT PATH TO YOUR ACTUAL FILE
import { AllConsultant } from '../../../../src/services/user';

const { width } = Dimensions.get('window');
const CARD_WIDTH = 160; // Thoda bada kiya premium look ke liye
const SPACING = 16;
const FULL_ITEM_WIDTH = CARD_WIDTH + SPACING;

// --- ✨ SKELETON LOADER COMPONENT ✨ ---
const SkeletonCard = () => {
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
    <Animated.View style={[styles.card, { opacity: pulseAnim }]}>
      <View style={[styles.skeletonBlock, styles.skeletonBadge]} />
      <View style={[styles.skeletonBlock, styles.skeletonAvatar]} />
      <View style={[styles.skeletonBlock, { width: 110, height: 16, marginBottom: 8, borderRadius: 4 }]} />
      <View style={[styles.skeletonBlock, { width: 80, height: 12, marginBottom: 15, borderRadius: 4 }]} />
      <View style={[styles.skeletonBlock, { width: 60, height: 14, marginBottom: 20, borderRadius: 4 }]} />
      <View style={[styles.skeletonBlock, styles.skeletonButton]} />
    </Animated.View>
  );
};

export default function CounselorList() {
  const navigation = useNavigation();
  const scrollX = useRef(new Animated.Value(0)).current;

  const [counselors, setCounselors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getCounselors = async () => {
      try {
        const response = await AllConsultant();
        const dataList = response?.consultants || response?.data?.consultants || response || [];
        setCounselors(dataList);
      } catch (error) {
        console.log("Failed to fetch counselors:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getCounselors();
  }, []);

  // --- Render Single Animated Card ---
  const renderItem = ({ item, index }) => {
    const profileImage = item.image || item.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=F59E0B&color=fff&bold=true`;
    const subtitle = item.subtitle || item.specialization || item.role || 'Expert Consultant';
    const isOnline = item.isOnline !== undefined ? item.isOnline : true; 
    const rating = item.rating || "4.8"; 
    const price = item.price || 500; // Default price

    // 🔥 Card Animation Logic - Active card thoda bada dikhega
    const inputRange = [
      (index - 1) * FULL_ITEM_WIDTH,
      index * FULL_ITEM_WIDTH,
      (index + 1) * FULL_ITEM_WIDTH,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.92, 1, 0.92],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.6, 1, 0.6],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={{ transform: [{ scale }], opacity }}>
        <TouchableOpacity 
          activeOpacity={0.9} 
          style={styles.card}
          onPress={() => navigation.navigate('CounselorProfile', { counselorId: item._id })}
        >
          {/* Top Info Row */}
          <View style={styles.cardHeader}>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color="#F27A21" />
              <Text style={styles.ratingText}>{rating}</Text>
            </View>
            <View style={styles.experienceBadge}>
                <MaterialCommunityIcons name="check-decagram" size={14} color="#10B981" />
            </View>
          </View>

          {/* Profile Image & Online Status */}
          <View style={styles.avatarWrapper}>
            <View style={styles.imageRing}>
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            </View>
            {isOnline && (
              <View style={styles.onlineBadgeContainer}>
                <View style={styles.onlineBadge} />
              </View>
            )}
          </View>

          {/* User Info */}
          <Text style={styles.nameText} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.subtitleText} numberOfLines={1}>{subtitle}</Text>

          {/* Price Section */}
          <Text style={styles.priceText}>
            ₹{price} <Text style={styles.priceSub}>/ session</Text>
          </Text>

          {/* Action Button */}
          <TouchableOpacity
            style={styles.chatButton}
            activeOpacity={0.8}
            onPress={(e) => {
              e.stopPropagation(); 
              navigation.navigate("BookingScreen", {
                consultantId: item._id,
                consultantName: item.name,
                amount: price,
                role: "Consultant"
              });
            }}
          >
            <Text style={styles.chatButtonText}>Book Now</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{marginLeft: 4, marginTop: 1}} />
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.sectionTitle}>Top Consultants</Text>
          <Text style={styles.sectionSubtitle}>Guiding your path forward</Text>
        </View>
        <TouchableOpacity 
          activeOpacity={0.6} 
          style={styles.viewAllBtn}
          onPress={() => navigation.navigate("Appointments")}
        > 
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons name="arrow-forward" size={14} color="#F27A21" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.listPadding}
        >
          {[1, 2, 3].map((key) => (
            <SkeletonCard key={key} />
          ))}
        </ScrollView>
      ) : counselors.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="people" size={32} color="#D1D5DB" />
          </View>
          <Text style={styles.emptyText}>No experts available right now.</Text>
        </View>
      ) : (
        <Animated.FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={counselors}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listPadding}
          snapToInterval={FULL_ITEM_WIDTH}
          decelerationRate="fast"
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
    backgroundColor: '#FAFAFA', 
    paddingVertical: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A', // Slate 900
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748B', // Slate 500
    marginTop: 2,
    fontWeight: '500',
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  viewAllText: {
    fontSize: 13,
    color: '#D97706', // Dark Amber
    fontWeight: '700',
    marginRight: 4,
  },
  emptyContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '500',
  },
  listPadding: {
    paddingHorizontal: 20,
    paddingBottom: 12, // Extra padding shadows ke liye
  },
  
  // --- CARD STYLES ---
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 24, 
    padding: 10,
    marginRight: SPACING,
    alignItems: 'center',
    // 🔥 Soft, elegant shadow
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.06, shadowRadius: 15 },
      android: { elevation: 5 },
      web: { boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.05)' },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#B45309', // Darkest Amber
    marginLeft: 4,
  },
  experienceBadge: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  imageRing: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FDE68A', // Outer amber ring
    borderStyle: 'dashed', // Thoda astrological/premium vibe
  },
  profileImage: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#F3F4F6',
  },
  onlineBadgeContainer: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF', // White cutout effect
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineBadge: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981', // Emerald Green
  },
  nameText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 1,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitleText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F27A21',
    marginBottom: 5,
  },
  priceSub: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F27A21',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 30, // Pill shape for modern look
    width: '100%',
    // 🔥 Glowing Button Shadow
    ...Platform.select({
      ios: { shadowColor: '#F27A21', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 8 },
      android: { elevation: 6, shadowColor: '#F27A21' },
      web: { boxShadow: '0px 6px 15px rgba(242, 122, 33, 0.3)' },
    }),
  },
  chatButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // --- SKELETON STYLES ---
  skeletonBlock: {
    backgroundColor: '#F3F4F6',
  },
  skeletonBadge: {
    width: 50,
    height: 24,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  skeletonAvatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    marginBottom: 16,
  },
  skeletonButton: {
    width: '100%',
    height: 48, // Matches new pill shape height
    borderRadius: 24,
  },
});