import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { getBooks } from '../../../../src/services/publicAPI';
import { AddtoCart } from '../../../../src/services/user';
import Ionicons from '@expo/vector-icons/Ionicons';

const MyBookList = ({ navigation }) => {
  const [booksList, setBooksList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCartId, setAddingToCartId] = useState(null);

  // Fetch all books for the shop
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const response = await getBooks();
        const booksArray = response?.data?.data || response?.data || response || [];
        const activeBooks = booksArray.filter(book => book.isActive);
        setBooksList(activeBooks);
      } catch (error) {
        console.log("Error loading catalog:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, []);


  // Handle Add to Cart action
  const handleAddToCart = async (book) => {
    try {
      // Start loader for this specific book button
      setAddingToCartId(book._id);

      // Payload structure based on your Cart Schema
      const payload = {
        bookId: book._id,
        quantity: 1,
        // Defaulting to 'hardcopy' if type is 'both' for the cart schema
        type: book.bookType === 'both' ? 'hardcopy' : book.bookType
      };


      // Call the real API
      const res = await AddtoCart(payload);

      // Show Success Message
      Alert.alert("Success!", `"${book.title}" has been added to your cart.`);

    } catch (error) {
      console.log("Cart Error:", error);
      Alert.alert("Oops!", "Something went wrong while adding to cart.");

    } finally {
      // Stop loader
      setAddingToCartId(null);
    }
  };

  // Component to render when the store is empty
  const EmptyListMessage = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🏪</Text>
        <Text style={styles.emptyTitle}>Store is Empty</Text>
        <Text style={styles.emptySubtitle}>We are updating our catalog. Check back soon!</Text>
      </View>
    );
  };

  // Individual Shop Card Component
  const renderBookCard = ({ item }) => {
    const hasDiscount = item.discountPrice && item.discountPrice < item.price;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.card}
        onPress={() => navigation.navigate('SingleBook', { id: item._id })}
      >
        {/* Left Side: Book Cover */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.coverImage || 'https://via.placeholder.com/150x200?text=No+Cover' }}
            style={styles.coverImage}
          />
          {item.bookType && (
            <View style={styles.formatBadge}>
              <Text style={styles.formatText}>{item.bookType.toUpperCase()}</Text>
            </View>
          )}
        </View>

        {/* Right Side: Details & Actions */}
        <View style={styles.detailsContainer}>
          <View>
            <Text style={styles.categoryText}>{item.category || "General"}</Text>
            <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.author} numberOfLines={1}>By {item.author}</Text>
          </View>

          {/* Pricing Section */}
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

          {/* Bottom Action: Add to Cart */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[
                styles.addToCartBtn,
                item.stock === 0 && styles.outOfStockBtn // Change style if out of stock
              ]}
              disabled={item.stock === 0}
              onPress={() => handleAddToCart(item)}
            >
              <Text style={styles.addToCartText}>
                {item.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}

      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            style={styles.backButtonContainer}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#0f172a" />
          </TouchableOpacity>
        </View>

        <Text style={styles.headerTitle}>All Books</Text>
        <Text style={styles.headerSubtitle}>
          {booksList?.length || 0} books available
        </Text>
      </View>

      {/* Loading State or List */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      ) : (
        <FlatList
          data={booksList}
          keyExtractor={(item) => item._id}
          renderItem={renderBookCard}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyListMessage />}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingTop: 25,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTopRow: {
    marginBottom: 10,
  },
  backButtonContainer: {
    alignSelf: 'flex-start',
    paddingVertical: 5,
    paddingRight: 15,
  },
  backIcon: {
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    width: 100,
    height: 145,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#e2e8f0',
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  formatBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(79, 70, 229, 0.9)', // Using primary theme color
    paddingVertical: 4,
    alignItems: 'center',
  },
  formatText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  detailsContainer: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'space-between',
  },
  categoryText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F59E0B',
    marginBottom: 4,
  },
  author: {
    fontSize: 13,
    color: '#64748b',
  },
  priceRow: {
    marginTop: 8,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  discountPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  originalPrice: {
    fontSize: 13,
    color: '#94a3b8',
    textDecorationLine: 'line-through',
  },
  actionRow: {
    marginTop: 'auto', // Pushes the button to the bottom
  },
  addToCartBtn: {
    backgroundColor: '#F59E0B', // Premium Amber for add to cart
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outOfStockBtn: {
    backgroundColor: '#cbd5e1', // Grayed out if no stock
  },
  addToCartText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
  }
});

export default MyBookList;