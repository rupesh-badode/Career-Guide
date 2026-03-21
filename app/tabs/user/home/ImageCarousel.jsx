import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  Dimensions, 
  Animated, 
  Platform,
  ActivityIndicator
} from 'react-native';

// ⚠️ UPDATE THIS IMPORT PATH TO YOUR ACTUAL FILE
import { getBanners } from '../../../../src/services/user'; 

const { width } = Dimensions.get('window');

// Responsive settings
const CONTAINER_WIDTH = width;
const ITEM_WIDTH = Platform.OS === 'web' ? Math.min(width * 0.9, 800) : width * 0.85; // Thoda chhota kiya taaki next card ka hint dikhe
const CAROUSEL_HEIGHT = Platform.OS === 'web' ? 350 : 220; 

const BG_COLORS = ['#EEF2FF', '#ECFDF5', '#FFFBEB', '#FDF2F8']; // Thode aur soft/premium pastel colors

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
    const itemBgColor = BG_COLORS[index % BG_COLORS.length];

    // 🔥 ANIMATION LOGIC: Scale aur Opacity calculate kar rahe hain current scroll position ke hisaab se
    const inputRange = [
      (index - 1) * CONTAINER_WIDTH,
      index * CONTAINER_WIDTH,
      (index + 1) * CONTAINER_WIDTH,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.88, 1, 0.88], // Side wale cards 88% size ke rahenge
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.6, 1, 0.6], // Side wale cards thode transparent rahenge
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.cardContainer}>
        <Animated.View style={[styles.card, { transform: [{ scale }], opacity }]}>
          
          <View style={[styles.imageWrapper, { backgroundColor: itemBgColor }]}>
            <Image 
              source={{ uri: item.image }} 
              style={styles.image}
              resizeMode="contain" 
            />
          </View>
          
          <View style={styles.textWrapper}>
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
            (index - 1) * CONTAINER_WIDTH,
            index * CONTAINER_WIDTH,
            (index + 1) * CONTAINER_WIDTH,
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 24, 8], // Active dot lamba (pill shape) ho jayega
            extrapolate: 'clamp',
          });

          const backgroundColor = scrollX.interpolate({
            inputRange,
            outputRange: ['#D1D5DB', '#4F46E5', '#D1D5DB'], // Inactive gray, Active Indigo
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
      <View style={[styles.mainContainer, styles.loaderView]}>
        <ActivityIndicator size="large" color="#4F46E5" />
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
        keyExtractor={(item) => item._id} 
        horizontal
        pagingEnabled 
        showsHorizontalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={Platform.OS === 'web' ? { alignItems: 'center' } : null}
        renderItem={renderItem}
        // Snap settings for better UX
        snapToInterval={CONTAINER_WIDTH}
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
      <PaginationDots />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    paddingVertical: 15,
    backgroundColor: '#F3F4F6', // Thoda off-white background taaki cards pop karein
  },
  loaderView: {
    height: CAROUSEL_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    width: CONTAINER_WIDTH,
    alignItems: 'center', 
    justifyContent: 'center',
  },
  card: {
    width: ITEM_WIDTH,
    height: CAROUSEL_HEIGHT,
    backgroundColor: '#FFFFFF',
    borderRadius: 20, // Thoda aur modern smooth curve
    overflow: 'hidden', 
    ...Platform.select({
      ios: { 
        shadowColor: '#4F46E5', // Colored shadow premium lagta hai
        shadowOffset: { width: 0, height: 8 }, 
        shadowOpacity: 0.15, 
        shadowRadius: 12 
      },
      android: { elevation: 8 },
      web: { boxShadow: '0px 12px 24px rgba(79, 70, 229, 0.1)' },
    }),
  },
  imageWrapper: {
    flex: 3, 
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
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
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6', // Light separator line
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    letterSpacing: 0.3, // Text thoda zyada readable aur clean lagega
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    height: 10,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 5,
  },
});