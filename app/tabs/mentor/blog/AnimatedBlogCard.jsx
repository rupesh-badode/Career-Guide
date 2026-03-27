import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator, 
  SafeAreaView, 
  Platform, 
  StatusBar,
  Animated 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// 1. CHANGE THIS IMPORT
import { useNavigation } from '@react-navigation/native'; 
import { getBlogs } from '../../../../src/services/mentorAPI';


const AnimatedBlogCard = ({ item, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const navigation = useNavigation();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100, 
        useNativeDriver: true, 
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      })
    ]).start();
  }, [fadeAnim, translateY, index]);

  return (
    <Animated.View 
      style={[
        styles.cardContainer, 
        { 
          opacity: fadeAnim, 
          transform: [{ translateY: translateY }] 
        }
      ]}
    >
      <TouchableOpacity activeOpacity={0.8} style={styles.card} 
      // Corrected code
onPress={() => navigation.navigate("BlogDetails", { blog: item })}
      >
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.image} />
        ) : (
          <View style={styles.noImage}>
            <Text style={styles.noImageText}>No Image</Text>
          </View>
        )}
        <View style={styles.contentContainer}>
          <Text style={styles.category}>{item.category || 'General'}</Text>
          <Text style={styles.title} numberOfLines={2}>
            {item.title || 'Untitled Blog'}
          </Text>
          <Text style={styles.excerpt} numberOfLines={3}>
            {item.excerpt || item.description || 'Read more about this topic...'}
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.footerText}>{item.author || 'Admin'}</Text>
            <Text style={styles.footerText}>
              {item.createdAt 
                ? new Date(item.createdAt).toLocaleDateString() 
                : 'Recently updated'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const MentorBlog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 2. CHANGE THIS HOOK
  const navigation = useNavigation();

  const fetchBlogs = async () => {
    setLoading(true);
    setError('');
    const result = await getBlogs();
    
    if (result.success) {
      // FIX: Directly target result.data.data where your array lives
      const blogArray = result.data?.data || [];
      setBlogs(blogArray);
    } else {
      setError(result.message);
    }
    setLoading(false);
    console.log("Result", result);
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // 3. CHANGE THE BACK FUNCTION
  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={handleGoBack} 
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Read Our Blogs</Text>
        <View style={styles.headerSpacer} /> 
      </View>

      <View style={styles.container}>
        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        ) : error ? (
          <View style={styles.centerContent}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={fetchBlogs} style={styles.retryButton}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : blogs.length === 0 ? (
          <View style={styles.centerContent}>
            <Text style={styles.emptyText}>No blogs found at the moment.</Text>
          </View>
        ) : (
          <FlatList
            data={blogs}
            keyExtractor={(item, index) => item._id?.toString() || index.toString()}
            renderItem={({ item, index }) => <AnimatedBlogCard item={item} index={index} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

// ... keep your styles exactly the same ...
// Styles remain identical to the previous version
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 4,
    marginLeft: -4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  headerSpacer: {
    width: 28, 
  },
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  cardContainer: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3, 
  },
  image: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  noImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: '#9CA3AF',
    fontWeight: '500',
  },
  contentContainer: {
    padding: 16,
  },
  category: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 24,
  },
  excerpt: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 16,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  retryText: {
    color: '#B91C1C',
    fontWeight: '600',
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 16,
  },
});

export default MentorBlog;