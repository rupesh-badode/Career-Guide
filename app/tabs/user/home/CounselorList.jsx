import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Animated,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// 👉 UPDATE THIS IMPORT PATH TO YOUR ACTUAL FILE
import { AllConsultant } from '../../../../src/services/user';

const { width } = Dimensions.get('window');
const CARD_WIDTH = 160;
const SPACING = 15;

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
    // Backend fallback mapping
    const profileImage = item.image || item.profilePicture || 'https://randomuser.me/api/portraits/lego/1.jpg';
    const subtitle = item.subtitle || item.specialization || item.role || 'Expert Consultant';
    const isOnline = item.isOnline || true; // Demo ke liye true rakha hai, API se map kar lena
    const rating = item.rating || "4.8"; // Default premium rating for UI

    // 🔥 Animation Logic: Scroll karte waqt halka sa scale aur fade effect
    const inputRange = [
      (index - 2) * (CARD_WIDTH + SPACING),
      index * (CARD_WIDTH + SPACING),
      (index + 2) * (CARD_WIDTH + SPACING),
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.95, 1, 0.95],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={{ transform: [{ scale }], opacity }}>
        <TouchableOpacity 
          activeOpacity={0.9} 
          style={styles.card}
          onPress={() => navigation.navigate('CounselorProfile', { counselorId: item._id })}
        >
          {/* Rating Badge */}
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={10} color="#F59E0B" />
            <Text style={styles.ratingText}>{rating}</Text>
          </View>

          {/* Profile Image & Online Status */}
          <View style={styles.imageContainer}>
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
            {isOnline && <View style={styles.onlineBadge} />}
          </View>

          {/* User Info */}
          <Text style={styles.nameText} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.subtitleText} numberOfLines={1}>{subtitle}</Text>

          {/* Chat/Book Action Button */}
          <TouchableOpacity
            style={styles.chatButton}
            activeOpacity={0.8}
            onPress={(e) => {
              // 👉 e.stopPropagation() zaroori hai taaki Parent Card ka click trigger na ho
              e.stopPropagation(); 
              navigation.navigate("BookingScreen", {
                consultantId: item._id,
                consultantName: item.name,
                amount: item.price || 500
              });
            }}
          >
            <Ionicons name="calendar-outline" size={14} color="#FFFFFF" />
            <Text style={styles.chatButtonText}>Book Now</Text>
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
          <Text style={styles.sectionTitle}>Top Counsellors</Text>
          <Text style={styles.sectionSubtitle}>Find your perfect match</Text>
        </View>
        <TouchableOpacity 
          activeOpacity={0.6} 
          style={styles.viewAllBtn}
          onPress={() => navigation.navigate("Appointments")}
        > 
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons name="chevron-forward" size={14} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      {/* States: Loading, Empty, or List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Fetching experts...</Text>
        </View>
      ) : counselors.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={40} color="#9CA3AF" />
          <Text style={styles.emptyText}>No counselors available right now.</Text>
        </View>
      ) : (
        <Animated.FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={counselors}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listPadding}
          snapToInterval={CARD_WIDTH + SPACING} // Smooth snapping effect
          decelerationRate="fast"
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true } // Better performance ke liye true
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
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 0.2,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  viewAllText: {
    fontSize: 13,
    color: '#4F46E5',
    fontWeight: '700',
    marginRight: 2,
  },
  loadingContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  emptyText: {
    marginTop: 8,
    color: '#6B7280',
    fontSize: 14,
  },
  listPadding: {
    paddingHorizontal: 20,
    paddingBottom: 20, // Shadow cut na ho isliye bottom padding badhai hai
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 20, // Thoda aur gol kiya premium look ke liye
    padding: 16,
    marginRight: SPACING,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...Platform.select({
      ios: { shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 10 },
      android: { elevation: 5 },
      web: { boxShadow: '0px 8px 16px rgba(79, 70, 229, 0.08)' },
    }),
  },
  ratingBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7', // Soft yellow background
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    zIndex: 1,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
    marginLeft: 3,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 12,
    marginTop: 8,
  },
  profileImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#EEF2FF', // Image ke around ek premium border
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  nameText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12, // Button thoda square-ish round rakha hai modern feel ke liye
    width: '100%',
    ...Platform.select({
      ios: { shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4 },
      android: { elevation: 3 },
    }),
  },
  chatButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
});