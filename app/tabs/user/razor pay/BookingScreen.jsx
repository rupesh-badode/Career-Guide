import React, { useState } from 'react';
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
  // Params handle karein
  const { consultantId = "1", consultantName = "Expert Consultant", amount = 499 } = route.params || {};

  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  // Dates Generate Karein (Next 7 Days)
  const dates = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      id: i,
      full: d.toISOString().split('T')[0],
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: d.getDate(),
    };
  });

  // Time Slots
  const timeSlots = ["09:00 AM", "11:00 AM", "01:00 PM", "03:00 PM", "05:00 PM", "07:00 PM"];

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
        key: 'rzp_test_Your_Key_Here', // Apni API Key dalein
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
      {/* 1. Modern Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Booking</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* 2. Consultant Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{consultantName.charAt(0)}</Text>
          </View>
          <View>
            <Text style={styles.cName}>{consultantName}</Text>
            <Text style={styles.cType}>Career & Growth Mentor</Text>
          </View>
        </View>

        {/* 3. Date Selection */}
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

        {/* 4. Time Selection Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Available Slots</Text>
          <View style={styles.grid}>
            {timeSlots.map((slot, index) => (
              <TouchableOpacity 
                key={index} 
                onPress={() => setSelectedTime(slot)}
                style={[styles.slot, selectedTime === slot && styles.activeSlot]}
              >
                <Text style={[styles.slotText, selectedTime === slot && styles.activeText]}>{slot}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 5. Pricing Table */}
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

      {/* 6. Fixed Bottom Footer */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerSub}>Amount to Pay</Text>
          <Text style={styles.footerPrice}>₹{amount}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.mainPayBtn, isLoading && styles.disabledBtn]} 
          onPress={handlePayment}
          disabled={isLoading}
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
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff' 
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  backBtn: { padding: 8 },
  scrollContent: { padding: 20, paddingBottom: 120 },
  summaryCard: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', 
    padding: 16, borderRadius: 16, marginBottom: 25, 
    borderWidth: 1, borderColor: '#E2E8F0' 
  },
  avatar: { 
    width: 50, height: 50, borderRadius: 25, backgroundColor: '#4F46E5', 
    justifyContent: 'center', alignItems: 'center', marginRight: 15 
  },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  cName: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  cType: { fontSize: 13, color: '#64748B' },
  section: { marginBottom: 25 },
  sectionLabel: { fontSize: 16, fontWeight: '700', color: '#334155', marginBottom: 12 },
  horizontalScroll: { flexDirection: 'row' },
  dateBox: { 
    width: 65, height: 80, backgroundColor: '#fff', borderRadius: 12, 
    justifyContent: 'center', alignItems: 'center', marginRight: 12, 
    borderWidth: 1, borderColor: '#E2E8F0' 
  },
  activeBox: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  dateDay: { fontSize: 12, color: '#64748B' },
  dateNum: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginTop: 4 },
  activeText: { color: '#fff' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  slot: { 
    width: '31%', backgroundColor: '#fff', paddingVertical: 12, 
    borderRadius: 10, alignItems: 'center', marginBottom: 10, 
    borderWidth: 1, borderColor: '#E2E8F0' 
  },
  activeSlot: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  slotText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  tableCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  tableTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 15 },
  tableRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  tableLabel: { color: '#64748B', fontSize: 14 },
  tableValue: { color: '#1E293B', fontWeight: '600' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12, marginTop: 5 },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: '#4F46E5' },
  footer: { 
    position: 'absolute', bottom: 0, width: '100%', 
    backgroundColor: '#fff', padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 25,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderTopWidth: 1, borderTopColor: '#E2E8F0', elevation: 20
  },
  footerPrice: { fontSize: 22, fontWeight: 'bold', color: '#1E293B' },
  footerSub: { fontSize: 12, color: '#64748B' },
  mainPayBtn: { 
    backgroundColor: '#4F46E5', paddingHorizontal: 24, paddingVertical: 14, 
    borderRadius: 12, flexDirection: 'row', alignItems: 'center' 
  },
  mainPayBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  disabledBtn: { opacity: 0.5 }
});