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
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import RazorpayCheckout from 'react-native-razorpay';

// ⚠️ UPDATE THIS IMPORT PATH TO YOUR ACTUAL FILE
import { allMentor, BookMentor, verifyMentorbooking } from '../../../../src/services/user';
import SlotSelectionModal from '../mentor/SlotSelectionModal';
import { key_id } from '../../../../src/constants/MainContent';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;
const MENTOR_PRIMARY = '#4F46E5';

// --- Premium Skeleton Loader ---
const MentorSkeletonCard = () => {
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
      <View style={styles.cardHeader}>
        <Animated.View style={[styles.skeletonAvatar, { opacity: pulseAnim }]} />
        <View style={styles.headerTextSpace}>
          <Animated.View style={[styles.skeletonText, { opacity: pulseAnim, width: '80%', height: 16 }]} />
          <Animated.View style={[styles.skeletonText, { opacity: pulseAnim, width: '50%', height: 12, marginTop: 6 }]} />
        </View>
      </View>
      <View style={styles.cardBody}>
        <Animated.View style={[styles.skeletonText, { opacity: pulseAnim, width: '100%', marginTop: 8 }]} />
        <Animated.View style={[styles.skeletonText, { opacity: pulseAnim, width: '100%', marginTop: 6 }]} />
        <Animated.View style={[styles.skeletonText, { opacity: pulseAnim, width: '70%', marginTop: 6 }]} />
      </View>
    </View>
  );
};

export default function TopMentorsOverview() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const [bookingMentorId, setBookingMentorId] = useState(null);

  // 👉 Naye states for Slot Modal
  const [isSlotModalVisible, setSlotModalVisible] = useState(false);
  const [selectedMentorForBooking, setSelectedMentorForBooking] = useState(null);

  useEffect(() => {
    const fetchTopMentors = async () => {
      try {
        setLoading(true);
        const res = await allMentor();

        let mentorsArray = [];
        if (Array.isArray(res)) {
          mentorsArray = res;
        } else if (res && res.data && Array.isArray(res.data)) {
          mentorsArray = res.data;
        } else if (res && res.mentors && Array.isArray(res.mentors)) {
          mentorsArray = res.mentors;
        }

        setMentors(mentorsArray.slice(0, 3));
      } catch (error) {
        console.error("Top Mentors fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopMentors();
  }, []);

  // 👉 Opens the Slot Selection Modal
  const handleOpenSlotModal = (mentor) => {
    setSelectedMentorForBooking(mentor);
    setSlotModalVisible(true);
  };

  // 👉 Triggered when user clicks "Proceed to Pay" inside the Modal
  const handleProcessPayment = async (mentor, selectedDate, selectedTime, enteredAmount) => {
    setSlotModalVisible(false); 
    setBookingMentorId(mentor._id); // Loader ON karein

    try {
      // 1. Validate Amount
      const finalAmount = parseInt(enteredAmount, 10);
      if (isNaN(finalAmount) || finalAmount <= 0) {
        Alert.alert("Invalid Amount", "Please enter a valid amount greater than 0.");
        setBookingMentorId(null);
        return;
      }

      const orderPayload = {
        mentorId: mentor._id,
        date: selectedDate,
        time: selectedTime,
        amount: finalAmount
      };

      console.log("🚀 PAYLOAD GOING TO BACKEND:", orderPayload);

      // 2. Create Order in Backend
      const orderResponse = await BookMentor(orderPayload);
      if (!orderResponse?.success) {
        throw new Error(orderResponse?.message || "Failed to initiate booking.");
      }

      const options = {
        description: `Mentorship Session with ${mentor.name} on ${selectedDate} at ${selectedTime}`,
        image: 'https://ui-avatars.com/api/?name=Aastroneet&background=4F46E5&color=fff', // App logo fallback
        currency: 'INR',
        key: key_id,
        amount: orderResponse.amount,
        name: 'Aastroneet',
        order_id: orderResponse.orderId,
        prefill: {
          email: 'student@example.com', // Optional: Replace with logged-in user's email if available
          contact: '9999999999',        // Optional: Replace with logged-in user's phone if available
          name: 'Student Name'          // Optional: Replace with logged-in user's name
        },
        theme: { color: MENTOR_PRIMARY }
      };

      // 3. Open Razorpay Checkout
      const data = await RazorpayCheckout.open(options);

      // 4. Payment Success - Verify from Backend (Including Signature & Order ID)
      const verifyPayload = {
        mentorId: mentor._id,
        razorpay_payment_id: data.razorpay_payment_id,
        razorpay_order_id: data.razorpay_order_id,
        razorpay_signature: data.razorpay_signature,
        date: selectedDate,
        time: selectedTime
      };

      const verifyResponse = await verifyMentorbooking(verifyPayload);

      if (verifyResponse?.success) {
        Alert.alert(
          "Booking Confirmed! 🎉", 
          `Your session with ${mentor.name} is booked for ${selectedDate} at ${selectedTime}.`
        );
        // Optional: navigation.navigate("MyBookings"); // Redirect user to bookings screen
      } else {
        Alert.alert("Verification Failed", "Payment captured but verification failed. Please contact support.");
      }

    } catch (error) {
      console.log("🔥 REAL BOOKING ERROR:", error);

      // Robust Razorpay Cancellation/Error check
      if (error.code === 0 || error.description === 'Payment cancelled by user' || error.reason === 'payment_cancelled') {
        Alert.alert("Payment Cancelled", "You closed the payment gateway.");
      } else {
        const errorMsg = error?.response?.data?.message || error?.message || "Something went wrong during payment.";
        Alert.alert("Booking Failed", errorMsg);
      }

    } finally {
      // Loader OFF
      setBookingMentorId(null);
    }
  };

  const renderMentorCard = ({ item }) => (
    <View style={styles.cardContainer}>
      {/* Mentor Profile Header */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => console.log("Navigate to Mentor Profile", item._id)}
        style={styles.cardHeader}
      >
        {item.profilePicture || item.image ? (
          <Image
            source={{ uri: item.profilePicture || item.image }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.nameAvatar}>
            <Text style={styles.nameAvatarText}>
              {item.name?.charAt(0)?.toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.headerInfo}>
          <Text style={styles.mentorName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.mentorSubject} numberOfLines={1}>
            {item.subject || item.specialization || 'Career Expert'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Mentor Bio */}
      <View style={styles.cardBody}>
        <Text style={styles.mentorBio} numberOfLines={3}>
          {item.bio || "This mentor hasn't added a bio yet, but they are highly rated and ready to help you achieve your goals!"}
        </Text>
      </View>

      {/* Bottom Action Row */}
      <View style={styles.cardFooter}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View style={styles.ratingBox}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={styles.ratingText}>{item.averageRating || 0}</Text>
          </View>
          <Text style={{ fontSize: 12, color: "#6B7280" }}>({item.totalRatings || 0})</Text>
          <View style={{ backgroundColor: "#EEF2FF", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
            <Text style={{ fontSize: 11, color: "#4F46E5", fontWeight: "600" }}>{item.experience || 0} yrs</Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => handleOpenSlotModal(item)}
          disabled={bookingMentorId === item._id}
          style={styles.bookBtnWrapper}
        >
          {bookingMentorId === item._id ? (
            <ActivityIndicator size="small" color={MENTOR_PRIMARY} />
          ) : (
            <Text style={styles.bookText}>
              Book Session <Ionicons name="arrow-forward" size={12} />
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Top Mentors</Text>
        <TouchableOpacity onPress={() => navigation.navigate("AllMentor")}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.skeletonWrapper}>
          <MentorSkeletonCard />
          <MentorSkeletonCard />
        </View>
      ) : mentors.length > 0 ? (
        <FlatList
          data={mentors}
          keyExtractor={(item, index) => item._id || index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          snapToInterval={CARD_WIDTH + 15}
          decelerationRate="fast"
          renderItem={renderMentorCard}
        />
      ) : (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No mentors available right now.</Text>
        </View>
      )}

      {/* 👉 Modal stays here */}
      <SlotSelectionModal
        visible={isSlotModalVisible}
        mentor={selectedMentorForBooking}
        onClose={() => setSlotModalVisible(false)}
        onConfirm={handleProcessPayment}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: { marginTop: 25, marginBottom: 5 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
  viewAllText: { fontSize: 14, color: MENTOR_PRIMARY, fontWeight: '600' },
  listContent: { paddingLeft: 20, paddingRight: 5 },
  cardContainer: {
    width: CARD_WIDTH, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginRight: 15,
    borderWidth: 1, borderColor: '#F3F4F6', marginBottom: 2,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8 },
      android: { elevation: 3 },
      web: { boxShadow: '0px 4px 15px rgba(0,0,0,0.05)' }
    }),
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#F3E8FF' },
  headerInfo: { marginLeft: 12, flex: 1 },
  mentorName: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  mentorSubject: { fontSize: 13, color: MENTOR_PRIMARY, fontWeight: '500', marginTop: 2 },
  cardBody: { marginBottom: 15 },
  mentorBio: { fontSize: 13, color: '#6B7280', lineHeight: 20 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12 },
  ratingBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFBEB', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  ratingText: { fontSize: 12, fontWeight: 'bold', color: '#B45309', marginLeft: 4 },
  bookBtnWrapper: { paddingVertical: 5, paddingHorizontal: 5 },
  bookText: { fontSize: 13, color: MENTOR_PRIMARY, fontWeight: '600' },
  skeletonWrapper: { flexDirection: 'row', paddingLeft: 20 },
  skeletonAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#EDE9FE' },
  headerTextSpace: { marginLeft: 12, flex: 1, justifyContent: 'center' },
  skeletonText: { height: 12, backgroundColor: '#F3E8FF', borderRadius: 4 },
  emptyBox: { padding: 20, alignItems: 'center' },
  nameAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#4F46E5", justifyContent: "center", alignItems: "center" },
  nameAvatarText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  emptyText: { color: '#9CA3AF', fontStyle: 'italic' }
});