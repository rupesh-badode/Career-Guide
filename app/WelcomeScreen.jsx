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
  Platform,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Aapke first code me ye import tha

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
          {/* <Ionicons name="school" size={60} color="#FFFFFF" /> */}
          <Image
            source={require('../assets/aastroneet.png')}
            style={{ width: 90, height: 90, position: 'absolute' }}
            resizeMode="contain"
          />
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
        <View style={styles.logoWrapper}>
      {/* Floating Sparkle/Star Icon - 'a' ke theek upar */}
      <MaterialCommunityIcons 
        name="star-four-points" 
        size={18} 
        color="#D4AF37" 
        style={styles.floatingStar} 
      />

      <Text style={styles.brandName}>
        <Text style={styles.baseText}>A</Text>
        <Text style={styles.specialA}>a</Text>
        <Text style={styles.baseText}>stroneet</Text>
      </Text>

      {/* Graphic Element: Constellation / Orbit Line niche */}
      <View style={styles.graphicContainer}>
        <View style={styles.dot} />
        <View style={styles.thinLine} />
        <View style={styles.diamond} />
        <View style={styles.thinLine} />
        <View style={styles.dot} />
      </View>
      
      {/* Optional Tagline */}
      {/* <Text style={styles.tagline}>A S T R O L O G Y</Text> */}
    </View>
        <View style={styles.badgeContainer}>
          <Text style={styles.subtitle}>
            Smart Career Guidance & Consultancy
          </Text>
        </View>

        <Text style={styles.description}>
          Shape your future with the right guidance and take confident steps toward your dream career</Text>
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
    width: 150,
    height: 150,
    borderRadius: 80,
    backgroundColor: '#f3f3f3', // Primary Indigo color
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#fafaff',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  brandNameRoyal: {
    fontSize: 38,
    fontWeight: '300',         // Thin/Light font for elegance
    color: '#E0E0E0',          // Premium Silver/Off-white
    letterSpacing: 4,          // Thoda space premium feel deta hai
    textTransform: 'uppercase',
  },
  brandHighlightRoyal: {
    fontWeight: '900',         // Heavy bold for contrast
    color: '#D4AF37',          // Classic Metallic Gold
    textShadowColor: 'rgba(212, 175, 55, 0.6)', // Gold glow effect
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
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
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  baseText: {
    fontSize: 44,
    fontWeight: '500',
    letterSpacing: 1,
  },
  specialA: {
    fontSize: 48,              // Baaki text se thoda bada (emphasize karne ke liye)
    fontWeight: 'bold',
    color: '#F27A21',          // Rich Metallic Gold color
    fontStyle: 'italic',
    fontFamily:"serif",           // Thoda classic serif font for elegance
    transform: [{ rotate: '-10deg' }],       // Ye usko thoda orbital/dynamic look dega
    // Gold glow effect
    textShadowColor: 'rgba(212, 175, 55, 0.5)', 
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    

  },
  brandHighlight: {
    color: "#F27A21",
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
    color: '#F27A21',
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
    backgroundColor: '#F27A21',
    width: '100%',
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F27A21',
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
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    // Position relative zaroori hai taaki star ko absolute position kar sakein
    position: 'relative', 
  },
  
  // Floating Star Styling
  floatingStar: {
    position: 'absolute',
    top: 0,
    left: '42%', // Isko adjust karein taaki 'a' ke exactly upar aaye
    opacity: 0.9,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 3,
  },

  // Typography Styles
  brandName: {
    flexDirection: 'row',
  },
  baseText: {
    fontSize: 42,
    fontWeight: '300', // Thin weight for modern look
    color: '#1E293B', // Dark Slate
    letterSpacing: 1,
  },
  specialA: {
    fontSize: 52,
    fontWeight: 'bold',
    fontStyle: 'italic', // Flowy feel ke liye
    color: '#D4AF37', // Premium Gold
    // Gold glowing text
    textShadowColor: 'rgba(212, 175, 55, 0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },

  // --- Graphics (Bottom Constellation Line) ---
  graphicContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -5,
    marginBottom: 5,
    width: '60%', // Logo ke width ke hisaab se adjust karein
    justifyContent: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D4AF37',
  },
  thinLine: {
    height: 1,
    flex: 1,
    backgroundColor: '#D4AF37',
    opacity: 0.5, // Line ko thoda subtle rakha hai
    marginHorizontal: 4,
  },
  diamond: {
    width: 6,
    height: 6,
    backgroundColor: '#D4AF37',
    transform: [{ rotate: '45deg' }], // Square ko diamond shape me convert kiya
  },

  // Tagline
  tagline: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: 6,
  },
});