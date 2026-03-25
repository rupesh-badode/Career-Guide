import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, Alert, 
  ActivityIndicator, ScrollView, Platform, Dimensions 
} from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { createBooking, verifyBookingPayment } from '../../../../src/services/booking';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function BookingScreen({ route, navigation }) {
  const { consultantId = "1", consultantName = "Expert Consultant", amount = 499 } = route.params || {};

  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  // Dates Generate Karein (Next 7 Days)
  const dates = useMemo(() => {
    return [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      
      // Local date format nikalne ke liye
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      
      return {
        id: i,
        full: `${year}-${month}-${day}`, // YYYY-MM-DD
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: d.getDate(),
      };
    });
  }, []);

  // By default aaj ki date select kar do
  useEffect(() => {
    if (dates.length > 0 && !selectedDate) {
      setSelectedDate(dates[0].full);
    }
  }, [dates]);

  // All Time Slots
  const allTimeSlots = ["09:00 AM", "11:00 AM", "01:00 PM", "03:00 PM", "05:00 PM", "07:00 PM"];

  // 👉 NEW LOGIC: Dynamic Slots Calculation
  const availableSlots = useMemo(() => {
    if (!selectedDate) return allTimeSlots;

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    // Agar future ki date hai toh saare slots dikhao
    if (selectedDate !== todayStr) {
      return allTimeSlots;
    }

    // Agar aaj ki date hai toh purane time wale slots hata do
    return allTimeSlots.filter(slot => {
      const [time, modifier] = slot.split(' ');
      let [hours, minutes] = time.split(':');
      hours = parseInt(hours, 10);
      
      if (modifier === 'PM' && hours !== 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;

      const slotTime = new Date();
      slotTime.setHours(hours, parseInt(minutes, 10), 0, 0);

      // Current time se bada (future) ka slot hona chahiye
      // (Aap chaho toh yaha buffer bhi laga sakte ho: slotTime > new Date(today.getTime() + 30 * 60000) for 30 min advance)
      return slotTime > today;
    });
  }, [selectedDate]);

  // Agar user date change karta hai aur selected slot ab available nahi hai, toh selection hata do
  useEffect(() => {
    if (selectedTime && !availableSlots.includes(selectedTime)) {
      setSelectedTime(null);
    }
  }, [selectedDate, availableSlots]);

  const handlePayment = async () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert("Selection Missing", "Please select both a date and a time slot.");
      return;
    }

    if (Platform.OS === 'web') {
      Alert.alert("Web Notice", "Razorpay integration works on Mobile Devices (Android/iOS).");
      return;
    }

    setIsLoading(true);
    try {
      const orderResponse = await createBooking({
        consultantId,
        date: selectedDate,
        time: selectedTime,
        amount
      });

      if (!orderResponse.success) {
        Alert.alert("Error", "Failed to create order. Try again.");
        setIsLoading(false);
        return;
      }

      const options = {
        description: `Consultation with ${consultantName}`,
        image: 'https://cdn-icons-png.flaticon.com/512/2922/2922503.png',
        currency: 'INR',
        key: 'rzp_test_Your_Key_Here',
        amount: orderResponse.order.amount,
        name: 'Career Guide App',
        order_id: orderResponse.order.id,
        theme: { color: '#4F46E5' },
        prefill: { email: 'user@example.com', contact: '9999999999', name: 'John Doe' }
      };

      RazorpayCheckout.open(options).then(async (data) => {
        const verification = await verifyBookingPayment({ ...data, bookingId: orderResponse.bookingId });
        if (verification.success) {
          navigation.navigate("BookingSuccess");
        }
      }).catch(err => {
        console.log("Payment Error:", err);
        Alert.alert("Payment Cancelled");
      });

    } catch (error) {
      Alert.alert("Error", error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Booking</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.summaryCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{consultantName.charAt(0)}</Text>
          </View>
          <View>
            <Text style={styles.cName}>{consultantName}</Text>
            <Text style={styles.cType}>Career & Growth Mentor</Text>
          </View>
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Select Date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {dates.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                onPress={() => setSelectedDate(item.full)}
                style={[styles.dateBox, selectedDate === item.full && styles.activeBox]}
              >
                <Text style={[styles.dateDay, selectedDate === item.full && styles.activeText]}>{item.day}</Text>
                <Text style={[styles.dateNum, selectedDate === item.full && styles.activeText]}>{item.date}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Time Selection Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Available Slots</Text>
          {availableSlots.length > 0 ? (
            <View style={styles.grid}>
              {availableSlots.map((slot, index) => (
                <TouchableOpacity 
                  key={index} 
                  onPress={() => setSelectedTime(slot)}
                  style={[styles.slot, selectedTime === slot && styles.activeSlot]}
                >
                  <Text style={[styles.slotText, selectedTime === slot && styles.activeText]}>{slot}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.noSlotsContainer}>
               <Text style={styles.noSlotsText}>No slots available for today.</Text>
            </View>
          )}
        </View>

        {/* Pricing Table */}
        <View style={styles.tableCard}>
          <Text style={styles.tableTitle}>Payment Summary</Text>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Consultation Fee</Text>
            <Text style={styles.tableValue}>₹{amount}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Service Tax (GST)</Text>
            <Text style={styles.tableValue}>₹0</Text>
          </View>
          <View style={[styles.tableRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalValue}>₹{amount}</Text>
          </View>
        </View>

      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerSub}>Amount to Pay</Text>
          <Text style={styles.footerPrice}>₹{amount}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.mainPayBtn, (isLoading || !selectedTime) && styles.disabledBtn]} 
          onPress={handlePayment}
          disabled={isLoading || !selectedTime}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.mainPayBtnText}>Book Now</Text>
              <MaterialIcons name="security" size={18} color="#fff" style={{marginLeft: 8}} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  backBtn: { padding: 8 },
  scrollContent: { padding: 20, paddingBottom: 120 },
  summaryCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 25, borderWidth: 1, borderColor: '#E2E8F0' },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#4F46E5', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  cName: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  cType: { fontSize: 13, color: '#64748B' },
  section: { marginBottom: 25 },
  sectionLabel: { fontSize: 16, fontWeight: '700', color: '#334155', marginBottom: 12 },
  horizontalScroll: { flexDirection: 'row' },
  dateBox: { width: 65, height: 80, backgroundColor: '#fff', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  activeBox: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  dateDay: { fontSize: 12, color: '#64748B' },
  dateNum: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginTop: 4 },
  activeText: { color: '#fff' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  slot: { width: '31%', backgroundColor: '#fff', paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  activeSlot: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  slotText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  noSlotsContainer: { padding: 20, backgroundColor: '#FEF2F2', borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#FECACA' },
  noSlotsText: { color: '#DC2626', fontWeight: '600' },
  tableCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  tableTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 15 },
  tableRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  tableLabel: { color: '#64748B', fontSize: 14 },
  tableValue: { color: '#1E293B', fontWeight: '600' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12, marginTop: 5 },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: '#4F46E5' },
  footer: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#fff', padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 25, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#E2E8F0', elevation: 20 },
  footerPrice: { fontSize: 22, fontWeight: 'bold', color: '#1E293B' },
  footerSub: { fontSize: 12, color: '#64748B' },
  mainPayBtn: { backgroundColor: '#4F46E5', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, flexDirection: 'row', alignItems: 'center' },
  mainPayBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  disabledBtn: { opacity: 0.5 }
});