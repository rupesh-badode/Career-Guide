import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getBlogs } from '../../../../src/services/user'; // Path verify kar lena

const PRIMARY_COLOR = '#4F46E5'; // Indigo

export default function Blog() {
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
        // Sirf top 3 blogs dikhayenge home page par
        setBlogs(res.data.slice(0, 3));
      }
    } catch (err) {
      console.error("Blog fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderBlogCard = ({ item }) => {
    // console.log("item",item) // Debugging ke liye thik hai

    // Fallback date agar createdAt undefined/null ho
    const date = item.createdAt
      ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : 'Recently';

    // Fallback author aur content ke liye errors avoid karne ke liye
    const authorName = item.author || 'Admin';
    const authorInitial = authorName.charAt(0).toUpperCase();
    const safeContent = item.content ? item.content.replace(/<[^>]*>?/gm, '') : '';

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('BlogDetails', { blog: item })} // 👈 Yahan maine `blog: item` pass kiya hai (Pichle component logic ke according)
      >
        {/* Blog Image */}
        <Image source={{ uri: item.image || 'https://via.placeholder.com/290x150' }} style={styles.blogImage} />

        {/* Category Badge - Absolutely Positioned */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category || 'General'}</Text>
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.blogTitle} numberOfLines={2}>
            {item.title}
          </Text>

          <Text style={styles.excerpt} numberOfLines={2}>
            {safeContent}
          </Text>

          {/* Footer ko excerpt aur title se bilkul alag rakha gaya hai */}
          <View style={styles.footer}>
            <View style={styles.authorRow}>
              <View style={styles.authorAvatar}>
                <Text style={styles.avatarText}>{authorInitial}</Text>
              </View>
              <Text style={styles.authorName}>{authorName}</Text>
            </View>

            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={14} color="#6B7280" />
              <Text style={styles.dateText}>{date}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) return <ActivityIndicator color={PRIMARY_COLOR} style={{ marginVertical: 20 }} />;
  if (blogs.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Blogs</Text>
          <Text style={styles.subtitle}>Stay updated with career tips</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Blogs')}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={blogs}
        renderItem={renderBlogCard}
        keyExtractor={(item) => item._id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listPadding}
        snapToInterval={290 + 20} // Card width + margin
        decelerationRate="fast"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    marginTop: 16,
    marginBottom: 8
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  viewAll: {
    color: PRIMARY_COLOR,
    fontWeight: '700',
    fontSize: 14,
  },
  listPadding: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  card: {
    width: 290,
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginRight: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.1, shadowRadius: 10 },
      android: { elevation: 5 },
    }),
  },
  blogImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#E5E7EB',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: PRIMARY_COLOR,
    textTransform: 'uppercase',
  },
  contentContainer: {
    padding: 15,
  },
  blogTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    lineHeight: 22,
    height: 44, // 2 lines fixed height
  },
  excerpt: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 8,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: PRIMARY_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  authorName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },
});