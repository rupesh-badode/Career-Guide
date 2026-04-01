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
  Alert
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getWHONews } from '../../../../src/services/user';

const PRIMARY_COLOR = '#F59E0B';

// 🎨 Helper: Alag-alag NewsType ke liye colors set karta hai
const getBadgeStyles = (type) => {
  switch (type?.toLowerCase()) {
    case 'news release':
      return { bg: '#DBEAFE', text: '#1D4ED8', icon: 'newspaper' }; 
    case 'departmental update':
      return { bg: '#ECFDF5', text: '#047857', icon: 'domain' }; 
    case 'statement':
      return { bg: '#F3E8FF', text: '#7E22CE', icon: 'record-voice-over' }; 
    case 'medical product alert':
      return { bg: '#FEE2E2', text: '#B91C1C', icon: 'warning' }; 
    default:
      return { bg: '#F3F4F6', text: '#374151', icon: 'article' }; 
  }
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
        delay: index * 100, // Stagger effect
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 7,
        tension: 40,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const badge = getBadgeStyles(item.NewsType);

  const handlePress = () => {
    // Ye item.ItemDefaultUrl usually "https://who.int/..." ke aage lagta hai. 
    // Agar WHO ka complete URL chahiye toh prefix add karein.
    const fullUrl = `https://www.who.int${item.ItemDefaultUrl}`;
    
    Alert.alert(
      "Open Link",
      "Do you want to read this article on the WHO website?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Open", onPress: () => Linking.openURL(fullUrl) }
      ]
    );
  };

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={handlePress}>
        
        {/* Top Row: Type Badge & Date */}
        <View style={styles.cardHeader}>
          <View style={[styles.badgeContainer, { backgroundColor: badge.bg }]}>
            <MaterialIcons name={badge.icon} size={14} color={badge.text} />
            <Text style={[styles.badgeText, { color: badge.text }]}>
              {item.NewsType ? item.NewsType.toUpperCase() : 'UPDATE'}
            </Text>
          </View>
          <Text style={styles.dateText}>{item.FormatedDate}</Text>
        </View>

        {/* Title */}
        <Text style={styles.titleText} numberOfLines={3}>
          {item.Title}
        </Text>

        {/* Footer: Read More Link */}
        <View style={styles.cardFooter}>
          <Text style={styles.readMoreText}>Read Article</Text>
          <MaterialIcons name="arrow-forward-ios" size={14} color={PRIMARY_COLOR} />
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

  // Fetch API on component mount
  useEffect(() => {
    fetchNewsData();
  }, []);

  const fetchNewsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getWHONews();
      // Aapke API response mein array 'data' key ke andar hai (response.data.data)
      if (response && response.data) {
        setNews(response.data);
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
          <Text style={styles.headerSubtitle}>Global health news & releases</Text>
        </View>
      </View>

      {/* NEWS LIST */}
      <FlatList
        data={news}
        keyExtractor={(item, index) => item.Id || index.toString()}
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
    fontWeight: '800',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  titleText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
    lineHeight: 24,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: PRIMARY_COLOR,
    marginRight: 4,
  },
});