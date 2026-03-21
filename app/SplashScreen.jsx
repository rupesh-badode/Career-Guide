import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View, Easing } from "react-native";
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

export default function SplashScreen() {
  // Animation Values
  const entranceScale = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(50)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  
  // Continuous Animation Values
  const rippleScale = useRef(new Animated.Value(1)).current;
  const rippleOpacity = useRef(new Animated.Value(0.8)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Entrance Animations (Drop and Fade In)
    Animated.parallel([
      Animated.spring(entranceScale, {
        toValue: 1,
        tension: 10,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.timing(textTranslateY, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
        delay: 300, // Text aane mein thoda delay
      }),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        delay: 300,
      })
    ]).start(() => {
      // 2. Infinite Continuous Animations (Starts after entrance)
      
      // Floating Effect (Up and Down)
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: -10,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          })
        ])
      ).start();

      // Ripple/Glow Effect (Expanding waves)
      Animated.loop(
        Animated.parallel([
          Animated.timing(rippleScale, {
            toValue: 1.8,
            duration: 2000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(rippleOpacity, {
            toValue: 0,
            duration: 2000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          })
        ])
      ).start();
    });
  }, []);

  return (
    <View style={styles.splashContainer}>
      
      {/* Floating Logo Container */}
      <Animated.View style={{ 
        transform: [
          { scale: entranceScale }, 
          { translateY: floatAnim }
        ],
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
        marginTop: 50,
      }}>
        
        {/* Infinite Ripple Background */}
        <Animated.View style={[
          styles.rippleCircle,
          { 
            transform: [{ scale: rippleScale }],
            opacity: rippleOpacity 
          }
        ]} />

        {/* Main Logo Container */}
        <View style={styles.logoCircle}>
          {/* Layering Icons to mimic the Star + DNA look */}
          <Ionicons name="star" size={50} color="#0EA5E9" style={styles.starIcon} />
          <MaterialCommunityIcons name="dna" size={65} color="#10B981" />
        </View>

      </Animated.View>

      {/* Text Section with Glowing Shadow effect */}
      <Animated.View style={{ 
        opacity: textOpacity, 
        transform: [{ translateY: textTranslateY }], 
        alignItems: 'center' 
      }}>
        <Text style={styles.splashTitle}>AASTRONEET</Text>
        <Text style={styles.splashSubtitle}>REACH YOUR POTENTIAL</Text>
      </Animated.View>

    </View>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#ECFEFF', // Very Light Cyan/Blue Theme Background
    justifyContent: 'center',
    alignItems: 'center',
  },
  rippleCircle: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#6EE7B7', // Light mint green for the glow
  },
  logoCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    // Premium Shadow matching the light theme
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  starIcon: {
    position: 'absolute',
    opacity: 0.3, // Star behaves like a background element inside the circle
    transform: [{ scale: 1.5 }],
  },
  splashTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: '#0F766E', // Deep Teal Green
    letterSpacing: 3,
    textShadowColor: 'rgba(45, 212, 191, 0.5)', // Neon text shadow
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  splashSubtitle: {
    fontSize: 16,
    color: '#0284C7', // Sky Blue
    marginTop: 8,
    fontWeight: '700',
    letterSpacing: 4,
  }
});