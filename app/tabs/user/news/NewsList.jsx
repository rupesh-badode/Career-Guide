import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Linking,
  Alert,
  Image
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// 👉 UPDATE THIS IMPORT PATH TO YOUR ACTUAL FILE
import { getWHONews } from '../../../../src/services/user';

const PRIMARY_COLOR = '#F27A21';
const DEFAULT_NEWS_IMAGE = 'https://images.unsplash.com/photo-1504443914801-b544321b14e5?q=80&w=600&auto=format&fit=crop';

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

// ✨ Animated List Item Component
const AnimatedNewsCard = ({ item, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 100 > 1000 ? 0 : index * 100, // Limit stagger delay for long lists
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 7,
        tension: 40,
        delay: index * 100 > 1000 ? 0 : index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, index]);

  const handlePress = () => {
    // 🔥 FIX: Naye JSON mein direct complete 'url' milta hai, prefix ki zaroorat nahi.
    const fullUrl = item.url;
    
    if (!fullUrl) {
      Alert.alert("Error", "No link available for this article.");
      return;
    }

    Alert.alert(
      "Open Link",
      `Do you want to read this article from ${item.source?.name || "the source"}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Open", onPress: () => Linking.openURL(fullUrl) }
      ]
    );
  };

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={handlePress}>
        
        {/* 🔥 Thumbnail Image - Naya Addition premium look ke liye */}
        <Image 
          source={{ uri: item.urlToImage || DEFAULT_NEWS_IMAGE }} 
          style={styles.cardImage} 
          resizeMode="cover"
        />

        <View style={styles.cardContent}>
          {/* Top Row: Type Badge & Date */}
          <View style={styles.cardHeader}>
            <View style={styles.badgeContainer}>
              <MaterialIcons name="article" size={14} color={PRIMARY_COLOR} />
              <Text style={styles.badgeText} numberOfLines={1}>
                {item.source?.name ? item.source.name.toUpperCase() : 'UPDATE'}
              </Text>
            </View>
            <Text style={styles.dateText}>{formatDate(item.publishedAt)}</Text>
          </View>

          {/* Title */}
          <Text style={styles.titleText} numberOfLines={3}>
            {/* JSON mein title 'title' (lowercase) hai */}
            {item.title}
          </Text>

          {/* Footer: Read More Link */}
          <View style={styles.cardFooter}>
            <Text style={styles.readMoreText}>Read Article</Text>
            <MaterialIcons name="arrow-forward-ios" size={14} color={PRIMARY_COLOR} />
          </View>
        </View>

      </TouchableOpacity>
    </Animated.View>
  );
};

// 📱 Main Screen Component
export default function NewsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNewsData();
  }, []);

  const fetchNewsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getWHONews();
      
      // 🔥 FIX: Naye JSON format ko target kiya
      const fetchedArticles = response?.articles || response?.data?.articles || [];
      
      if (fetchedArticles && fetchedArticles.length > 0) {
        setNews(fetchedArticles);
      } else {
        setNews([]);
      }
    } catch (err) {
      console.error("News Fetch Error:", err);
      setError("Unable to load latest updates. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Render Loading State
  if (loading) {
    return (
      <View style={[styles.mainContainer, styles.centerContent]}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        <Text style={styles.loadingText}>Fetching Latest News...</Text>
      </View>
    );
  }

  // Render Error State
  if (error) {
    return (
      <View style={[styles.mainContainer, styles.centerContent]}>
        <MaterialIcons name="error-outline" size={60} color="#EF4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchNewsData}>
          <Text style={styles.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Render Empty State
  if (!loading && news.length === 0) {
    return (
      <View style={[styles.mainContainer, styles.centerContent]}>
        <Ionicons name="newspaper-outline" size={60} color="#9CA3AF" />
        <Text style={styles.emptyText}>No news available at the moment.</Text>
      </View>
    );
  }

  // Render Main List
  return (
    <View style={[styles.mainContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      
      {/* HEADER */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back-ios" size={24} color="#111827" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Latest Updates</Text>
          <Text style={styles.headerSubtitle}>Global trends & insights</Text>
        </View>
      </View>

      {/* NEWS LIST */}
      <FlatList
        data={news}
        // 🔥 FIX: Id ki jagah ab url ko unique key banaya gaya hai
        keyExtractor={(item, index) => item.url || index.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => <AnimatedNewsCard item={item} index={index} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryBtn: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20, // Thoda aur rounded
    marginBottom: 20,
    overflow: 'hidden', // Image borders ko clip karne ke liye
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  cardImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#E5E7EB',
  },
  cardContent: {
    padding: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
    flexShrink: 1, // Badi source name ko truncate hone dega
    marginRight: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  titleText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    lineHeight: 26,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end', // Arrow ko right mein align kiya
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: '700',
    color: PRIMARY_COLOR,
    marginRight: 4,
  },
});