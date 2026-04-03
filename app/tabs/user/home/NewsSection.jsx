import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Platform,
  Animated,
  ScrollView,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// 👉 UPDATE THIS IMPORT PATH TO YOUR ACTUAL FILE
import { getWHONews } from '../../../../src/services/user'; 

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8; // Screen ka 80% width lega taaki agla card thoda sa dikhe
const PRIMARY_COLOR = '#F59E0B';
const DEFAULT_NEWS_IMAGE = 'https://images.unsplash.com/photo-1504443914801-b544321b14e5?q=80&w=200&auto=format&fit=crop'; 

// --- DATE FORMATTER ---
const formatDate = (isoString) => {
  if (!isoString) return 'Recent';
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

// --- SKELETON LOADER COMPONENT ---
const SkeletonNewsCard = () => {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <View style={styles.newsCard}>
      <Animated.View style={[styles.thumbnail, { opacity: pulseAnim, backgroundColor: '#E5E7EB' }]} />
      <View style={styles.contentContainer}>
        <Animated.View style={{ height: 12, width: '40%', backgroundColor: '#E5E7EB', borderRadius: 4, opacity: pulseAnim, marginBottom: 8 }} />
        <Animated.View style={{ height: 16, width: '90%', backgroundColor: '#E5E7EB', borderRadius: 4, opacity: pulseAnim, marginBottom: 6 }} />
        <Animated.View style={{ height: 16, width: '70%', backgroundColor: '#E5E7EB', borderRadius: 4, opacity: pulseAnim, marginBottom: 12 }} />
        <Animated.View style={{ height: 12, width: '30%', backgroundColor: '#E5E7EB', borderRadius: 4, opacity: pulseAnim }} />
      </View>
    </View>
  );
};

export default function NewsSection() {
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getWHONews();
      
      const newsArray = res?.articles || res?.data?.articles || [];
      
      if (newsArray && newsArray.length > 0) {
        setNewsData(newsArray.slice(0, 5)); // 5 items kar diye scroll feel ke liye
      }
    } catch (error) {
      console.error("Failed to fetch news:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      
      {/* Header Section */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Latest Insights</Text>
        <TouchableOpacity onPress={() => navigation.navigate("News")}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      {/* 🔥 HORIZONTAL LIST SECTION */}
      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        snapToInterval={CARD_WIDTH + 16} // Smooth snapping effect ke liye (Card Width + MarginRight)
        decelerationRate="fast"
      >
        {loading ? (
          <>
            <SkeletonNewsCard />
            <SkeletonNewsCard />
            <SkeletonNewsCard />
          </>
        ) : (
          newsData.map((item, index) => {
            const uniqueKey = item.url || index.toString(); 

            return (
              <TouchableOpacity 
                key={uniqueKey} 
                onPress={() => navigation.navigate("News", { url: item.url })} 
                style={styles.newsCard} 
                activeOpacity={0.7}
              >
                <Image 
                  source={{ uri: item.urlToImage || DEFAULT_NEWS_IMAGE }} 
                  style={styles.thumbnail} 
                  resizeMode="cover"
                />
                
                <View style={styles.contentContainer}>
                  <View style={styles.metaRow}>
                    <Text style={styles.categoryText} numberOfLines={1}>
                      {item.source?.name || 'News Update'}
                    </Text>
                    <View style={styles.dot} />
                    <Text style={styles.readTimeText}>3 min read</Text>
                  </View>
                  
                  <Text style={styles.newsTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  
                  <View style={styles.bottomRow}>
                    <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                    <Text style={styles.dateText}>
                      {formatDate(item.publishedAt)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  viewAllText: {
    fontSize: 14,
    color: PRIMARY_COLOR, 
    fontWeight: '600',
  },
  // 🔥 List Container Updated
  listContainer: {
    paddingLeft: 20,
    paddingRight: 4, // 16px right margin inside the card makes it total 20px padding at the end
    paddingBottom: 15, // Shadow space ke liye
  },
  // 🔥 Card Styles Updated
  newsCard: {
    width: CARD_WIDTH, // Fixed width de di taaki horiontal wrap ho
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginRight: 16, // Bottom ki jagah Right margin
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  contentContainer: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'space-between',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 11,
    color: PRIMARY_COLOR, 
    fontWeight: '800',
    textTransform: 'uppercase',
    maxWidth: '65%', 
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 6,
  },
  readTimeText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 20,
    marginBottom: 6,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
    fontWeight: '500',
  },
});