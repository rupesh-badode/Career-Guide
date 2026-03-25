import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const THEME_COLOR = '#10B981';

// ==========================================
// DATA: FEATURES LIST WITH VIBRANT COLORS
// ==========================================
const FEATURES = [
  {
    id: '1',
    title: 'Manage Bookings',
    description: 'Track upcoming sessions and past history in one unified calendar.',
    icon: 'calendar',
    bgColor: '#EFF6FF', // Light Blue
    iconColor: '#3B82F6',
  },
  {
    id: '2',
    title: 'Student Chat',
    description: 'Real-time messaging to clear quick doubts before the session.',
    icon: 'chatbubble-ellipses',
    bgColor: '#ECFDF5', // Light Emerald
    iconColor: '#10B981',
  },
  {
    id: '3',
    title: 'Video Consultation',
    description: 'High-quality integrated video calls for seamless 1-on-1 mentoring.',
    icon: 'videocam',
    bgColor: '#FEF2F2', // Light Rose/Red
    iconColor: '#EF4444',
  },
  {
    id: '4',
    title: 'Earnings Dashboard',
    description: 'Monitor your revenue, pending payouts, and financial growth.',
    icon: 'bar-chart',
    bgColor: '#FFFBEB', // Light Amber/Yellow
    iconColor: '#F59E0B',
  },
  {
    id: '5',
    title: 'Availability Setup',
    description: 'Take control of your time. Set your working hours flexibly.',
    icon: 'time',
    bgColor: '#F5F3FF', // Light Purple
    iconColor: '#8B5CF6',
  },
  {
    id: '6',
    title: 'Profile Management',
    description: 'Showcase your expertise, NEET score, and bio to attract students.',
    icon: 'person-circle',
    bgColor: '#F3F4F6', // Light Gray
    iconColor: '#4B5563',
  },
];

// ==========================================
// ANIMATED FEATURE CARD
// ==========================================
const FeatureCard = ({ item, index }) => {
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

  // 🌟 Staggered Pop-up Animation
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 7,
        delay: index * 100, // Waterfall effect
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, scaleAnim, fadeAnim]);

  // 🌟 Press Interactions
  const animatePressIn = () => Animated.spring(pressAnim, { toValue: 0.95, useNativeDriver: true }).start();
  const animatePressOut = () => Animated.spring(pressAnim, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }, { scale: pressAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPressIn={animatePressIn}
        onPressOut={animatePressOut}
      >
        {/* Colorful Icon Base */}
        <View style={[styles.iconContainer, { backgroundColor: item.bgColor }]}>
          <Ionicons name={item.icon} size={26} color={item.iconColor} />
        </View>
        
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDesc} numberOfLines={3}>
          {item.description}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function ConsultantFeatures() {
  return (
    <View style={styles.container}>
      {/* BACKGROUND GRAPHICS (Subtle Watermarks) */}
      <View style={styles.bgGraphic1} />
      <View style={styles.bgGraphic2} />

      {/* HEADER SECTION */}
      <View style={styles.headerContainer}>
        <View style={styles.pillBadge}>
          <Text style={styles.pillText}>DASHBOARD FEATURES</Text>
        </View>
        <Text style={styles.mainHeading}>Everything You Need</Text>
        <Text style={styles.subHeading}>
          A powerful toolkit designed to help you manage your mentoring business effortlessly.
        </Text>
      </View>

      {/* 2-COLUMN GRID */}
      <View style={styles.gridContainer}>
        {FEATURES.map((item, index) => (
          <FeatureCard key={item.id} item={item} index={index} />
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
    backgroundColor: '#FFFFFF',
    paddingVertical: 50,
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  
  // --- Background Graphics ---
  bgGraphic1: {
    position: 'absolute',
    top: 20,
    left: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(16, 185, 129, 0.04)',
  },
  bgGraphic2: {
    position: 'absolute',
    bottom: 50,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(59, 130, 246, 0.03)',
  },

  // --- Header ---
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
    zIndex: 10,
  },
  pillBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4B5563',
    letterSpacing: 1.2,
  },
  mainHeading: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 10,
  },
  subHeading: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 15,
  },

  // --- Grid Layout ---
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16, // Use gap for modern RN versions
    zIndex: 10,
  },
  cardWrapper: {
    width: (width - 40 - 16) / 2, // Accurate 2-column calculation
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24, // High border radius for a modern soft look
    padding: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    alignItems: 'flex-start',
    height: '100%',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 10 },
      android: { elevation: 2 },
    }),
  },
  
  // --- Icons & Text ---
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 22,
  },
  cardDesc: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
});