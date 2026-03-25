import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const THEME_COLOR = '#10B981';

// ==========================================
// DATA: BENEFITS LIST
// ==========================================
const BENEFITS = [
  {
    id: '1',
    title: 'Earn per consultation',
    description: 'Set your rates and get paid securely for every session you complete.',
    icon: 'wallet-outline',
  },
  {
    id: '2',
    title: 'Flexible Availability',
    description: 'Work on your own terms. Set dates and times that suit your schedule.',
    icon: 'calendar-outline',
  },
  {
    id: '3',
    title: 'Chat & Video Support',
    description: 'Connect seamlessly with students via built-in chat and video calls.',
    icon: 'videocam-outline',
  },
  {
    id: '4',
    title: 'Manage Bookings',
    description: 'Accept, reschedule, or manage your appointments with just a tap.',
    icon: 'checkmark-done-circle-outline',
  },
  {
    id: '5',
    title: 'Dashboard Analytics',
    description: 'Track your earnings, ratings, and upcoming schedules effortlessly.',
    icon: 'pie-chart-outline',
  },
];

// ==========================================
// ANIMATED BENEFIT CARD COMPONENT
// ==========================================
const BenefitCard = ({ item, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 120, // Staggered delay har card ke liye
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        delay: index * 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, fadeAnim, slideAnim]);

  // Har odd element full width lega agar wo aakhiri hai (e.g., 5th item)
  const isLastOddItem = index === BENEFITS.length - 1 && BENEFITS.length % 2 !== 0;

  return (
    <Animated.View
      style={[
        styles.card,
        isLastOddItem ? styles.cardFullWidth : styles.cardHalfWidth,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={item.icon} size={28} color={THEME_COLOR} />
      </View>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardDesc} numberOfLines={3}>
        {item.description}
      </Text>
    </Animated.View>
  );
};

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function WhyJoinSection() {
  return (
    <View style={styles.container}>
      {/* SECTION HEADER */}
      <View style={styles.headerContainer}>
        <Text style={styles.badgeText}>BENEFITS</Text>
        <Text style={styles.mainHeading}>Why Join As Consultant?</Text>
        <Text style={styles.subHeading}>
          Empower students with your guidance and build a rewarding career with us.
        </Text>
      </View>

      {/* BENEFITS GRID */}
      <View style={styles.gridContainer}>
        {BENEFITS.map((item, index) => (
          <BenefitCard key={item.id} item={item} index={index} />
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
    backgroundColor: '#F9FAFB',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  
  // --- Header Styles ---
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME_COLOR,
    letterSpacing: 1.5,
    marginBottom: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    overflow: 'hidden',
  },
  mainHeading: {
    fontSize: 28,
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
    paddingHorizontal: 10,
  },

  // --- Grid & Card Styles ---
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15, // Gap works natively in newer React Native versions
  },
  // Dynamic Card Widths
  cardHalfWidth: {
    width: (width - 40 - 15) / 2, // (Total width - Padding - Gap) / 2
  },
  cardFullWidth: {
    width: '100%',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    alignItems: 'flex-start',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  
  // --- Inner Card Elements ---
  iconContainer: {
    width: 54,
    height: 54,
    borderRadius: 16, // Squircle shape
    backgroundColor: 'rgba(16, 185, 129, 0.1)', // Light Emerald Tint
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
  },
});