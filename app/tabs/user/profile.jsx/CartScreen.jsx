import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Modal,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';

// Import services
import {
  defaultAddress,
  DeleteCart,
  getAddress,
  getCart,
  UpdateCart,
} from '../../../../src/services/user';

const CartScreen = ({ navigation }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isFocused = useIsFocused();

  // Modal & Address States
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Animation for Skeleton Pulse
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (isFocused) {
      fetchCart();
    }
  }, [isFocused]);

  // --- SKELETON COMPONENTS ---
  const CartItemSkeleton = () => (
    <Animated.View style={[styles.card, { opacity }]}>
      <View style={[styles.coverImage, { backgroundColor: '#e2e8f0' }]} />
      <View style={styles.detailsContainer}>
        <View style={{ height: 16, width: '80%', backgroundColor: '#e2e8f0', borderRadius: 4, marginBottom: 8 }} />
        <View style={{ height: 12, width: '40%', backgroundColor: '#e2e8f0', borderRadius: 4, marginBottom: 12 }} />
        <View style={{ height: 20, width: '30%', backgroundColor: '#e2e8f0', borderRadius: 4, marginBottom: 12 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ height: 24, width: '25%', backgroundColor: '#e2e8f0', borderRadius: 4 }} />
          <View style={{ height: 30, width: '30%', backgroundColor: '#e2e8f0', borderRadius: 8 }} />
        </View>
      </View>
    </Animated.View>
  );

  const AddressItemSkeleton = () => (
    <Animated.View style={[styles.addressCard, { opacity, borderStyle: 'solid' }]}>
      <View style={{ flex: 1 }}>
        <View style={{ height: 14, width: '30%', backgroundColor: '#e2e8f0', borderRadius: 4, marginBottom: 8 }} />
        <View style={{ height: 12, width: '90%', backgroundColor: '#e2e8f0', borderRadius: 4, marginBottom: 4 }} />
        <View style={{ height: 12, width: '60%', backgroundColor: '#e2e8f0', borderRadius: 4 }} />
      </View>
    </Animated.View>
  );

  // --- Logical Functions (Cart & Address) ---
  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await getCart();
      if (res?.data) {
        updateCartState(res.data.items, res.data.totalAmount);
      }
    } catch (err) {
      setError("Failed to load cart.");
    } finally {
      setLoading(false);
    }
  };

  const updateCartState = (items, serverTotal = 0) => {
    const calculatedTotal = items?.reduce((sum, item) => {
      const price = item.bookId?.discountPrice || item.bookId?.price || 0;
      return sum + (price * item.quantity);
    }, 0) || 0;
    setCart({ items, totalAmount: serverTotal > 0 ? serverTotal : calculatedTotal });
  };

  const updateQuantity = async (item, change) => {
    const newQuantity = item.quantity + change;
    if (newQuantity < 1) return;
    try {
      setActionLoadingId(item._id);
      await UpdateCart({ bookId: item.bookId?._id, quantity: newQuantity, type: item.type });
      updateCartState(cart.items.map(i => i._id === item._id ? { ...i, quantity: newQuantity } : i));
    } catch (err) {
      Alert.alert("Error", "Update failed.");
    } finally { setActionLoadingId(null); }
  };

  const removeItem = (item) => {
    Alert.alert("Remove Item", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove", style: "destructive", onPress: async () => {
          try {
            setActionLoadingId(item._id);
            await DeleteCart(item.bookId?._id, item.type);
            updateCartState(cart.items.filter(i => i._id !== item._id));
          } catch (err) { Alert.alert("Error", "Failed to remove"); }
          finally { setActionLoadingId(null); }
        }
      }
    ]);
  };

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const res = await getAddress();
      const addrData = res?.data || [];
      setAddresses(addrData);
      const def = addrData.find(a => a.isDefault);
      if (def) setSelectedAddressId(def._id);
    } catch (err) { console.error(err); }
    finally { setLoadingAddresses(false); }
  };

  // --- Main Render ---
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="chevron-back" size={24} /></TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        // SHOW CART SKELETONS
        <View style={styles.flexContainer}>
          <View style={{ padding: 16 }}>
            {[1, 2, 3].map((key) => <CartItemSkeleton key={key} />)}
          </View>
        </View>
      ) : cart?.items?.length > 0 ? (
        <View style={styles.flexContainer}>
          <FlatList
            data={cart.items}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => {
              const activePrice = item.bookId?.discountPrice || item.bookId?.price;
              const isItemLoading = actionLoadingId === item._id;
              return (
                <View style={styles.card}>
                  <Image source={{ uri: item.bookId?.coverImage }} style={styles.coverImage} />
                  <View style={styles.detailsContainer}>
                    <View style={styles.titleRow}>
                      <Text style={styles.title} numberOfLines={2}>{item.bookId?.title}</Text>
                      <TouchableOpacity onPress={() => removeItem(item)} disabled={isItemLoading}>
                        <Ionicons name='trash-outline' size={20} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.author}>By {item.bookId?.author}</Text>
                    <View style={styles.typeBadge}><Text style={styles.typeText}>{item.type.toUpperCase()}</Text></View>
                    <View style={styles.bottomRow}>
                      <Text style={styles.price}>₹{activePrice}</Text>
                      <View style={styles.quantityContainer}>
                        <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item, -1)}>
                          <Text style={styles.qtyBtnText}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{item.quantity}</Text>
                        <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item, 1)}>
                          <Text style={styles.qtyBtnText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              );
            }}
            contentContainerStyle={styles.listContainer}
          />
          <View style={styles.footer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>Total Amount</Text>
              <Text style={styles.totalPrice}>₹{cart.totalAmount}</Text>
            </View>
            <TouchableOpacity style={styles.checkoutBtn} onPress={() => { setShowAddressModal(true); fetchAddresses(); }}>
              <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <TouchableOpacity style={styles.exploreBtn} onPress={() => navigation.navigate('AllBooks')}><Text style={styles.exploreBtnText}>Browse Books</Text></TouchableOpacity>
        </View>
      )}

      {/* MODAL: SELECT ADDRESS */}
      <Modal visible={showAddressModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Select Address</Text>
              <TouchableOpacity onPress={() => setShowAddressModal(false)}><Ionicons name="close" size={24} /></TouchableOpacity>
            </View>
            
            {loadingAddresses ? (
              // SHOW ADDRESS SKELETONS
              <View>{[1, 2].map((k) => <AddressItemSkeleton key={k} />)}</View>
            ) : (
              <FlatList
                data={addresses}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => {
                  const isSelected = selectedAddressId === item._id;
                  return (
                    <TouchableOpacity
                      onPress={() => setSelectedAddressId(item._id)}
                      style={[styles.addressCard, isSelected && styles.selectedAddressCard, item.isDefault && styles.defaultAddressBg]}
                    >
                      <View style={{ flex: 1 }}>
                        <View style={styles.addressHeaderRow}>
                          <Text style={styles.addressType}>{item.type || 'Home'}</Text>
                          {item.isDefault && <View style={styles.defaultBadge}><Text style={styles.defaultBadgeText}>Default</Text></View>}
                        </View>
                        <Text style={styles.addressText}>{item.addressLine}, {item.city}, {item.state} - {item.pincode}</Text>
                      </View>
                      {isSelected && <Ionicons name="checkmark-circle" size={24} color="#2563eb" />}
                    </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={<Text style={styles.emptyListText}>No addresses found.</Text>}
              />
            )}

            <TouchableOpacity
              style={styles.addAddressBtn}
              onPress={() => { setShowAddressModal(false); navigation.navigate("AddAddress"); }}
            >
              <Ionicons name="add-circle-outline" size={20} color="#2563eb" />
              <Text style={styles.addAddressText}>Add New Address</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.checkoutBtn} onPress={() => { setShowAddressModal(false); Alert.alert("Success", "Redirecting..."); }}>
              <Text style={styles.checkoutBtnText}>Continue to Payment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// ... Styles (rest same as your provided code)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', paddingTop: Platform.OS === 'android' ? 35 : 0 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  flexContainer: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  listContainer: { padding: 16 },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 16, elevation: 2 },
  coverImage: { width: 85, height: 120, borderRadius: 8 },
  detailsContainer: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between' },
  title: { fontSize: 15, fontWeight: 'bold' },
  author: { fontSize: 13, color: '#64748b' },
  typeBadge: { alignSelf: 'flex-start', backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  typeText: { fontSize: 10, fontWeight: 'bold' },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 18, fontWeight: 'bold', color: '#2563eb' },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  qtyBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  qtyBtnText: { fontSize: 18 },
  qtyText: { fontSize: 14, fontWeight: 'bold', paddingHorizontal: 10 },
  footer: { backgroundColor: '#fff', padding: 20, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  summaryText: { fontSize: 16, color: '#64748b' },
  totalPrice: { fontSize: 22, fontWeight: 'bold' },
  checkoutBtn: { backgroundColor: '#0f172a', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  checkoutBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '85%' },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 18, fontWeight: 'bold' },
  addressCard: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row' },
  selectedAddressCard: { borderColor: '#2563eb', backgroundColor: '#eff6ff', borderWidth: 2 },
  defaultAddressBg: { backgroundColor: '#f0fdf4' },
  addressHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  addressType: { fontSize: 14, fontWeight: 'bold', marginRight: 8 },
  addressText: { fontSize: 13, color: '#64748b' },
  defaultBadge: { backgroundColor: '#dcfce7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  defaultBadgeText: { color: '#16a34a', fontSize: 10, fontWeight: 'bold' },
  addAddressBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, marginBottom: 16, borderStyle: 'dashed', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 12 },
  addAddressText: { color: '#2563eb', fontWeight: 'bold', marginLeft: 8 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyEmoji: { fontSize: 64, marginBottom: 10 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold' },
  exploreBtn: { backgroundColor: '#2563eb', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginTop: 10 },
  exploreBtnText: { color: '#fff', fontWeight: 'bold' },
  emptyListText: { textAlign: 'center', marginTop: 20, color: '#94a3b8' },
});

export default CartScreen;