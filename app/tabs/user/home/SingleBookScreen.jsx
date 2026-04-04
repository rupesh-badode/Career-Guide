import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Alert // FIXED: Added missing Alert import
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

// Make sure this path matches your project structure perfectly
import { getSinglebook } from '../../../../src/services/publicAPI';
import { AddtoCart } from '../../../../src/services/user';

const { width, height } = Dimensions.get('window');

const SingleBookScreen = ({ route, navigation }) => {
  const bookId = route?.params?.id;

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // FIXED: Added state to track cart loading status
  const [addingToCartId, setAddingToCartId] = useState(null);

  useEffect(() => {
    const fetchBookDetails = async () => {
      if (!bookId) {
        setError("Invalid Book ID.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await getSinglebook(bookId);
        const bookData = response?.data?.data || response?.data || response;
        setBook(bookData);
      } catch (err) {
        console.log("Error fetching single book:", err);
        setError("Failed to load book details.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [bookId]);

  const handleAddToCart = async (bookData) => {
    try {
      setAddingToCartId(bookData._id);

      const payload = {
        bookId: bookData._id,
        quantity: 1,
        type: bookData.bookType === 'both' ? 'hardcopy' : bookData.bookType
      };

      await AddtoCart(payload);
      Alert.alert("Success!", `"${bookData.title}" has been added to your cart.`);

    } catch (err) {
      console.log("Cart Error:", err);
      Alert.alert("Oops!", "Something went wrong while adding to cart.");
    } finally {
      setAddingToCartId(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#F27A21" />
      </View>
    );
  }

  if (error || !book) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || "Book not found"}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Check if current book is being added to cart
  const isAddingThisBook = addingToCartId === book._id;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header/Nav - Floating over image */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#0f172a" />   
          </TouchableOpacity>
        </View>

        {/* Cover Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: book.coverImage || "https://via.placeholder.com/400x600?text=No+Cover" }}
            style={styles.coverImage}
            resizeMode="cover"
          />
        </View>

        {/* Details Section */}
        <View style={styles.detailsContainer}>

          {/* Badges */}
          <View style={styles.badgeRow}>
            {book.category ? (
              <View style={styles.categoryBadge}>
                <Text style={styles.badgeText}>{book.category}</Text>
              </View>
            ) : null}

            {book.bookType ? (
              <View style={styles.typeBadge}>
                <Text style={styles.badgeTextWhite}>
                  {book.bookType === 'both' ? 'PDF + Hardcopy' : book.bookType}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Title & Author */}
          <Text style={styles.title}>{book.title}</Text>
          <Text style={styles.author}>By {book.author}</Text>

          {/* Pricing & Stock */}
          <View style={styles.priceStockRow}>
            <View style={styles.priceContainer}>
              {book.discountPrice && book.discountPrice < book.price ? (
                <>
                  <Text style={styles.discountPrice}>₹{book.discountPrice}</Text>
                  <Text style={styles.originalPrice}>₹{book.price}</Text>
                </>
              ) : (
                <Text style={styles.discountPrice}>₹{book.price}</Text>
              )}
            </View>

            <View style={[styles.stockBadge, { backgroundColor: book.stock > 0 ? '#dcfce7' : '#fee2e2' }]}>
              <Text style={[styles.stockText, { color: book.stock > 0 ? '#166534' : '#991b1b' }]}>
                {book.stock > 0 ? `In Stock (${book.stock})` : 'Out of Stock'}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Description */}
          <Text style={styles.sectionTitle}>About this book</Text>
          <Text style={styles.description}>
            {book.description || "No description available for this book."}
          </Text>

        </View>
      </ScrollView>

      {/* Fixed Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.buyButton, 
            (book.stock === 0 || isAddingThisBook) && styles.disabledButton // Also disable if currently adding
          ]}
          disabled={book.stock === 0 || isAddingThisBook}
          onPress={() => handleAddToCart(book)}
        >
          {/* FIXED: Show loader if adding to cart, else show text */}
          {isAddingThisBook ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.buyButtonText}>
              {book.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 16,
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 5,
  },
  imageContainer: {
    width: width,
    height: height * 0.45,
    backgroundColor: '#f1f5f9',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    padding: 24,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24, 
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  typeBadge: {
    backgroundColor: '#F27A21', 
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#475569',
    textTransform: 'uppercase',
  },
  badgeTextWhite: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  author: {
    fontSize: 16,
    color: '#64748b',
    fontStyle: 'italic',
    marginBottom: 20,
  },
  priceStockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  discountPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  originalPrice: {
    fontSize: 16,
    color: '#94a3b8',
    textDecorationLine: 'line-through',
  },
  stockBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  stockText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: '#475569',
    paddingBottom: 80, 
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    padding: 16,
    paddingBottom: 32, 
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  buyButton: {
    backgroundColor: '#F27A21', 
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56, // Prevents button from shrinking when loading spinner replaces text
  },
  disabledButton: {
    backgroundColor: '#94a3b8',
  },
  buyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#0f172a',
    fontWeight: '600',
  }
});

export default SingleBookScreen;