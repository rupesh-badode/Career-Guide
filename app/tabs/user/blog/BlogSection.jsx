import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  Easing,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// 👉 UPDATE THIS IMPORT PATH TO YOUR ACTUAL FILE
import { getBlogs } from '../../../../src/services/user';

const { width } = Dimensions.get('window');
const PRIMARY_COLOR = '#F59E0B';

// --- 1. Skeleton Loader Component ---
const SkeletonCard = () => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.newsCard}>
      <Animated.View style={[styles.thumbnail, { opacity, backgroundColor: '#E5E7EB' }]} />
      <View style={styles.contentContainer}>
        <Animated.View style={[styles.skeletonLine, { width: '40%', opacity }]} />
        <Animated.View style={[styles.skeletonLine, { width: '90%', height: 16, opacity }]} />
        <Animated.View style={[styles.skeletonLine, { width: '70%', opacity }]} />
      </View>
    </View>
  );
};

export default function BlogSection() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets(); // 👉 Safe Area (Notch) Support

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // 👉 NEW: Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await getBlogs();
      if (res && res.data) {
        setBlogs(res.data);
        
        // 👉 Extract unique categories from API data dynamically
        const uniqueCategories = ['All', ...new Set(res.data.map(item => item.category).filter(Boolean))];
        setCategories(uniqueCategories);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 👉 NEW: Filtering Logic
  const filteredBlogs = blogs.filter((blog) => {
    // 1. Category Filter
    const matchesCategory = activeCategory === 'All' || blog.category === activeCategory;
    // 2. Search Query Filter
    const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (blog.author && blog.author.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  // --- 2. Animated Blog Card ---
  const BlogCard = ({ item, index }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateX = useRef(new Animated.Value(50)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, delay: index * 100, easing: Easing.out(Easing.back(1)), useNativeDriver: true }),
        Animated.timing(translateX, { toValue: 0, duration: 600, delay: index * 100, easing: Easing.out(Easing.exp), useNativeDriver: true }),
      ]).start();
    }, []);

    return (
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX }] }}>
        <TouchableOpacity 
          style={styles.newsCard} 
          activeOpacity={0.8}
          onPress={() => navigation.navigate('BlogDetails', { blog: item })}
        >
          <Image source={{ uri: item.image || 'https://via.placeholder.com/150' }} style={styles.thumbnail} />
          <View style={styles.contentContainer}>
            <View style={styles.metaRow}>
              <Text style={styles.categoryText}>{item.category || 'General'}</Text>
              <View style={styles.dot} />
              <Text style={styles.authorText}>{item.author || 'Admin'}</Text>
            </View>
            <Text style={styles.newsTitle} numberOfLines={2}>{item.title}</Text>
            <View style={styles.bottomRow}>
              <Ionicons name="calendar-outline" size={12} color="#9CA3AF" />
              <Text style={styles.dateText}>
                {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently'}
              </Text>
              <Text style={styles.readMore}>Read Now →</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    // 👉 Added insets.top to protect content from the notch
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header & Search */}
      <View style={styles.headerSection}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={24} color="#1F2937" />
          </TouchableOpacity>

          <View style={styles.titleWrapper}>
            <Text style={styles.sectionTitle}>Curated for You</Text>
            <View style={styles.accentBar} />
          </View>
        </View>

        {/* 👉 SEARCH BAR */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search articles, authors..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#D1D5DB" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 👉 CATEGORY FILTER (Horizontal Scroll) */}
      {!loading && categories.length > 1 && (
        <View style={styles.filterWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {categories.map((cat, index) => {
              const isActive = activeCategory === cat;
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.filterPill, isActive && styles.activeFilterPill]}
                  onPress={() => setActiveCategory(cat)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.filterText, isActive && styles.activeFilterText]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Blog List Area */}
      <View style={styles.listContainer}>
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : filteredBlogs.length === 0 ? (
           // Empty State if search/filter fails
           <View style={styles.emptyContainer}>
             <Ionicons name="document-text-outline" size={40} color="#D1D5DB" />
             <Text style={styles.emptyText}>No articles found.</Text>
           </View>
        ) : (
           // Show filtered items
          filteredBlogs.slice(0, 5).map((item, index) => (
            <BlogCard key={item._id || index} item={item} index={index} />
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Ensures it takes full height if used as main screen
    backgroundColor: '#FAFAFA',
    marginTop:20,
  },
  headerSection: {
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleWrapper: {
    flex: 1,
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  accentBar: {
    height: 4,
    width: 35,
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 2,
    marginTop: 6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4 },
      android: { elevation: 1 },
    }),
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#111827',
  },
  filterWrapper: {
    marginBottom: 16,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 8, // Requires newer React Native, use margin if error occurs
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
    marginRight: 8, // Fallback if gap doesn't work
  },
  activeFilterPill: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  filterText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '600',
  },
  activeFilterText: {
    color: PRIMARY_COLOR,
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  newsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  thumbnail: {
    width: 90,
    height: 90,
    borderRadius: 15,
    backgroundColor: '#F3F4F6',
  },
  contentContainer: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryText: {
    fontSize: 10,
    color: PRIMARY_COLOR,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  authorText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 6,
  },
  newsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    lineHeight: 20,
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginLeft: 4,
    flex: 1,
  },
  readMore: {
    fontSize: 11,
    fontWeight: '700',
    color: PRIMARY_COLOR,
  },
  skeletonLine: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    marginBottom: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 15,
    color: '#9CA3AF',
  }
});