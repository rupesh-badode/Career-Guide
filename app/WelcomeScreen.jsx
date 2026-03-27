import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const navigation = useNavigation();

  // ==========================================
  // ANIMATION VALUES
  // ==========================================
  const fadeLogo = useRef(new Animated.Value(0)).current;
  const scaleLogo = useRef(new Animated.Value(0.5)).current;
  
  const fadeText = useRef(new Animated.Value(0)).current;
  const slideText = useRef(new Animated.Value(40)).current;
  
  const fadeBtn = useRef(new Animated.Value(0)).current;
  const slideBtn = useRef(new Animated.Value(40)).current;

  // ==========================================
  // TRIGGER ANIMATIONS ON MOUNT
  // ==========================================
  useEffect(() => {
    Animated.sequence([
      // 1. Logo fades and scales in
      Animated.parallel([
        Animated.timing(fadeLogo, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleLogo, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // 2. Text slides up and fades in
      Animated.parallel([
        Animated.timing(fadeText, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideText, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      // 3. Button slides up and fades in
      Animated.parallel([
        Animated.timing(fadeBtn, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideBtn, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [fadeLogo, scaleLogo, fadeText, slideText, fadeBtn, slideBtn]);

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleProceed = () => {
    // Replace 'Login' or 'MainTabs' with your actual next screen name
    // Using replace() prevents the user from swiping back to the welcome screen
    navigation.replace('Login'); 
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Spacer for centering */}
      <View style={styles.topSpacer} />

      {/* ==========================================
          1. LOGO / ICON SECTION
      ========================================== */}
      <Animated.View 
        style={[
          styles.logoContainer, 
          { 
            opacity: fadeLogo, 
            transform: [{ scale: scaleLogo }] 
          }
        ]}
      >
        <View style={styles.iconCircle}>
          <Ionicons name="school" size={60} color="#FFFFFF" />
        </View>
      </Animated.View>

      {/* ==========================================
          2. TEXT SECTION
      ========================================== */}
      <Animated.View 
        style={[
          styles.textContainer, 
          { 
            opacity: fadeText, 
            transform: [{ translateY: slideText }] 
          }
        ]}
      >
        <Text style={styles.title}>Welcome to</Text>
        <Text style={styles.brandName}>Aastroneet</Text>
        
        <View style={styles.badgeContainer}>
          <Text style={styles.subtitle}>
            Smart Career Guidance & Consultancy
          </Text>
        </View>
        
        <Text style={styles.description}>
          Discover your true potential and get expert guidance to navigate your career path with confidence.
        </Text>
      </Animated.View>

      {/* Spacer to push button to bottom */}
      <View style={styles.bottomSpacer} />

      {/* ==========================================
          3. PROCEED BUTTON
      ========================================== */}
      <Animated.View 
        style={[
          styles.buttonWrapper, 
          { 
            opacity: fadeBtn, 
            transform: [{ translateY: slideBtn }] 
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.proceedButton} 
          activeOpacity={0.8}
          onPress={handleProceed}
        >
          <Text style={styles.proceedButtonText}>Proceed</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={styles.btnIcon} />
        </TouchableOpacity>
      </Animated.View>

    </SafeAreaView>
  );
}

// ==========================================
// STYLES
// ==========================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  topSpacer: {
    flex: 1.5,
  },
  bottomSpacer: {
    flex: 1,
  },
  
  // --- Logo Styles ---
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#4F46E5', // Primary Indigo color
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },

  // --- Text Styles ---
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  brandName: {
    fontSize: 36,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: 1,
    marginBottom: 16,
  },
  badgeContainer: {
    backgroundColor: '#EEF2FF', // Very light indigo
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4F46E5',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },

  // --- Button Styles ---
  buttonWrapper: {
    width: '100%',
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
  },
  proceedButton: {
    flexDirection: 'row',
    backgroundColor: '#4F46E5',
    width: '100%',
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  proceedButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  btnIcon: {
    marginLeft: 8,
    marginTop: 2,
  },
});