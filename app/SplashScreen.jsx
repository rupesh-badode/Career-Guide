import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Ionicons } from '@expo/vector-icons';


export default function SplashScreen(){
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, [scaleAnim, fadeAnim]);

  return (
    <View style={styles.splashContainer}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: fadeAnim, alignItems: 'center' }}>
        <View style={styles.logoCircle}>
          <Ionicons name="pulse" size={60} color="#FFFFFF" />
        </View>
        <Text style={styles.splashTitle}>Career Guide</Text>
        <Text style={styles.splashSubtitle}>Your Consultant</Text>
      </Animated.View>
    </View>
  );
};


const styles = StyleSheet.create({
splashContainer: {
    flex: 1,
    backgroundColor: '#3B82F6', // Blue background
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  splashTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  splashSubtitle: {
    fontSize: 14,
    color: '#E0E7FF',
    marginTop: 8,
    fontWeight: '500',
  }
  });