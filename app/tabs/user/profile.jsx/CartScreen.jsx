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
  Platform
} from 'react-native';
import { getCart } from '../../../../src/services/user';
import { Ionicons } from '@expo/vector-icons';


const CartScreen = ({ navigation }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        const res = await getCart();
        const result = res?.data || [mockCart];
        
        if (result) {
          setCart(result);
        } else {
          setError("No cart data found.");
        }
      } catch (err) {
        setError("Failed to load cart.");
      } finally {
        setLoading(false);
      }
    };

    // const mockCart = {
    //   _id: 'cart_123',
    //   totalAmount: 1298,
    //   items: [
    //     {
    //       _id: 'item_1',
    //       quantity: 1,
    //       type: 'hardcopy',
    //       bookId: {
    //         _id: 'book_1',
    //         title: 'The Lean Startup',
    //         author: 'Eric Ries',
    //         price: 499,
    //         coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop',
    //       }
    //     },
    //     {
    //       _id: 'item_2',
    //       quantity: 1,
    //       type: 'pdf',
    //       bookId: {
    //         _id: 'book_2',
    //         title: 'Clean Code',
    //         author: 'Robert C. Martin',
    //         price: 899,
    //         discountPrice: 799,
    //         coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=400&auto=format&fit=crop',
    //       }
    //     }
    //   ]
    // };

    fetchCart();
  }, []);

  const updateQuantity = (itemId, change) => {
    const updatedItems = cart.items.map(item => {
      if (item._id === itemId) {
        const newQuantity = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    });

    const newTotal = updatedItems.reduce((sum, item) => {
      const price = item.bookId.discountPrice || item.bookId.price;
      return sum + (price * item.quantity);
    }, 0);

    setCart({ ...cart, items: updatedItems, totalAmount: newTotal });
  };

  const removeItem = (itemId) => {
    const updatedItems = cart.items.filter(item => item._id !== itemId);
    const newTotal = updatedItems.reduce((sum, item) => {
      const price = item.bookId.discountPrice || item.bookId.price;
      return sum + (price * item.quantity);
    }, 0);
    setCart({ ...cart, items: updatedItems, totalAmount: newTotal });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  const renderCartItem = ({ item }) => {
    const activePrice = item.bookId.discountPrice || item.bookId.price;

    return (
      <View style={styles.card}>
        <Image
          source={{ uri: item.bookId.coverImage }}
          style={styles.coverImage}
        />

        <View style={styles.detailsContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={2}>{item.bookId.title}</Text>
            <TouchableOpacity onPress={() => removeItem(item._id)} style={styles.deleteBtn}>
              <Text style={styles.deleteIcon}>X </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.author}>By {item.bookId.author}</Text>

          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{item.type.toUpperCase()}</Text>
          </View>

          <View style={styles.bottomRow}>
            <Text style={styles.price}>₹{activePrice}</Text>

            <View style={styles.quantityContainer}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item._id, -1)}>
                <Text style={styles.qtyBtnText}>-</Text>
              </TouchableOpacity>

              <Text style={styles.qtyText}>{item.quantity}</Text>

              <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item._id, 1)}>
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
          <Ionicons
            name="arrow-back"
            size={24}
            color="#1F2937"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
        <Text style={styles.headerTitle}>My Cart</Text>
          <View style={{ width: 24, marginLeft: 12 }} />
        <View style={{ width: 40 }} />
      </View>

      {cart?.items?.length > 0 ? (
        <View style={styles.flexContainer}>
          <FlatList
            data={cart.items}
            keyExtractor={(item) => item._id}
            renderItem={renderCartItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
          <View style={styles.footer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>Total Amount</Text>
              <Text style={styles.totalPrice}>₹{cart.totalAmount}</Text>
            </View>
            <TouchableOpacity style={styles.checkoutBtn}>
              <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>Add some books to get started!</Text>
          <TouchableOpacity style={styles.exploreBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.exploreBtnText}>Browse Books</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  flexContainer: {
    flex: 1,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#0f172a',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  coverImage: {
    width: 80,
    height: 110,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
  },
  detailsContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    flex: 1,
    marginRight: 8,
  },
  deleteBtn: {
    padding: 4,
  },
  deleteIcon: {
    fontSize: 16,
    color: '#94a3b8',
  },
  author: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
  },
  typeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#475569',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  qtyBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: {
    fontSize: 18,
    color: '#0f172a',
    fontWeight: '500',
  },
  qtyText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
    paddingHorizontal: 8,
  },
  footer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 16,
    color: '#64748b',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  checkoutBtn: {
    backgroundColor: '#0f172a',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyEmoji: {
    fontSize: 64,
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
    marginBottom: 24,
  },
  exploreBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  exploreBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  }
});

export default CartScreen;