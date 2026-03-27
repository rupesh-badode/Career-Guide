import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// ⚠️ UPDATE THIS IMPORT PATH TO YOUR ACTUAL API FILE
import { getBlogs } from '../../../../src/services/mentorAPI';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75; // Next card thoda sa dikhega
const MENTOR_PRIMARY = '#8B5CF6';

// --- Premium Skeleton Loader for Blogs ---
const BlogSkeletonCard = () => {
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
    <View style={styles.cardContainer}>
      {/* Skeleton Image Cover */}
      <Animated.View style={[styles.skeletonImage, { opacity: pulseAnim }]} />

      {/* Skeleton Text Body */}
      <View style={styles.cardContent}>
        <Animated.View style={[styles.skeletonText, { opacity: pulseAnim, width: '90%', height: 16 }]} />
        <Animated.View style={[styles.skeletonText, { opacity: pulseAnim, width: '60%', height: 16, marginTop: 8 }]} />
        <Animated.View style={[styles.skeletonText, { opacity: pulseAnim, width: '30%', height: 12, marginTop: 15 }]} />
      </View>
    </View>
  );
};

export default function MentorBlogsOverview() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();


  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);

        const res = await getBlogs();
        console.log("FULL RESPONSE:", res);

        if (res?.data?.success) {
          setBlogs(res.data.data.slice(0, 4));
        }

      } catch (error) {
        console.error("Blogs fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const renderBlogCard = ({ item }) => {
    // Backend se aane wali date ko nicely format karna
    const publishDate = item.createdAt
      ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'Recently Published';

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.cardContainer}
        // 👉 Navigation set karo. Aap slug ya _id bhej sakte ho full blog padhne ke liye
        // Corrected code
        onPress={() => navigation.navigate("BlogDetails", { blog: item })}
      >
        {/* Cover Image */}
        <View style={styles.imageContainer}>
          <Image
            // 👉 Aapke JSON mein 'image' field aati hai (Cloudinary URL)
            source={{ uri: item.image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=600&auto=format&fit=crop' }}
            style={styles.coverImage}
          />
          {/* Category Badge (e.g., "NEET") */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category || 'General'}</Text>
          </View>
        </View>

        {/* Blog Details */}
        <View style={styles.cardContent}>
          <Text style={styles.blogTitle} numberOfLines={2}>
            {item.title}
          </Text>

          {/* 👉 Author Name added from your JSON */}
          <Text style={styles.authorText} numberOfLines={1}>
            By {item.author || 'Anonymous'}
          </Text>

          <View style={styles.footerRow}>
            <View style={styles.dateWrapper}>
              <Ionicons name="calendar-outline" size={14} color="#6B7280" />
              <Text style={styles.dateText}>{publishDate}</Text>
            </View>

            <View style={styles.readMoreWrapper}>
              <Text style={styles.readMoreText}>Read</Text>
              <Ionicons name="arrow-forward" size={14} color={MENTOR_PRIMARY} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.sectionContainer}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Latest Blogs</Text>
          <Text style={styles.sectionSubtitle}>Insights & guidance for you</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("MentorBlog")}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal List */}
      {loading ? (
        <View style={styles.skeletonWrapper}>
          <BlogSkeletonCard />
          <BlogSkeletonCard />
        </View>
      ) : blogs.length > 0 ? (
        <FlatList
          data={blogs}
          keyExtractor={(item, index) => item._id || index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          snapToInterval={CARD_WIDTH + 15} // Card Width + Margin for smooth paging
          decelerationRate="fast"
          renderItem={renderBlogCard}
        />
      ) : (
        <View style={styles.emptyBox}>
          <Ionicons name="document-text-outline" size={40} color="#D1D5DB" />
          <Text style={styles.emptyText}>No articles published yet.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 25,
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  viewAllText: {
    fontSize: 14,
    color: MENTOR_PRIMARY,
    fontWeight: '600',
  },
  listContent: {
    paddingLeft: 20,
    paddingRight: 5,
  },
  cardContainer: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginRight: 15, // Space between cards
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden', // Ensures image stays within rounded corners
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8 },
      android: { elevation: 3 },
      web: { boxShadow: '0px 4px 15px rgba(0,0,0,0.05)' }
    }),
  },
  imageContainer: {
    width: '100%',
    height: 120,
    backgroundColor: '#F3E8FF',
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: MENTOR_PRIMARY,
  },
  cardContent: {
    padding: 15,
  },
  blogTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1F2937',
    lineHeight: 22,
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
    fontWeight: '500',
  },
  readMoreWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readMoreText: {
    fontSize: 13,
    color: MENTOR_PRIMARY,
    fontWeight: '600',
    marginRight: 4,
  },

  // Skeleton Styles
  skeletonWrapper: {
    flexDirection: 'row',
    paddingLeft: 20,
  },
  skeletonImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#EDE9FE',
  },
  skeletonText: {
    backgroundColor: '#F3E8FF',
    borderRadius: 4,
  },
  authorText: {
    fontSize: 12,
    color: '#9CA3AF', // Light gray
    marginBottom: 10,
    marginTop: -5,
    fontStyle: 'italic',
  },
  emptyBox: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  emptyText: {
    color: '#9CA3AF',
    marginTop: 10,
    fontWeight: '500'
  }
});