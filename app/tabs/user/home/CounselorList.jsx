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
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// 👉 UPDATE THIS IMPORT PATH TO YOUR ACTUAL FILE
import { AllConsultant } from '../../../../src/services/user';

const { width } = Dimensions.get('window');
const CARD_WIDTH = 160;
const SPACING = 16;

// --- ✨ SKELETON LOADER COMPONENT ✨ ---
const SkeletonCard = () => {
  const pulseAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.5, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <Animated.View style={[styles.card, { opacity: pulseAnim }]}>
      {/* Rating Badge Skeleton */}
      <View style={[styles.skeletonBlock, styles.skeletonBadge]} />
      
      {/* Profile Avatar Skeleton */}
      <View style={[styles.skeletonBlock, styles.skeletonAvatar]} />
      
      {/* Text Skeletons */}
      <View style={[styles.skeletonBlock, { width: 100, height: 16, marginBottom: 8, borderRadius: 4 }]} />
      <View style={[styles.skeletonBlock, { width: 70, height: 12, marginBottom: 20, borderRadius: 4 }]} />
      
      {/* Button Skeleton */}
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
    const profileImage = item.image || item.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=0D8ABC&color=fff` ;
    const subtitle = item.subtitle || item.specialization || item.role || 'Expert Consultant';
    const isOnline = item.isOnline !== undefined ? item.isOnline : true; 
    const rating = item.rating || "4.8"; 

    // 🔥 Card Animation Logic
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
      outputRange: [0.7, 1, 0.7],
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
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={styles.ratingText}>{rating}</Text>
            </View>
            {/* <TouchableOpacity style={styles.likeButton}>
              <Ionicons name="heart-outline" size={16} color="#9CA3AF" />
            </TouchableOpacity> */}
          </View>

          {/* Profile Image & Online Status */}
          <View style={styles.imageContainer}>
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
            {isOnline && <View style={styles.onlineBadge} />}
          </View>

          {/* User Info */}
          <Text style={styles.nameText} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.subtitleText} numberOfLines={1}>{subtitle}</Text>

          {/* Action Button */}
          <TouchableOpacity
            style={styles.chatButton}
            activeOpacity={0.8}
            onPress={(e) => {
              e.stopPropagation(); 
              navigation.navigate("BookingScreen", {
                consultantId: item._id,
                consultantName: item.name,
                amount: item.price || 500
              });
            }}
          >
            <Text style={styles.chatButtonText}>Book Now</Text>
            <Ionicons name="arrow-forward" size={14} color="#FFFFFF" style={{marginLeft: 4}} />
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

      {/* Content Rendering */}
      {isLoading ? (
        // ✨ Rendering Skeleton List
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
          <Ionicons name="people-outline" size={40} color="#D1D5DB" />
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
          snapToInterval={CARD_WIDTH + SPACING}
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
    backgroundColor: '#FAFAFA', // Slight background to make white cards pop
    paddingVertical: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 0.3,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '500',
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  viewAllText: {
    fontSize: 13,
    color: '#4F46E5',
    fontWeight: '700',
    marginRight: 4,
  },
  emptyContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  emptyText: {
    marginTop: 12,
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
  },
  listPadding: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  
  // --- CARD STYLES ---
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 24, 
    padding: 16,
    marginRight: SPACING,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...Platform.select({
      ios: { shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 12 },
      android: { elevation: 6 },
      web: { boxShadow: '0px 8px 24px rgba(79, 70, 229, 0.08)' },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D97706',
    marginLeft: 4,
  },
  likeButton: {
    padding: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    borderWidth: 3,
    borderColor: '#EEF2FF',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#10B981',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  nameText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14, 
    width: '100%',
    ...Platform.select({
      ios: { shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 6 },
      android: { elevation: 4 },
    }),
  },
  chatButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // --- SKELETON STYLES ---
  skeletonBlock: {
    backgroundColor: '#E5E7EB',
  },
  skeletonBadge: {
    width: 50,
    height: 24,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  skeletonAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  skeletonButton: {
    width: '100%',
    height: 40,
    borderRadius: 14,
  },
});