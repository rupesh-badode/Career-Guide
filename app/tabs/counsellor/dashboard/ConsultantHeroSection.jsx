import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const THEME_COLOR = '#10B981';

export default function ConsultantHeroSection({ navigation }) {
  // ==========================================
  // ANIMATION VALUES
  // ==========================================
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const scaleBtn1 = useRef(new Animated.Value(1)).current;
  const scaleBtn2 = useRef(new Animated.Value(1)).current;

  // ==========================================
  // START ANIMATIONS ON MOUNT
  // ==========================================
  useEffect(() => {
    // 1. Entry Animation (Fade In & Slide Up)
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Continuous Floating Animation for Graphic
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -15,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // ==========================================
  // BUTTON PRESS ANIMATIONS
  // ==========================================
  const animatePressIn = (animValue) => {
    Animated.spring(animValue, { toValue: 0.92, useNativeDriver: true }).start();
  };
  const animatePressOut = (animValue) => {
    Animated.spring(animValue, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* BACKGROUND DECORATIVE SHAPES */}
      <View style={styles.bgCircleTopRight} />
      <View style={styles.bgCircleBottomLeft} />

      <View style={styles.contentContainer}>
        
        {/* ============================== */}
        {/* 1. FLOATING HERO GRAPHIC */}
        {/* ============================== */}
        <Animated.View style={[styles.graphicContainer, { transform: [{ translateY: floatAnim }] }]}>
          <View style={styles.iconBackdrop}>
            <Ionicons name="briefcase" size={60} color="#FFFFFF" style={styles.mainIcon} />
            <View style={styles.badge}>
              <Ionicons name="star" size={16} color="#F59E0B" />
            </View>
          </View>
          {/* Subtle shadow below the floating object */}
          <View style={styles.shadowIndicator} />
        </Animated.View>

        {/* ============================== */}
        {/* 2. TEXT SECTION (Animated) */}
        {/* ============================== */}
        <Animated.View 
          style={[styles.textContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          <Text style={styles.title}>Join as a Consultant</Text>
          <Text style={styles.subtitle}>
            Share your expertise, guide students, and start earning today.
          </Text>
        </Animated.View>

        {/* ============================== */}
        {/* 3. BUTTONS SECTION (Animated) */}
        {/* ============================== */}
        <Animated.View 
          style={[styles.buttonContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          {/* Primary Button */}
          <Animated.View style={{ transform: [{ scale: scaleBtn1 }], width: '100%' }}>
            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.9}
              onPressIn={() => animatePressIn(scaleBtn1)}
              onPressOut={() => animatePressOut(scaleBtn1)}
              onPress={() => {
                // navigation.navigate('Register') 
                console.log("Navigate to Join/Register");
              }}
            >
              <Text style={styles.primaryButtonText}>Join as Consultant</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </Animated.View>

          {/* Secondary Button */}
          <Animated.View style={{ transform: [{ scale: scaleBtn2 }], width: '100%', marginTop: 16 }}>
            <TouchableOpacity
              style={styles.secondaryButton}
              activeOpacity={0.7}
              onPressIn={() => animatePressIn(scaleBtn2)}
              onPressOut={() => animatePressOut(scaleBtn2)}
              onPress={() => {
                // navigation.navigate('Login')
                console.log("Navigate to Login");
              }}
            >
              <Text style={styles.secondaryButtonText}>Login</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

      </View>
    </SafeAreaView>
  );
}

// ==========================================
// STYLES
// ==========================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Light, clean background
    position: 'relative',
    overflow: 'hidden',
  },
  // --- Decorative Background Elements ---
  bgCircleTopRight: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: 'rgba(16, 185, 129, 0.08)', // Very light emerald
  },
  bgCircleBottomLeft: {
    position: 'absolute',
    bottom: -100,
    left: -80,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 10,
  },

  // --- Graphic Section ---
  graphicContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconBackdrop: {
    width: 130,
    height: 130,
    borderRadius: 35, // Rounded squircle look
    backgroundColor: THEME_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: THEME_COLOR, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 15 },
      android: { elevation: 12 },
    }),
    position: 'relative',
  },
  mainIcon: {
    marginLeft: 4, // Slight optical adjustment for the briefcase icon
  },
  badge: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    backgroundColor: '#FFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 5 },
      android: { elevation: 5 },
    }),
  },
  shadowIndicator: {
    width: 80,
    height: 10,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 50,
    marginTop: 25,
    transform: [{ scaleX: 1.2 }],
  },

  // --- Text Section ---
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },

  // --- Buttons Section ---
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: THEME_COLOR,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: THEME_COLOR, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 8 },
      android: { elevation: 6 },
    }),
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#E5E7EB', // Light grey border
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4B5563', // Dark grey text
  },
});