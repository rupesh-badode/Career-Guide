import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
// Make sure this path is perfectly pointing to your API file
import { getBooks } from '../../../../src/services/publicAPI';

import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const FeaturedBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigation = useNavigation();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await getBooks();


        const booksArray = response?.data || response?.data?.data || response || [];
        // Filter only active books and pick top 3
        const activeFeaturedBooks = booksArray
          .filter(book => book.isActive)
          .slice(0, 3);

        setBooks(activeFeaturedBooks);
      } catch (err) {
        setError("Failed to load books. Please try again.");
        console.log("err", err)
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#F27A21" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const renderBookCard = ({ item }) => {
    // Logic: Only show discount if it actually is cheaper than original price
    const hasDiscount = item.discountPrice && item.discountPrice < item.price;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.card}
        // Passing the ID to the next screen
        onPress={() => navigation.navigate("SingleBook", { id: item._id })}
      >
        <View style={styles.imageContainer}>
          <Image
            // Fallback image added in case coverImage is empty
            source={{ uri: item.coverImage || 'https://via.placeholder.com/400x600?text=No+Cover' }}
            style={styles.coverImage}
            resizeMode="cover"
          />

          {item.category ? (
            <View style={styles.categoryBadge}>
              <Text style={styles.badgeText}>{item.category}</Text>
            </View>
          ) : null}

          {item.bookType ? (
            <View style={styles.typeBadge}>
              <Text style={styles.badgeTextWhite}>{item.bookType}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.author} numberOfLines={1}>By {item.author}</Text>

          <View style={styles.priceRow}>
            {hasDiscount ? (
              <View style={styles.priceContainer}>
                <Text style={styles.discountPrice}>₹{item.discountPrice}</Text>
                <Text style={styles.originalPrice}>₹{item.price}</Text>
              </View>
            ) : (
              <Text style={styles.discountPrice}>₹{item.price}</Text>
            )}
          </View>

          <View style={styles.button}>
            <Text style={styles.buttonText}>View Details</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.sectionTitle}>
            Book <Text style={styles.highlightText}>Bazaar</Text>
          </Text>
          <View style={styles.subtitleRow}>
            <Ionicons name="sparkles" size={14} color="#F27A21" />
            <Text style={styles.sectionSubtitle}>Top picks for you</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('AllBooks')}>
          <Text style={styles.showAllText}>Show All</Text>
        </TouchableOpacity>
      </View>

      {books.length > 0 ? (
        <FlatList
          data={books}
          keyExtractor={(item) => item._id}
          renderItem={renderBookCard}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          snapToInterval={266} // 250 (card width) + 16 (margins)
          decelerationRate="fast"
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No featured books right now.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    paddingVertical: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    paddingHorizontal: 20,
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 10,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
  },
  container: {
    paddingVertical: 24,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  showAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F27A21', // Updated to match your theme button color
    marginBottom: 4,
  },
  listContainer: {
    paddingHorizontal: 8,
  },
  card: {
    width: 250,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 2,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 150,
    width: '100%',
    backgroundColor: '#e2e8f0',
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#F27A21',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e293b',
    textTransform: 'uppercase',
  },
  badgeTextWhite: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  detailsContainer: {
    padding: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  author: {
    fontSize: 13,
    color: '#64748b',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  discountPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  originalPrice: {
    fontSize: 14,
    color: '#94a3b8',
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
  button: {
    backgroundColor: '#F27A21',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  headerTitleContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A', // Agar Dark Mode hai toh ise '#FFFFFF' kar dena
    letterSpacing: 0.5,
  },
  highlightText: {
    color: '#F27A21', // Premium Amber
    fontStyle: 'italic', // Thoda dynamic look dene ke liye
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748B', // Agar Dark Mode hai toh ise '#94A3B8' kar dena
    fontWeight: '600',
    marginLeft: 6, // Icon aur text ke beech thoda gap
  },
});

export default FeaturedBooks;