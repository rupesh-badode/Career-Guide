import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
  Image,
  Platform,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { myBooking } from '../../../../src/services/consultantAPI'; // Path check karlena

const THEME_COLOR = '#10B981';

// ==========================================
// DATE HELPER FUNCTIONS
// ==========================================
// Helper to get YYYY-MM-DD format for matching
const getYYYYMMDD = (dateObj) => {
  return dateObj.toISOString().split('T')[0];
};

// Generate next 30 days for the calendar strip
const generateCalendarDates = (daysCount = 30) => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < daysCount; i++) {
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + i);
    dates.push(nextDate);
  }
  return dates;
};

// ==========================================
// ANIMATED APPOINTMENT CARD
// ==========================================
const AppointmentCard = ({ item, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay: index * 100, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, delay: index * 100, useNativeDriver: true })
    ]).start();
  }, [index]);

  const student = item?.studentId || {};
  const isConfirmed = item.status === 'confirmed';

  return (
    <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.cardHeader}>
        <View style={styles.timeBadge}>
          <Ionicons name="time" size={14} color="#FFF" />
          <Text style={styles.timeBadgeText}>{item.time || 'TBA'}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: isConfirmed ? '#ECFDF5' : '#FEF3C7' }]}>
          <Text style={[styles.statusText, { color: isConfirmed ? THEME_COLOR : '#D97706' }]}>
            {item.status ? item.status.toUpperCase() : 'PENDING'}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Image 
          source={{ uri: student.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}` }} 
          style={styles.avatar} 
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>{student.name || 'Unknown User'}</Text>
          <Text style={styles.userScore}>NEET Score: {student.neetScore || 'N/A'}</Text>
        </View>
        
        <TouchableOpacity style={styles.actionBtn}>
           <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

// ==========================================
// MAIN SCREEN
// ==========================================
export default function ScheduleCalendar() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getYYYYMMDD(new Date()));
  const [calendarDates, setCalendarDates] = useState([]);

  // FlatList reference to scroll to today
  const calendarRef = useRef(null);

  useEffect(() => {
    setCalendarDates(generateCalendarDates(30)); // 30 din ka calendar generate karega
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await myBooking();
      if (res.success) {
        const apiData = res.data?.data || res.data || [];

        // 🔥 THE MAGIC FIX: Sirf unko rakho jinka status 'confirmed' hai
        const onlyConfirmedBookings = apiData.filter(
          (booking) => booking.status === 'confirmed'
        );

        // Ab state mein sirf confirmed data jayega
        setBookings(onlyConfirmedBookings); 
      }
    } catch (err) {
      console.log("API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🧠 Data Grouping: API data ko dates ke hisab se group karna
  const groupedBookings = useMemo(() => {
    const groups = {};
    bookings.forEach(booking => {
      if (!booking.date) return;
      const dateKey = getYYYYMMDD(new Date(booking.date)); // Group by YYYY-MM-DD
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(booking);
    });
    return groups;
  }, [bookings]);

  // Jo date select ki hai, uske appointments
  const selectedDayBookings = groupedBookings[selectedDate] || [];

  // ==========================================
  // RENDER: HORIZONTAL CALENDAR STRIP
  // ==========================================
  const renderCalendarDay = ({ item }) => {
    const dateStr = getYYYYMMDD(item);
    const isSelected = dateStr === selectedDate;
    const hasBooking = groupedBookings[dateStr] && groupedBookings[dateStr].length > 0;

    const dayName = item.toLocaleDateString('en-GB', { weekday: 'short' }); // Mon, Tue
    const dayNumber = item.getDate(); // 25, 26

    return (
      <TouchableOpacity 
        style={[styles.dateCard, isSelected && styles.dateCardActive]}
        onPress={() => setSelectedDate(dateStr)}
        activeOpacity={0.7}
      >
        <Text style={[styles.dateName, isSelected && styles.dateNameActive]}>{dayName}</Text>
        <Text style={[styles.dateNumber, isSelected && styles.dateNumberActive]}>{dayNumber}</Text>
        
        {/* Chota sa dot agar us din koi booking hai */}
        <View style={[styles.bookingDot, { backgroundColor: hasBooking ? (isSelected ? '#FFF' : THEME_COLOR) : 'transparent' }]} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Schedule</Text>
        <Text style={styles.headerSubtitle}>
          {new Date(selectedDate).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
        </Text>
      </View>

      {/* HORIZONTAL CALENDAR */}
      <View style={styles.calendarContainer}>
        <FlatList
          ref={calendarRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          data={calendarDates}
          keyExtractor={(item) => item.toISOString()}
          renderItem={renderCalendarDay}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      </View>

      {/* APPOINTMENT LIST */}
      <View style={styles.listContainer}>
        {loading ? (
          <ActivityIndicator size="large" color={THEME_COLOR} style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={selectedDayBookings}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            renderItem={({ item, index }) => <AppointmentCard item={item} index={index} />}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Image 
                  source={{ uri: 'https://cdn-icons-png.flaticon.com/512/7486/7486744.png' }} 
                  style={{ width: 100, height: 100, opacity: 0.5, marginBottom: 15 }} 
                />
                <Text style={styles.emptyText}>No appointments today!</Text>
                <Text style={styles.emptySubText}>Take a break or check other dates.</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

// ==========================================
// STYLES
// ==========================================
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { paddingHorizontal: 20, paddingTop: 15, paddingBottom: 10 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#111827' },
  headerSubtitle: { fontSize: 16, color: '#6B7280', fontWeight: '500', marginTop: 4 },
  
  calendarContainer: { 
    height: 90, 
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 10
  },
  dateCard: {
    width: 60,
    height: 75,
    backgroundColor: '#FFF',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateCardActive: {
    backgroundColor: THEME_COLOR,
    borderColor: THEME_COLOR,
    shadowColor: THEME_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  dateName: { fontSize: 12, color: '#6B7280', fontWeight: '600', marginBottom: 4 },
  dateNameActive: { color: '#D1FAE5' },
  dateNumber: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  dateNumberActive: { color: '#FFF' },
  bookingDot: { width: 6, height: 6, borderRadius: 3, marginTop: 4 },

  listContainer: { flex: 1, paddingHorizontal: 16 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
      android: { elevation: 2 }
    })
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  timeBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME_COLOR, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  timeBadgeText: { color: '#FFF', fontWeight: '700', fontSize: 12, marginLeft: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },
  
  cardBody: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#F3F4F6' },
  userInfo: { flex: 1, marginLeft: 12 },
  userName: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 2 },
  userScore: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  actionBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center' },
  
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#374151', marginTop: 10 },
  emptySubText: { fontSize: 14, color: '#9CA3AF', marginTop: 5 },
});