import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const PRIMARY_COLOR = '#4F46E5';

export default function BlogDetails() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  
  // 👉 Data jo aapse pichli screen (BlogSection) se bheja tha wo yaha milega
  const { blog } = route.params || {};

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  // Agar galti se bina data ke open ho jaye
  if (!blog) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Blog data not found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
          <Text style={{ color: PRIMARY_COLOR }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 👉 Fixed Header with Back Button over the image */}
      <View style={[styles.header, { top: Math.max(insets.top, 20) }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()} 
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        
        {/* Optional Share Button */}
        <TouchableOpacity 
          style={styles.backButton} 
          activeOpacity={0.8}
        >
          <Ionicons name="share-social" size={22} color="#1F2937" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* 👉 Main Image */}
        <Image 
          source={{ uri: blog.image || 'https://via.placeholder.com/600x400' }} 
          style={styles.heroImage} 
        />

        <Animated.View style={[styles.contentWrapper, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {/* 👉 Tags / Category */}
          <View style={styles.tagContainer}>
            <View style={styles.tagBadge}>
              <Text style={styles.tagText}>{blog.category || 'General'}</Text>
            </View>
            <Text style={styles.dateText}>
              {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Recently Published'}
            </Text>
          </View>

          {/* 👉 Title */}
          <Text style={styles.title}>{blog.title}</Text>

          {/* 👉 Author Info */}
          <View style={styles.authorContainer}>
            <View style={styles.authorAvatar}>
              <Text style={styles.avatarInitial}>{blog.author ? blog.author.charAt(0) : 'A'}</Text>
            </View>
            <View>
              <Text style={styles.authorName}>{blog.author || 'Admin'}</Text>
              <Text style={styles.readTime}>5 min read</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* 👉 Main Content Description */}
          <Text style={styles.description}>
            {blog.description || 'No detailed description available for this blog post.'}
          </Text>

          {/* Note: Agar backend se HTML aa raha hai (jaise CKEditor se), toh yahan <Text> ki jagah 'react-native-render-html' package use karna padega */}

        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10, // Ensure header is above image
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 4 },
    }),
  },
  heroImage: {
    width: '100%',
    height: width * 0.8, // Dynamic height based on screen width
    resizeMode: 'cover',
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30, // Pulls the content up over the image
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  tagContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tagBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    color: PRIMARY_COLOR,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  dateText: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '500',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 34,
    marginBottom: 20,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  authorAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarInitial: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  authorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  readTime: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 26,
    fontWeight: '400',
  },
});