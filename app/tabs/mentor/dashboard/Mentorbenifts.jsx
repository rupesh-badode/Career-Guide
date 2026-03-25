import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const THEME_COLOR = '#8B5CF6'; // Royal Purple

// ==========================================
// DATA: MENTOR BENEFITS
// ==========================================
const BENEFITS = [
  { id: '1', title: 'Earn per session', icon: 'wallet', color: '#8B5CF6' },
  { id: '2', title: 'Flexible timing', icon: 'time', color: '#A855F7' },
  { id: '3', title: 'Work from home', icon: 'home', color: '#C084FC' },
  { id: '4', title: '1-1 mentoring', icon: 'people', color: '#D8B4FE' },
  { id: '5', title: 'Chat & Video call', icon: 'videocam', color: '#9333EA' },
  { id: '6', title: 'Build personal brand', icon: 'star', color: '#7E22CE' },
];

// ==========================================
// ANIMATED HOVERING CARD
// ==========================================
const FloatingCard = ({ item, index }) => {
  const popAnim = useRef(new Animated.Value(0)).current;
  const hoverAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Staggered Pop-in Entry
    Animated.spring(popAnim, {
      toValue: 1,
      tension: 50,
      friction: 6,
      delay: index * 150, // Waterfall effect
      useNativeDriver: true,
    }).start();

    // 2. Continuous Hovering (Ghumte-Firte effect)
    const randomDelay = (index % 3) * 400; // Har card alag time pe hilega
    const startHover = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(hoverAnim, {
            toValue: -8, // Upar jayega
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(hoverAnim, {
            toValue: 0, // Wapas aayega
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    setTimeout(startHover, randomDelay);
  }, [index, popAnim, hoverAnim]);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          transform: [
            { scale: popAnim }, // Entry pop
            { translateY: hoverAnim }, // Continuous hover
          ],
        },
      ]}
    >
      <View style={[styles.iconWrapper, { backgroundColor: `${item.color}15` }]}>
        <Ionicons name={item.icon} size={28} color={item.color} />
      </View>
      <Text style={styles.cardTitle}>{item.title}</Text>
    </Animated.View>
  );
};

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function MentorBenefits() {
  const mainImageFloat = useRef(new Animated.Value(0)).current;
  const bgRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 🌟 Big Image Floating Animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(mainImageFloat, {
          toValue: -20,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(mainImageFloat, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 🌟 Background Orbs Rotating
    Animated.loop(
      Animated.timing(bgRotate, {
        toValue: 1,
        duration: 15000, // Slow rotation
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = bgRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      
      {/* --- BACKGROUND ANIMATED ORBS --- */}
      <Animated.View style={[styles.bgOrb, styles.orb1, { transform: [{ rotate: spin }] }]} />
      <Animated.View style={[styles.bgOrb, styles.orb2, { transform: [{ rotate: spin }] }]} />

      {/* --- HEADER --- */}
      <View style={styles.header}>
        <Text style={styles.badgeText}>WHY JOIN US</Text>
        <Text style={styles.mainTitle}>Perks of being a Mentor</Text>
        <Text style={styles.subTitle}>Empower the next generation while working on your own terms.</Text>
      </View>

      {/* --- BIG FLOATING IMAGE --- */}
      <Animated.View style={[styles.imageContainer, { transform: [{ translateY: mainImageFloat }] }]}>
        <Image 
          // Yahan apni koi transparent cool illustration lagana
          source={{ uri: 'https://static.vecteezy.com/system/resources/previews/050/980/745/non_2x/3d-man-is-doing-online-teaching-illustration-png.png' }} 
          style={styles.mainImage}
          resizeMode="contain"
        />
        {/* Shadow below the floating image */}
        <View style={styles.imageShadow} />
      </Animated.View>

      {/* --- BENEFITS GRID --- */}
      <View style={styles.grid}>
        {BENEFITS.map((item, index) => (
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
    backgroundColor: '#FAFAFA',
    paddingVertical: 50,
    paddingHorizontal: 20,
    overflow: 'hidden', // Taaki background orbs bahar na jayein
    position: 'relative',
  },

  // --- Background Decor ---
  bgOrb: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: (width * 0.8) / 2,
    opacity: 0.5,
  },
  orb1: {
    top: -50,
    right: -100,
    backgroundColor: 'rgba(139, 92, 246, 0.08)', // Light Purple
  },
  orb2: {
    bottom: 100,
    left: -150,
    backgroundColor: 'rgba(192, 132, 252, 0.06)',
  },

  // --- Header ---
  header: {
    alignItems: 'center',
    marginBottom: 30,
    zIndex: 10,
  },
  badgeText: {
    color: THEME_COLOR,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 10,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 15,
    lineHeight: 22,
  },

  // --- Big Image Section ---
  imageContainer: {
    alignItems: 'center',
    marginBottom: 40,
    zIndex: 10,
  },
  mainImage: {
    width: width * 0.7,
    height: width * 0.6,
  },
  imageShadow: {
    width: 100,
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 50,
    marginTop: 20,
    transform: [{ scaleX: 1.5 }],
  },

  // --- Grid & Cards ---
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
    zIndex: 10,
  },
  card: {
    width: (width - 40 - 15) / 2, // Accurate half-width responsive
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.05)',
    ...Platform.select({
      ios: { shadowColor: THEME_COLOR, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.08, shadowRadius: 10 },
      android: { elevation: 3 },
    }),
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 18, // Squircle shape
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
  },
});