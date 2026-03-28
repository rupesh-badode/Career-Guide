import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  Animated,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import RazorpayCheckout from 'react-native-razorpay'; 

// ⚠️ UPDATE THIS IMPORT PATH TO YOUR ACTUAL FILE
import { allMentor, BookMentor, verifyMentorbooking } from '../../../../src/services/user'; 

// 👉 NAYA IMPORT: Apna Modal Import Karo (Path apne folder structure ke hisaab se check kar lena)
import SlotSelectionModal from './SlotSelectionModal'; 
import { key_id } from '../../../../src/constants/MainContent';

const THEME_COLOR = '#4F46E5'; 

// --- Vertical Skeleton Loader ---
const SkeletonListCard = () => {
  const pulseAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.5, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardHeader}>
        <Animated.View style={[styles.skeletonAvatar, { opacity: pulseAnim }]} />
        <View style={styles.headerInfo}>
          <Animated.View style={[styles.skeletonText, { opacity: pulseAnim, width: '60%', height: 16 }]} />
          <Animated.View style={[styles.skeletonText, { opacity: pulseAnim, width: '40%', height: 12, marginTop: 8 }]} />
        </View>
      </View>
      <Animated.View style={[styles.skeletonText, { opacity: pulseAnim, width: '100%', height: 12, marginTop: 15 }]} />
      <Animated.View style={[styles.skeletonText, { opacity: pulseAnim, width: '80%', height: 12, marginTop: 6 }]} />
    </View>
  );
};

export default function AllMentorsScreen({ navigation }) {
  const [mentors, setMentors] = useState([]);
  const [filteredMentors, setFilteredMentors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // 👉 API Loader State
  const [bookingMentorId, setBookingMentorId] = useState(null);

  // 👉 NAYE STATES: Modal handle karne ke liye
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMentorForModal, setSelectedMentorForModal] = useState(null);

  // --- Fetch API Data ---
  useEffect(() => {
    const fetchAllMentors = async () => {
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

        setMentors(mentorsArray);
        setFilteredMentors(mentorsArray); 
      } catch (error) {
        console.error("All Mentors fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllMentors();
  }, []);

  // --- Search Logic ---
  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text) {
      const newData = mentors.filter((item) => {
        const itemData = item.name ? item.name.toUpperCase() : '';
        const subjectData = item.subject ? item.subject.toUpperCase() : '';
        const textData = text.toUpperCase();
        
        return itemData.indexOf(textData) > -1 || subjectData.indexOf(textData) > -1;
      });
      setFilteredMentors(newData);
    } else {
      setFilteredMentors(mentors);
    }
  };

  // --- 🚀 STEP 1: OPEN MODAL ---
  const handleOpenModal = (mentor) => {
    setSelectedMentorForModal(mentor);
    setIsModalVisible(true);
  };

  // --- 🚀 STEP 2: ACTUAL BOOKING FLOW (Triggered from Modal) ---
  const processBooking = async (mentor, date, time, customAmount) => {
    try {
      // 1. Modal band karo aur loader chalu karo
      setIsModalVisible(false);
      setBookingMentorId(mentor._id); 

      // 2. CREATE BOOKING ORDER (Using modal values)
      const orderPayload = {
        mentorId: mentor._id,
        date: date, // Modal se aayi hui date
        time: time, // Modal se aaya hua time
        amount: Number(customAmount) // Modal se aaya hua amount (Number me convert kiya)
      };
      
      const orderResponse = await BookMentor(orderPayload);
      
      if (!orderResponse.success) {
        throw new Error(orderResponse.message || "Failed to initiate booking.");
      }

      // 3. OPEN PAYMENT GATEWAY (Razorpay)
      const options = {
        description: `Session with ${mentor.name} on ${date} at ${time}`,
        image: 'https://your-app-logo.com/logo.png', 
        currency: 'INR',
        key:key_id, 
        amount: orderResponse.amount, 
        name: 'Career Guide',
        order_id: orderResponse.orderId, 
        prefill: {
          email: 'user@example.com', 
          contact: '9999999999',
          name: 'Student Name'
        },
        theme: { color: THEME_COLOR } 
      };

      RazorpayCheckout.open(options).then(async (data) => {
        // 4. VERIFY PAYMENT
        const verifyPayload = {
          mentorId: mentor._id,
          razorpay_payment_id: data.razorpay_payment_id,
          razorpay_order_id: data.razorpay_order_id,
          razorpay_signature: data.razorpay_signature
        };

        const verifyResponse = await verifyMentorbooking(verifyPayload);

        if (verifyResponse.success) {
          Alert.alert("Success!", `Your session with ${mentor.name} is confirmed for ${time}.`);
          // navigation.navigate('MyBookings'); 
        } else {
          Alert.alert("Verification Failed", "Payment captured but verification failed. Contact support.");
        }

      }).catch((error) => {
        console.log("Payment Error:", error);
        Alert.alert("Payment Cancelled", "You cancelled the payment process.");
      });

    } catch (error) {
      console.error("Booking Error:", error);
      Alert.alert("Error", error.message || "Something went wrong.");
    } finally {
      setBookingMentorId(null); // Loader stop karo
    }
  };

  // --- UI Components ---
  const renderMentorCard = ({ item }) => (
    <TouchableOpacity 
        activeOpacity={0.8} 
        style={styles.cardContainer}
        onPress={() => console.log("Go to Mentor Profile", item._id)}
    >
      <View style={styles.cardHeader}>
        <Image 
          source={{ uri: item.profilePicture || item.image || 'https://via.placeholder.com/150' }} 
          style={styles.avatar} 
        />
        <View style={styles.headerInfo}>
          <Text style={styles.mentorName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.mentorSubject} numberOfLines={1}>
            {item.subject || item.specialization || 'Career Expert'}
          </Text>
          
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={styles.ratingText}>{item.rating || '4.8'} <Text style={styles.reviewsText}>(120 reviews)</Text></Text>
          </View>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.mentorBio} numberOfLines={2}>
          {item.bio || "Passionate about helping students navigate their career paths and achieve their true potential through guided mentorship."}
        </Text>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.experienceBadge}>
            <Ionicons name="briefcase-outline" size={14} color={THEME_COLOR} />
            <Text style={styles.experienceText}>{item.experience || '5+'} Yrs Exp.</Text>
        </View>
        
        {/* 👉 BUTTON CHANGE: Ab direct API call nahi, Modal open hoga */}
        <TouchableOpacity 
          style={[styles.bookButton, bookingMentorId === item._id && { opacity: 0.7 }]} 
          activeOpacity={0.7}
          onPress={() => handleOpenModal(item)} // YAHAN CHANGE KIYA HAI
          disabled={bookingMentorId === item._id}
        >
          {bookingMentorId === item._id ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.bookButtonText}>Book Session</Text>
          )}
        </TouchableOpacity>

      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.mainContainer}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find Your Mentor</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or subject..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={handleSearch}
          clearButtonMode="while-editing"
        />
      </View>

      {loading ? (
        <View style={styles.listContent}>
           <SkeletonListCard />
           <SkeletonListCard />
           <SkeletonListCard />
           <SkeletonListCard />
        </View>
      ) : (
        <FlatList
          data={filteredMentors}
          keyExtractor={(item, index) => item._id || index.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={renderMentorCard}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
                <Ionicons name="search-outline" size={60} color="#D1D5DB" />
                <Text style={styles.emptyText}>No mentors found for "{searchQuery}"</Text>
            </View>
          }
        />
      )}

      {/* 👉 NAYA: Modal Component Inject Kiya */}
      <SlotSelectionModal 
        visible={isModalVisible}
        mentor={selectedMentorForModal}
        onClose={() => {
          setIsModalVisible(false);
          setSelectedMentorForModal(null);
        }}
        onConfirm={processBooking} 
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', marginHorizontal: 20, marginTop: 15, marginBottom: 5, borderRadius: 12, paddingHorizontal: 15, borderWidth: 1, borderColor: '#E5E7EB', height: 50 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, color: '#111827' },
  listContent: { padding: 20, paddingBottom: 40 },
  cardContainer: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#F3F4F6', ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8 }, android: { elevation: 2 }, web: { boxShadow: '0px 4px 15px rgba(0,0,0,0.04)' } }) },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#EEF2FF' },
  headerInfo: { marginLeft: 15, flex: 1 },
  mentorName: { fontSize: 17, fontWeight: 'bold', color: '#1F2937' },
  mentorSubject: { fontSize: 14, color: THEME_COLOR, fontWeight: '600', marginTop: 3 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  ratingText: { fontSize: 13, fontWeight: 'bold', color: '#4B5563', marginLeft: 4 },
  reviewsText: { fontWeight: 'normal', color: '#9CA3AF' },
  cardBody: { marginTop: 15, marginBottom: 15 },
  mentorBio: { fontSize: 14, color: '#4B5563', lineHeight: 22 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 15 },
  experienceBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  experienceText: { fontSize: 13, color: THEME_COLOR, fontWeight: '600', marginLeft: 5 },
  bookButton: { backgroundColor: THEME_COLOR, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, minWidth: 120, alignItems: 'center', justifyContent: 'center' },
  bookButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  skeletonAvatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#EEF2FF' },
  skeletonText: { backgroundColor: '#EEF2FF', borderRadius: 4 },
  emptyBox: { alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyText: { color: '#6B7280', fontSize: 16, marginTop: 15, fontWeight: '500' }
});