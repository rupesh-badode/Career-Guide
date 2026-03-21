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
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getBlogs } from '../../../../src/services/user';

const { width } = Dimensions.get('window');
const PRIMARY_COLOR = '#4F46E5';

// --- 1. Skeleton Loader Component ---
const SkeletonCard = () => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Pulse animation for skeleton
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
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
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await getBlogs();
      if (res && res.data) {
        setBlogs(res.data.slice(0, 3)); // Home page par top 3
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. Animated Blog Card ---
  const BlogCard = ({ item, index }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateX = useRef(new Animated.Value(50)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          delay: index * 150,
          easing: Easing.out(Easing.back(1)),
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: 0,
          duration: 600,
          delay: index * 150,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
      ]).start();
    }, []);

    return (
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX }] }}>
        <TouchableOpacity 
          style={styles.newsCard} 
          activeOpacity={0.8}
          onPress={() => navigation.navigate('BlogDetails', { blog: item })}
        >
          {/* Thumbnail */}
          <Image source={{ uri: item.image }} style={styles.thumbnail} />
          
          {/* Content */}
          <View style={styles.contentContainer}>
            <View style={styles.metaRow}>
              <Text style={styles.categoryText}>{item.category}</Text>
              <View style={styles.dot} />
              <Text style={styles.authorText}>{item.author}</Text>
            </View>
            
            <Text style={styles.newsTitle} numberOfLines={2}>
              {item.title}
            </Text>
            
            <View style={styles.bottomRow}>
              <Ionicons name="calendar-outline" size={12} color="#9CA3AF" />
              <Text style={styles.dateText}>
                {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
              <Text style={styles.readMore}>Read Now →</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.sectionTitle}>Curated for You</Text>
          <View style={styles.accentBar} />
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('AllBlogs')}>
          <Text style={styles.viewAllText}>Explore All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        {loading ? (
          // Dikhane ke liye 3 Skeletons
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          blogs.map((item, index) => <BlogCard key={item._id} item={item} index={index} />)
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 25,
    paddingBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  accentBar: {
    height: 4,
    width: 30,
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 2,
    marginTop: 4,
  },
  viewAllText: {
    fontSize: 14,
    color: PRIMARY_COLOR,
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: 20,
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
  // Skeleton Specific
  skeletonLine: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    marginBottom: 8,
  },
  loaderContainer: {
    paddingVertical: 40,
  }
});