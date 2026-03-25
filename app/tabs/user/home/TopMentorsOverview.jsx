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

// 👉 Make sure to import the SlotSelectionModal we created!
// Adjust the path if you saved it in a different folder.

// ⚠️ UPDATE THIS IMPORT PATH TO YOUR ACTUAL FILE
import { allMentor, BookMentor, verifyMentorbooking } from '../../../../src/services/user';
import SlotSelectionModal from '../mentor/SlotSelectionModal';

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
    setSlotModalVisible(false); // Modal band kardo
    setBookingMentorId(mentor._id); // Button pe loader dikhao
    
    try {
      // 👉 1. Amount ko strictly ek solid Integer number banayein (Decimals and spaces remove karne ke liye)
      const finalAmount = parseInt(enteredAmount, 10);

      // 👉 2. Check lagayein ki amount valid hai ya nahi
      if (isNaN(finalAmount) || finalAmount <= 0) {
        Alert.alert("Invalid Amount", "Please enter a valid amount greater than 0.");
        setBookingMentorId(null);
        return;
      }

      const orderPayload = {
        mentorId: mentor._id,
        date: selectedDate, 
        time: selectedTime, 
        amount: finalAmount // 👉 Ab yeh strictly ek number (e.g., 500) jayega
      };
      
      // 👉 DEBUG: Terminal me check karne ke liye ki payload kya bana
      console.log("🚀 PAYLOAD GOING TO BACKEND:", orderPayload);

      const orderResponse = await BookMentor(orderPayload);
      
      if (!orderResponse.success) {
        throw new Error(orderResponse.message || "Failed to initiate booking.");
      }

      const options = {
        description: `Mentorship Session with ${mentor.name} on ${selectedDate} at ${selectedTime}`,
        image: 'https://your-app-logo.com/logo.png', 
        currency: 'INR',
        key: orderResponse.razorpayKey || 'YOUR_RAZORPAY_KEY', 
        amount: orderResponse.amount, 
        name: 'Career Guide',
        order_id: orderResponse.orderId, 
        prefill: {
          email: 'user@example.com', 
          contact: '9999999999',
          name: 'Student Name'
        },
        theme: { color: MENTOR_PRIMARY } 
      };

      RazorpayCheckout.open(options).then(async (data) => {
        const verifyPayload = {
          mentorId: mentor._id,
          razorpay_payment_id: data.razorpay_payment_id,
          razorpay_order_id: data.razorpay_order_id,
          razorpay_signature: data.razorpay_signature,
          date: selectedDate,
          time: selectedTime
        };

        const verifyResponse = await verifyMentorbooking(verifyPayload);

        if (verifyResponse.success) {
          Alert.alert("Booking Confirmed!", `Your session with ${mentor.name} is booked for ${selectedDate} at ${selectedTime}.`);
        } else {
          Alert.alert("Verification Failed", "Payment captured but verification failed. Contact support.");
        }

      }).catch((error) => {
        console.log("Payment Error:", error);
        Alert.alert("Payment Cancelled", "You cancelled the payment process.");
      });

    } catch (error) {
      // 👉 NAYA DEBUGGING LOG: Yeh error ke andar ka saara raaz khol dega
      console.log("🔥 REAL BOOKING ERROR:", error?.response?.data?.data || error?.message || JSON.stringify(error));
      
      const errorMsg = error?.response?.data?.message || error?.message || "Something went wrong.";
      Alert.alert("Booking Failed", errorMsg);
    } finally {
      setBookingMentorId(null); 
    }
  };


  const renderMentorCard = ({ item }) => (
    // Outer container changed to View to avoid nested touchables
    <View style={styles.cardContainer}>

      {/* Mentor Profile Header - Clickable to go to profile */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => console.log("Navigate to Mentor Profile", item._id)}
        style={styles.cardHeader}
      >
        <Image
          source={{ uri: item.profilePicture || item.image || 'https://via.placeholder.com/150' }}
          style={styles.avatar}
        />
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
        <View style={styles.ratingBox}>
          <Ionicons name="star" size={14} color="#F59E0B" />
          <Text style={styles.ratingText}>{item.rating || '4.9'}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          // 👉 Changed from handleBook(item) to handleOpenSlotModal(item)
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
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Top Mentors</Text>
        <TouchableOpacity onPress={() => navigation.navigate("AllMentor")}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal List */}
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

      {/* 👉 Render the Slot Selection Modal */}
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
  sectionContainer: { marginTop: 25, marginBottom: 15 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  viewAllText: { fontSize: 14, color: MENTOR_PRIMARY, fontWeight: '600' },
  listContent: { paddingLeft: 20, paddingRight: 5 },
  cardContainer: {
    width: CARD_WIDTH, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginRight: 15,
    borderWidth: 1, borderColor: '#F3F4F6',
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
  emptyText: { color: '#9CA3AF', fontStyle: 'italic' }
});