import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const TOOLS = [
  {
    id: 1,
    title: 'AI Matchmaker',
    desc: 'Hamara smart algorithm aapko wahi counsellor deta hai jo aapki problem samajh sake.',
    icon: 'git-network-outline',
  },
  {
    id: 2,
    title: 'Growth Tracker',
    desc: 'Apni mental health journey ko visualize karein aur progress monitor karein.',
    icon: 'trending-up-outline',
  },
  {
    id: 3,
    title: 'Instant Connect',
    desc: 'Emergency? 5 minutes ke andar expert guidance se judiye.',
    icon: 'flash-outline',
  },
];

const SmartTools = () => {
  // Animations setup
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Background Accent */}
      <View style={styles.bgCircle} />

      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>SMART FEATURES</Text>
        </View>
        <Text style={styles.title}>
          Smart Tools for{'\n'}
          <Text style={{ color: '#4F46E5' }}>Smarter Decisions</Text>
        </Text>
        <Text style={styles.subtitle}>
          Aastroneet technology aur empathy ka perfect blend hai.
        </Text>
      </View>

      <View style={styles.grid}>
        {TOOLS.map((tool, index) => (
          <Animated.View
            key={tool.id}
            style={[
              styles.toolCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.iconContainer}>
              <Ionicons name={tool.icon} size={28} color="#4F46E5" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.toolTitle}>{tool.title}</Text>
              <Text style={styles.toolDesc}>{tool.desc}</Text>
            </View>
            
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#f8fafc',
    overflow: 'hidden',
  },
  bgCircle: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(79, 70, 229, 0.05)',
  },
  header: {
    marginBottom: 30,
    alignItems: 'flex-start',
  },
  badge: {
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  badgeText: {
    color: '#4F46E5',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    marginTop: 10,
    lineHeight: 22,
  },
  grid: {
    gap: 16,
  },
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(79, 70, 229, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  toolTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  toolDesc: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  arrowIcon: {
    marginLeft: 8,
  },
});

export default SmartTools;