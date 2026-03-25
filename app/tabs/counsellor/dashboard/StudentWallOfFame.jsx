import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Easing,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const THEME_COLOR = '#10B981';

// ==========================================
// MOCK DATA: STUDENTS ACHIEVEMENTS
// ==========================================
const ACHIEVERS = [
  {
    id: '1',
    name: 'Aarav S.',
    achievement: 'NEET 680',
    icon: 'school',
    image: 'https://ui-avatars.com/api/?name=Aarav+S&background=10B981&color=fff',
    tint: '#ECFDF5', // Light Emerald
  },
  {
    id: '2',
    name: 'Priya V.',
    achievement: 'AIIMS Delhi',
    icon: 'medal',
    image: 'https://ui-avatars.com/api/?name=Priya+V&background=3B82F6&color=fff',
    tint: '#EFF6FF', // Light Blue
  },
  {
    id: '3',
    name: 'Rahul M.',
    achievement: 'NEET 655',
    icon: 'star',
    image: 'https://ui-avatars.com/api/?name=Rahul+M&background=F59E0B&color=fff',
    tint: '#FFFBEB', // Light Amber
  },
  {
    id: '4',
    name: 'Kavya S.',
    achievement: 'Maulana Azad',
    icon: 'trophy',
    image: 'https://ui-avatars.com/api/?name=Kavya+S&background=8B5CF6&color=fff',
    tint: '#F5F3FF', // Light Purple
  },
  {
    id: '5',
    name: 'Ishaan P.',
    achievement: 'Top Ranker',
    icon: 'ribbon',
    image: 'https://ui-avatars.com/api/?name=Ishaan+P&background=EF4444&color=fff',
    tint: '#FEF2F2', // Light Red
  },
  {
    id: '6',
    name: 'Sneha K.',
    achievement: 'Got Dream Medical',
    icon: 'thumbs-up',
    image: 'https://ui-avatars.com/api/?name=Sneha+K&background=EC4899&color=fff',
    tint: '#FDF2F8', // Light Pink
  },
];

// Calculation for scattered layout responsive widths
const CARD_WIDTH = (width - 60) / 2; // Approx half screen minus padding/gap

// ==========================================
// FLOATING CARD COMPONENT
// ==========================================
const FloatingCard = ({ item, index }) => {
  // Har card ke liye alag animated value
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 🎲 Creating variations in speed and distance for natural floating look
    const duration = 2500 + (index % 3) * 500; // 2.5s se 3.5s tak
    const travelDistance = 15 + (index % 2) * 5; // 15px se 20px tak move karega

    const startFloating = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: -travelDistance, // Up
            duration: duration,
            easing: Easing.inOut(Easing.sin), // Smooth wave-like motion
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0, // Back down
            duration: duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    // Alag start times dene ke liye (taaki sab ek sath upar na jayein)
    const randomStartDelay = (index % 4) * 300;
    const timeoutId = setTimeout(startFloating, randomStartDelay);

    return () => clearTimeout(timeoutId);
  }, [floatAnim, index]);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          transform: [{ translateY: floatAnim }],
          // 🎲 Applying scattered layout: Odd/Even styling
          marginTop: index % 2 !== 0 ? 30 : 0, // Odd items are pushed down
          alignSelf: index % 2 !== 0 ? 'flex-end' : 'flex-start', // Zigzag align
        },
      ]}
    >
      {/* Icon with Glowing Tint Background */}
      <View style={[styles.iconBadge, { backgroundColor: item.tint }]}>
        <Ionicons name={item.icon} size={18} color={THEME_COLOR} />
      </View>

      {/* Student Image */}
      <Image source={{ uri: item.image }} style={styles.avatar} />

      {/* Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.studentName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.achievementText} numberOfLines={1}>{item.achievement}</Text>
      </View>

      {/* Tiny graphical sparkles */}
      <View style={[styles.sparkle, styles.sparkleTop]} />
      <View style={[styles.sparkle, styles.sparkleBottom]} />
    </Animated.View>
  );
};

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function StudentWallOfFame() {
  return (
    <View style={styles.container}>
      {/* BACKGROUND GRAPHIC (Soft Glow) */}
      <View style={styles.bgGlow} />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.titleBadge}>WALL OF FAME</Text>
        <Text style={styles.heading}>Our Star Performers</Text>
        <Text style={styles.subHeading}>Students guided by our expert consultants, now studying in top institutions.</Text>
      </View>

      {/* SCATTERED FLOATING CARDS CONTAINER */}
      <View style={styles.wallContainer}>
        {ACHIEVERS.map((item, index) => (
          <FloatingCard key={item.id} item={item} index={index} />
        ))}
      </View>

    </View>
  );
}

// ==========================================
// STYLES
// ==========================================
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF', // Clean white base
    paddingVertical: 60,
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  
  // --- Bg Glow ---
  bgGlow: {
    position: 'absolute',
    top: '30%',
    left: '10%',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: (width * 0.8) / 2,
    backgroundColor: 'rgba(16, 185, 129, 0.03)', // Subtle Emerald Glow
  },

  // --- Header ---
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  titleBadge: {
    fontSize: 12,
    fontWeight: '800',
    color: '#374151',
    letterSpacing: 2,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 10,
  },
  heading: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subHeading: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 8,
    paddingHorizontal: 10,
  },

  // --- Wall Layout (Scattered Grid) ---
  wallContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 20, // Modern gap between items
  },

  // --- Floating Card ---
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    position: 'relative', // For sparkle absolute positioning
    // Soft premium shadow
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10 },
      android: { elevation: 3 },
    }),
    borderWidth: 1,
    borderColor: '#F9FAFB',
  },

  // --- Card Elements ---
  iconBadge: {
    position: 'absolute',
    top: -12,
    right: -12,
    width: 36,
    height: 36,
    borderRadius: 12, // Modern Squircle
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 4 },
    }),
    zIndex: 10,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 15,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  infoContainer: {
    alignItems: 'center',
    width: '100%',
  },
  studentName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 3,
  },
  achievementText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME_COLOR, // Using Primary Emerald
  },

  // --- Extra Graphics (Sparkles) ---
  sparkle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FCD34D', // Gold/Amber Sparkle
    opacity: 0.6,
  },
  sparkleTop: {
    top: 25,
    left: 20,
  },
  sparkleBottom: {
    bottom: 25,
    right: 20,
  },
});