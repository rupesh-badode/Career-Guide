import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Platform,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getWHONews } from '../../../../src/services/user'; // Update path if needed
import { useNavigation } from '@react-navigation/native';

const PRIMARY_COLOR = '#4F46E5';

// Helper function to assign a relevant placeholder image based on the News Type
const getPlaceholderImage = (type) => {
  switch (type?.toLowerCase()) {
    case 'news release':
      return 'https://images.unsplash.com/photo-1584483760252-c1367f8ebce4?auto=format&fit=crop&w=200&q=80'; // Hospital/Health
    case 'departmental update':
      return 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=200&q=80'; // Medical tech
    case 'statement':
      return 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=200&q=80'; // Microphones/Press
    case 'medical product alert':
      return 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=200&q=80'; // Medicine/Pills
    default:
      return 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=200&q=80'; // Generic health
  }
};

export default function NewsSection() {
  // 1. Corrected useState syntax
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  // 2. Corrected async fetch function
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getWHONews();
      // Check if response has data array
      if (res && res.data) {
        // Sirf top 3 news dikhani hai homepage par toh .slice(0, 3) use kar rahe hain
        setNewsData(res.data.slice(0, 3)); 
      }
    } catch (error) {
      console.error("Failed to fetch news:", error);
    } finally {
      setLoading(false);
    }
  };

  // 3. Added Empty Dependency Array [] so it only runs once
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      
      {/* Header Section */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Latest Insights</Text>
        <TouchableOpacity onPress={()=>navigation.navigate("News") }  >
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      {/* Loading State */}
      {loading ? (
        <View style={styles.loaderContainer}>
           <ActivityIndicator size="small" color={PRIMARY_COLOR} />
        </View>
      ) : (
        /* News List */
        <View style={styles.listContainer}>
          {newsData.map((item) => (
            <TouchableOpacity key={item.Id} style={styles.newsCard} activeOpacity={0.7}>
              
              {/* Left Side: Thumbnail */}
              <Image 
                source={{ uri: getPlaceholderImage(item.NewsType) }} 
                style={styles.thumbnail} 
              />
              
              {/* Right Side: Content */}
              <View style={styles.contentContainer}>
                <View style={styles.metaRow}>
                  <Text style={styles.categoryText} numberOfLines={1}>
                    {item.NewsType || 'Update'}
                  </Text>
                  <View style={styles.dot} />
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
          ))}
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 10,
  },
  loaderContainer: {
    paddingVertical: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // --- Header Styles ---
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
    color: PRIMARY_COLOR, // Matched with your Emerald theme
    fontWeight: '600',
  },
  // --- List & Card Styles ---
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
  // --- Image Styles ---
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  // --- Content Styles ---
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
    maxWidth: '65%', // Prevents long categories from pushing out the read time
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