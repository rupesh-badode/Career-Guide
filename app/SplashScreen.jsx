import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  StatusBar,
  ActivityIndicator
} from 'react-native';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  const [isImageLoading, setIsImageLoading] = useState(true);
  
  // Animated Values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const slideUp = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Entrance Animation starts immediately
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.timing(slideUp, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* 1. Light Orange Tint on Top (Taaki White na lage) */}
      <View style={styles.topCircle} />
      
      <StatusBar barStyle="dark-content" />

      {/* 2. Logo Container */}
      <Animated.View 
        style={[
          styles.logoWrapper, 
          { 
            opacity: fadeAnim, 
            transform: [{ scale: scaleAnim }] 
          }
        ]}
      >
        <Image 
          // 🛑 DHAYAN DEIN: Yahan file name ekdum sahi hona chahiye
          // Agar folder "assets" hai toh '../assets/Aastroneet.png' check karein
          source={require('../assets/aastroneet.png')} 
          style={styles.logo}
          resizeMode="contain"
          onLoadEnd={() => setIsImageLoading(false)}
        />
        
        {/* Agar image load ho rahi hai toh chota sa loader dikhega */}
        {isImageLoading && (
          <ActivityIndicator size="small" color="#F39C12" style={{ marginTop: 20 }} />
        )}
      </Animated.View>

      {/* 3. Footer Branding */}
      <Animated.View style={[styles.footer, { opacity: fadeAnim, transform: [{ translateY: slideUp }] }]}>
        {/* <Text style={styles.brandName}>AASTRO NEET</Text>
        <Text style={styles.tagline}>YOUR PATH TO MEDICAL SUCCESS</Text>
         */}
        {/* Simple Progress Bar Decoration */}
        <View style={styles.progressBarBg}>
           <Animated.View style={styles.progressBarActive} />
        </View>
      </Animated.View>

      <Text style={styles.version}>Version 1.0.1</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA', // Pure white ki jagah off-white (Creamy)
    justifyContent: 'center',
    alignItems: 'center',
  },
  topCircle: {
    position: 'absolute',
    top: -height * 0.1,
    right: -width * 0.1,
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    backgroundColor: 'rgba(243, 156, 18, 0.05)', // Very light orange
  },
  logoWrapper: {
    width: width * 0.75,
    height: width * 0.75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
    width: '100%',
  },
  brandName: {
    fontSize: 26,
    fontWeight: '900',
    color: '#D35400', // Deep Orange for visibility
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '600',
    marginTop: 5,
    letterSpacing: 1,
  },
  progressBarBg: {
    height: 3,
    width: 120,
    backgroundColor: '#ECF0F1',
    borderRadius: 10,
    marginTop: 25,
    overflow: 'hidden',
  },
  progressBarActive: {
    height: '100%',
    width: '40%', // Animation logic can be added
    backgroundColor: '#F39C12',
  },
  version: {
    position: 'absolute',
    bottom: 20,
    fontSize: 11,
    color: '#BDC3C7',
  }
});

export default SplashScreen;