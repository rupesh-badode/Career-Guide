import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  Dimensions, 
  Animated, 
  Platform 
} from 'react-native';
import { getBanner } from '../../../../src/services/mentorAPI';

// ⚠️ UPDATE THIS IMPORT PATH TO YOUR ACTUAL FILE

const { width } = Dimensions.get('window');

const CONTAINER_WIDTH = width;
const ITEM_WIDTH = width; 
const CAROUSEL_HEIGHT = Platform.OS === 'web' ? 400 : 250; 

// 🔥 Mentor Theme Colors (Soft Purples & Indigo tints)
const MENTOR_PRIMARY = '#8B5CF6';
const BG_COLORS = ['#F5F3FF', '#EDE9FE', '#F3E8FF', '#FAF5FF'];

// --- Premium Mentor Skeleton Loader ---
const SkeletonLoader = () => {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <View style={styles.skeletonContainer}>
      <Animated.View style={[styles.skeletonImage, { opacity: pulseAnim }]} />
      <View style={styles.skeletonTextWrapper}>
        <Animated.View style={[styles.skeletonText, { opacity: pulseAnim, width: '70%' }]} />
        <Animated.View style={[styles.skeletonText, { opacity: pulseAnim, width: '40%', marginTop: 8 }]} />
      </View>
    </View>
  );
};

export default function MentorImageCarousel() {
  const flatListRef = useRef(null);
  
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const scrollX = useRef(new Animated.Value(0)).current;

  // --- Fetch API Data ---
  // --- Fetch API Data ---
  useEffect(() => {
    const fetchBannersData = async () => {
      try {
        setLoading(true);
        const res = await getBanner(); 
        
        // 👉 THE FIX IS HERE
        // Safely extract the array, no matter how the backend wraps it.
        let bannersArray = [];
        
        if (res && res.data) {
          if (Array.isArray(res.data)) {
            // Direct array: res.data = [...]
            bannersArray = res.data;
          } else if (res.data.banners && Array.isArray(res.data.banners)) {
            // Wrapped in object: res.data = { banners: [...] }
            bannersArray = res.data.banners;
          } else if (res.data.data && Array.isArray(res.data.data)) {
            // Double wrapped: res.data = { data: [...] }
            bannersArray = res.data.data;
          }
        }
        
        // Ensure we only ever set an array to state
        setBanners(bannersArray || []);
        
      } catch (error) {
        console.error("Banner fetch error:", error);
        setBanners([]); // Fallback to empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchBannersData();
  }, []);

  // --- Auto Play Logic (3 Seconds) ---
  useEffect(() => {
    if (banners.length <= 1) return;

    const timer = setInterval(() => {
      let nextIndex = currentIndex + 1;
      if (nextIndex >= banners.length) {
        nextIndex = 0;
      }

      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [currentIndex, banners.length]);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50, 
  }).current;

  // --- UI Components ---
  const renderItem = ({ item, index }) => {
    const itemBgColor = BG_COLORS[index % BG_COLORS.length];

    const inputRange = [
      (index - 1) * ITEM_WIDTH,
      index * ITEM_WIDTH,
      (index + 1) * ITEM_WIDTH,
    ];

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.3, 1, 0.3],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.cardContainer}>
        <Animated.View style={[styles.card, { opacity }]}>
          
          <View style={[styles.imageWrapper, { backgroundColor: itemBgColor }]}>
            <Image 
              source={{ uri: item.image }} 
              style={styles.image}
              resizeMode="cover" 
            />
          </View>
          
          <View style={styles.textWrapper}>
            {/* Adding a subtle mentor accent line */}
            <View style={styles.accentLine} />
            <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          </View>
          
        </Animated.View>
      </View>
    );
  };

  const PaginationDots = () => {
    if (banners.length <= 1) return null;

    return (
      <View style={styles.paginationContainer}>
        {banners.map((_, index) => {
          const inputRange = [
            (index - 1) * ITEM_WIDTH,
            index * ITEM_WIDTH,
            (index + 1) * ITEM_WIDTH,
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [6, 22, 6], 
            extrapolate: 'clamp',
          });

          const backgroundColor = scrollX.interpolate({
            inputRange,
            // 🔥 Unselected dots: Light purple, Selected dot: Solid Mentor Purple
            outputRange: ['rgba(139, 92, 246, 0.3)', MENTOR_PRIMARY, 'rgba(139, 92, 246, 0.3)'], 
            extrapolate: 'clamp',
          });

          return (
            <Animated.View 
              key={index.toString()} 
              style={[styles.dot, { width: dotWidth, backgroundColor }]} 
            />
          );
        })}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.mainContainer}>
        <SkeletonLoader />
      </View>
    );
  }

  if (!loading && banners.length === 0) {
    return null; 
  }

  return (
    <View style={styles.mainContainer}>
      <Animated.FlatList
        ref={flatListRef}
        data={banners}
        keyExtractor={(item, index) => item._id || index.toString()} 
        horizontal
        pagingEnabled 
        showsHorizontalScrollIndicator={false}
        bounces={false}
        renderItem={renderItem}
        snapToInterval={ITEM_WIDTH}
        decelerationRate="fast"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false } 
        )}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onScrollToIndexFailed={() => {}} 
      />
      <View style={styles.paginationOverlay}>
        <PaginationDots />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  cardContainer: {
    width: ITEM_WIDTH,
    alignItems: 'center', 
  },
  card: {
    width: ITEM_WIDTH,
    height: CAROUSEL_HEIGHT,
    backgroundColor: '#FFFFFF',
  },
  imageWrapper: {
    flex: 4, 
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textWrapper: {
    flex: 1.2, 
    paddingHorizontal: 20,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF', 
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: { 
        shadowColor: '#8B5CF6', // Purple shadow for iOS
        shadowOffset: { width: 0, height: -3 }, 
        shadowOpacity: 0.08, 
        shadowRadius: 5 
      },
      android: { elevation: 5 }, 
      web: { boxShadow: '0px -4px 10px rgba(139, 92, 246, 0.05)' },
    }),
  },
  accentLine: {
    width: 4,
    height: '60%',
    backgroundColor: MENTOR_PRIMARY,
    borderRadius: 2,
    marginRight: 12,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937', // Dark slate for premium readability
    letterSpacing: 0.5, 
  },
  paginationOverlay: {
    position: 'absolute',
    bottom: CAROUSEL_HEIGHT * (1.2 / 5.2) + 15, // Dynamically placed just above the text box
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.85)', // White frosted glass background for purple dots
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
  },
  
  // Skeleton Styles updated to Mentor theme
  skeletonContainer: {
    width: ITEM_WIDTH,
    height: CAROUSEL_HEIGHT,
    backgroundColor: '#FFFFFF',
  },
  skeletonImage: {
    flex: 4,
    backgroundColor: '#EDE9FE', // Light purple skeleton
  },
  skeletonTextWrapper: {
    flex: 1.2,
    paddingHorizontal: 20,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  skeletonText: {
    height: 14,
    backgroundColor: '#F3E8FF',
    borderRadius: 4,
  }
});