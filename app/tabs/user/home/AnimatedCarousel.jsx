import React, { useRef, useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  Animated, 
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
// Web par max width 400px rakhi hai taaki screen par bahut bada na dikhe
const ITEM_WIDTH = Platform.OS === 'web' ? Math.min(width * 0.8, 400) : width * 0.8;
const ITEM_SPACING = (width - ITEM_WIDTH) / 2;

const CAROUSEL_DATA = [
  {
    id: '1',
    title: 'Find Top Jobs',
    description: 'Explore thousands of career opportunities tailored for you.',
    icon: 'briefcase-outline',
    color: '#4F46E5', // Indigo
  },
  {
    id: '2',
    title: 'Expert Mentorship',
    description: 'Connect with industry leaders to guide your career path.',
    icon: 'people-outline',
    color: '#10B981', // Emerald
  },
  {
    id: '3',
    title: 'Skill Assessment',
    description: 'Test your skills and get personalized course recommendations.',
    icon: 'bulb-outline',
    color: '#F59E0B', // Amber
  },
];

export default function AnimatedCarousel() {
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null); // FlatList ko control karne ke liye ref
  const [currentIndex, setCurrentIndex] = useState(0);

  // --- Auto Play Logic ---
  useEffect(() => {
    const timer = setInterval(() => {
      let nextIndex = currentIndex + 1;
      
      // Agar aakhri card par hain, toh wapas pehle card (index 0) par aa jao
      if (nextIndex >= CAROUSEL_DATA.length) {
        nextIndex = 0;
      }
      
      // Code ke through FlatList ko scroll karwao
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      
      setCurrentIndex(nextIndex);
    }, 3000); // Har 3 second (3000ms) mein scroll hoga

    // Cleanup function taaki memory leak na ho
    return () => clearInterval(timer);
  }, [currentIndex]);

  // Agar user manually scroll karta hai, toh current index update karo
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50, // Jab card 50% screen par aaye tab active maano
  }).current;

  const renderItem = ({ item, index }) => {
    const inputRange = [
      (index - 1) * ITEM_WIDTH,
      index * ITEM_WIDTH,
      (index + 1) * ITEM_WIDTH,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.85, 1, 0.85],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.5, 1, 0.5],
      extrapolate: 'clamp',
    });

    return (
      <View style={{ width: ITEM_WIDTH }}>
        <Animated.View style={[styles.card, { transform: [{ scale }], opacity }]}>
          <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
            <Ionicons name={item.icon} size={40} color={item.color} />
          </View>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={flatListRef}
        data={CAROUSEL_DATA}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_WIDTH}
        decelerationRate="fast"
        bounces={false}
        contentContainerStyle={{
          paddingHorizontal: ITEM_SPACING,
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true } // Performance boost ke liye
        )}
        scrollEventThrottle={16}
        renderItem={renderItem}
        // Manual scroll ko track karne ke liye events
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        // Fallback agar scroll fail ho jaye (Web pe kabhi kabhi list render hone se pehle scroll call ho jata hai)
        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
          }, 500);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.05)',
      },
    }),
    marginHorizontal: 10,
    minHeight: 220,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});