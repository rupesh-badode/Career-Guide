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

// ⚠️ UPDATE THIS IMPORT PATH TO YOUR ACTUAL FILE
import { getBanners } from '../../../../src/services/user'; 

const { width } = Dimensions.get('window');

// Responsive settings
const ITEM_WIDTH = width; 
const CARD_WIDTH = width * 0.92; // Thoda chota kiya taaki shadow dikhe
const CAROUSEL_HEIGHT = Platform.OS === 'web' ? 210 : 210; // Thodi height aur badhayi

// Premium Yellow Theme Colors
const YELLOW_PRIMARY = '#F59E0B'; // Premium Amber/Gold
const YELLOW_LIGHT = '#FEF3C7';
const SHADOW_COLOR = '#D97706';   // Dark yellow for rich shadow

// --- Premium Skeleton Loader Component ---
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
    <View style={styles.cardContainer}>
      <View style={styles.card}>
        <Animated.View style={[styles.skeletonImage, { opacity: pulseAnim }]} />
        <View style={styles.skeletonTextWrapper}>
          <Animated.View style={[styles.skeletonText, { opacity: pulseAnim, width: '70%' }]} />
          <Animated.View style={[styles.skeletonText, { opacity: pulseAnim, width: '40%', marginTop: 8 }]} />
        </View>
      </View>
    </View>
  );
};

export default function ImageCarousel() {
  const flatListRef = useRef(null);
  
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const scrollX = useRef(new Animated.Value(0)).current;

  // --- Fetch API Data ---
  useEffect(() => {
    const fetchBannersData = async () => {
      try {
        setLoading(true);
        const res = await getBanners();
        if (res && res.data) {
          setBanners(res.data);
        }
      } catch (error) {
        console.error("Banner fetch error:", error);
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
    const inputRange = [
      (index - 1) * ITEM_WIDTH,
      index * ITEM_WIDTH,
      (index + 1) * ITEM_WIDTH,
    ];

    // Card scale animation for 3D effect
    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.5, 1, 0.5],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.cardContainer}>
        <Animated.View style={[styles.card, { opacity, transform: [{ scale }] }]}>
          
          <View style={styles.imageWrapper}>
            <Image 
              source={{ uri: item.image }} 
              style={styles.image}
              resizeMode="cover" 
            />
          </View>
          
          <View style={styles.textWrapper}>
            {/* Premium Yellow Accent Line */}
            <View style={styles.accentLine} />
            <View style={styles.textInner}>
              <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
            </View>
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
            outputRange: [8, 24, 8], // Dots thode bade aur stretch hone wale banaye
            extrapolate: 'clamp',
          });

          const backgroundColor = scrollX.interpolate({
            inputRange,
            outputRange: ['#E5E7EB', YELLOW_PRIMARY, '#E5E7EB'], // Inactive Gray, Active Premium Yellow
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
      
      {/* Dots List ke theek niche aayenge */}
      <View style={styles.paginationOverlay}>
        <PaginationDots />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: '#FAFAFA', // Off-white background taaki shadow pop kare
    position: 'relative',
    paddingVertical: 15,
  },
  cardContainer: {
    width: ITEM_WIDTH,
    alignItems: 'center', 
    justifyContent: 'center',
  },
  card: {
    width: CARD_WIDTH,
    height: CAROUSEL_HEIGHT,
    backgroundColor: '#FFFFFF',
    borderRadius: 20, // Rounded corners for premium look
    marginBottom: 10,
    // 🔥 TAGDA SHADOW (Yellow / Amber tone me)
    ...Platform.select({
      ios: { 
        shadowColor: SHADOW_COLOR, 
        shadowOffset: { width: 0, height: 10 }, 
        shadowOpacity: 0.25, 
        shadowRadius: 15 
      },
      android: { 
        elevation: 12, // Android me heavy elevation
        shadowColor: SHADOW_COLOR,
      }, 
      web: { boxShadow: '0px 10px 25px rgba(217, 119, 6, 0.2)' },
    }),
  },
  imageWrapper: {
    flex: 3.5, 
    width: '100%',
    backgroundColor: YELLOW_LIGHT,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden', // Image ko border radius ke bahar jane se rokne ke liye
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textWrapper: {
    flex: 1.5, 
    flexDirection: 'row',
    backgroundColor: '#FFFFFF', 
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
  },
  accentLine: {
    width: 6,
    backgroundColor: YELLOW_PRIMARY, // Left side me ek tagdi yellow line
    height: '100%',
  },
  textInner: {
    flex: 1,
    paddingHorizontal: 15,
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: 0.5, 
  },
  paginationOverlay: {
    marginTop: 15, // Image ke niche dots
    alignItems: 'center',
    justifyContent: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 10,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 5,
    // Active Dot par bhi yellow glow shadow
    shadowColor: YELLOW_PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Skeleton Styles Matches New Card
  skeletonImage: {
    flex: 3.5,
    backgroundColor: '#F3F4F6',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  skeletonTextWrapper: {
    flex: 1.5,
    paddingHorizontal: 20,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  skeletonText: {
    height: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
  }
});