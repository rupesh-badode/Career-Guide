import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Platform,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getWHONews } from '../../../../src/services/user'; 
import { useNavigation } from '@react-navigation/native';

const PRIMARY_COLOR = '#4F46E5';
const DEFAULT_NEWS_IMAGE = 'https://images.unsplash.com/photo-1504443914801-b544321b14e5?q=80&w=200&auto=format&fit=crop'; // Ek default health/news image kyunki API image nahi bhej rahi

// 🔥 NAYA: Premium Skeleton Loader Component
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
      
      // 🔥 FIX: Aapki API 'res.data' ke andar array bhej rahi hai
      // Log ke hisaab se res = { data: [...], success: true, total: 50 } hai.
      // Toh actual list 'res.data' me hai (ya axios ke hisaab se res.data.data me ho sakti hai)
      const newsArray = res?.data?.data || res?.data || [];
      
      if (newsArray && newsArray.length > 0) {
        setNewsData(newsArray.slice(0, 3)); 
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

      {/* List Section */}
      <View style={styles.listContainer}>
        {loading ? (
          // Skeleton Loader (3 cards dikhayenge loading ke time)
          <>
            <SkeletonNewsCard />
            <SkeletonNewsCard />
            <SkeletonNewsCard />
          </>
        ) : (
          newsData.map((item) => {
            // 🔥 FIX: Exact API keys use ki hain jo aapke console.log mein thin
            return (
              <TouchableOpacity key={item.Id} onPress={()=>navigation.navigate("News")} style={styles.newsCard} activeOpacity={0.7}>
                
                {/* Thumbnail: API image nahi bhej rahi toh default image use ki hai */}
                {/* <Image 
                  source={{ uri: DEFAULT_NEWS_IMAGE }} 
                  style={styles.thumbnail} 
                /> */}
                
                <View style={styles.contentContainer}>
                  <View style={styles.metaRow}>
                    <Text style={styles.categoryText} numberOfLines={1}>
                      {item.NewsType || 'Update'}
                    </Text>
                    <View style={styles.dot} />
                    {/* Read time API me nahi hai, toh static ya hide kar sakte hain */}
                    <Text style={styles.readTimeText}>3 min read</Text>
                  </View>
                  
                  <Text style={styles.newsTitle} numberOfLines={2}>
                    {item.Title}
                  </Text>
                  
                  <View style={styles.bottomRow}>
                    <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                    <Text style={styles.dateText}>{item.FormatedDate}</Text>
                  </View>
                </View>

              </TouchableOpacity>
            )
          })
        )}
      </View>

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
  listContainer: {
    paddingHorizontal: 20,
  },
  newsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
      android: { elevation: 2 },
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
    fontWeight: '700',
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
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
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
    color: '#9CA3AF',
    marginLeft: 4,
  },
});