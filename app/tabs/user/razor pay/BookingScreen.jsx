import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert,
  ActivityIndicator, ScrollView, Platform, Dimensions
} from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';

// 👉 APIs IMPORT
import { key_id } from '../../../../src/constants/MainContent';
import { scheduleMeetingReminder } from '../../../../src/services/NotificationService';
import { createBooking, verifyBookingPayment } from '../../../../src/services/booking'; // Consultant APIs
import { BookMentor, verifyMentorbooking, getSlots } from '../../../../src/services/user'; // Mentor APIs

const { width } = Dimensions.get('window');

// 🛡️ Secure Badges Component (Inline for easy copy-paste)
const SecurePaymentBadges = () => (
  <View style={styles.secureContainer}>
    <View style={styles.badgeItem}>
      <MaterialCommunityIcons name="shield-check-outline" size={20} color="#10B981" />
      <Text style={styles.badgeTitle}>100% Secure</Text>
    </View>
    <View style={styles.verticalDivider} />
    <View style={styles.badgeItem}>
      <Ionicons name="lock-closed-outline" size={18} color="#F27A21" />
      <Text style={styles.badgeTitle}>Safe Payment</Text>
    </View>
    <View style={styles.verticalDivider} />
    <View style={styles.badgeItem}>
      <MaterialCommunityIcons name="credit-card-check-outline" size={20} color="#3B82F6" />
      <Text style={styles.badgeTitle}>Trusted</Text>
    </View>
  </View>
);

export default function BookingScreen({ route, navigation }) {
  // 🔥 ROLE parameter add kiya gaya hai (Default: Consultant)
  const { 
    consultantId = "1", 
    consultantName = "Expert", 
    amount = 499, 
    role = "Consultant" // "Mentor" ya "Consultant" pass karein
  } = route.params || {};

  const [isLoading, setIsLoading] = useState(false);
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [allSlotsData, setAllSlotsData] = useState({});
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);

  // 1. Fetch Slots
  useEffect(() => {
    const fetchAllSlots = async () => {
      setIsFetchingSlots(true);
      try {
        // As per your original code, getSlots is same for both
        const response = await getSlots({ consultantId });

        if (response && response.success && response.slots) {
          const cleanData = {};
          response.slots.forEach(dayRecord => {
            if (!dayRecord.date) return;
            const recordDateStr = dayRecord.date.split('T')[0];
            const availabilityId = dayRecord._id; 

            if (!cleanData[recordDateStr]) cleanData[recordDateStr] = [];

            if (dayRecord.slots && Array.isArray(dayRecord.slots)) {
              dayRecord.slots.forEach(slotItem => {
                if (!slotItem.isBooked && slotItem.time) {
                  cleanData[recordDateStr].push({
                    time: slotItem.time,
                    slotId: slotItem._id,
                    availabilityId: availabilityId
                  });
                }
              });
            }
          });

          // Remove Duplicates
          Object.keys(cleanData).forEach(dateKey => {
            const uniqueSlots = [];
            const map = new Map();
            for (const item of cleanData[dateKey]) {
              if (!map.has(item.slotId)) {
                map.set(item.slotId, true);
                uniqueSlots.push(item);
              }
            }
            cleanData[dateKey] = uniqueSlots;
          });

          setAllSlotsData(cleanData);
        }
      } catch (error) {
        console.log("Error fetching slots:", error);
      } finally {
        setIsFetchingSlots(false);
      }
    };

    if (consultantId) fetchAllSlots();
  }, [consultantId]);

  useEffect(() => {
    setSelectedTime(null);
  }, [selectedDate]);

  const availableSlotsForDate = useMemo(() => {
    if (!allSlotsData || Object.keys(allSlotsData).length === 0 || !selectedDate) return [];
    return allSlotsData[selectedDate] || [];
  }, [allSlotsData, selectedDate]);

  const markedDatesForCalendar = useMemo(() => {
    let marked = {};
    if (allSlotsData && Object.keys(allSlotsData).length > 0) {
      Object.keys(allSlotsData).forEach(dateStr => {
        if (allSlotsData[dateStr].length > 0) {
          marked[dateStr] = { customStyles: { text: { color: '#10B981', fontWeight: 'bold' } } };
        }
      });
    }
    if (selectedDate) {
      marked[selectedDate] = {
        customStyles: {
          container: { backgroundColor: '#F27A21', borderRadius: 20 },
          text: { color: '#FFFFFF', fontWeight: 'bold' }
        }
      };
    }
    return marked;
  }, [allSlotsData, selectedDate]);

  const handleTimeChange = (event, selectedDateObj) => {
    setShowTimePicker(false);
    if (selectedDateObj) {
      let hours = selectedDateObj.getHours();
      let minutes = selectedDateObj.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      minutes = minutes < 10 ? '0' + minutes : minutes;
      setSelectedTime(`${hours}:${minutes} ${ampm}`);
    }
  };

  const handlePayment = async () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert("Selection Missing", "Please select both a date and a time slot.");
      return;
    }

    if (Platform.OS === 'web') {
      Alert.alert("Web Notice", "Razorpay integration works on Mobile Devices.");
      return;
    }

    setIsLoading(true);
    try {
      // 🔥 CONDITION 1: CREATE ORDER API CALL
      const payload = {
        consultantId: consultantId,
        availabilityId: selectedTime?.availabilityId || null,
        slotId: selectedTime?.slotId || null,
        bookingDate: selectedDate
      };

      let orderResponse;
      if (role === 'Mentor') {
        orderResponse = await BookMentor(payload);
      } else {
        orderResponse = await createBooking(payload);
      }

      if (!orderResponse?.success) {
        Alert.alert("Error", "Failed to create order. Try again.");
        setIsLoading(false);
        return;
      }

      const options = {
        description: `Consultation with ${consultantName}`,
        image: "https://your-logo-url.png",
        currency: 'INR',
        key: key_id,
        amount: orderResponse.order.amount,
        name: 'Aastroneet',
        order_id: orderResponse.order.id,
        theme: { color: '#F27A21' },
        prefill: { email: 'user@example.com', contact: '9999999999', name: 'User' }
      };

      RazorpayCheckout.open(options).then(async (data) => {
        const verificationPayload = {
          razorpay_order_id: data.razorpay_order_id,
          razorpay_payment_id: data.razorpay_payment_id,
          razorpay_signature: data.razorpay_signature,
          consultantId: consultantId, 
          availabilityId: selectedTime?.availabilityId || "",
          slotId: selectedTime?.slotId || "",
          date: selectedDate,
          time: typeof selectedTime === 'string' ? selectedTime : selectedTime.time
        };

        // 🔥 CONDITION 2: VERIFICATION API CALL
        let verification;
        if (role === 'Mentor') {
          verification = await verifyMentorbooking(verificationPayload);
        } else {
          verification = await verifyBookingPayment(verificationPayload);
        }

        if (verification?.success) {
          const currentBooking = verification.data[0];
          if (currentBooking) {
            await scheduleMeetingReminder(currentBooking);
          }
          navigation.navigate("BookingSuccess");
        } else {
          Alert.alert("Payment Failed", "Backend could not verify signature.");
        }

      }).catch(err => {
        console.log("Payment Error:", err);
        Alert.alert("Payment Cancelled", "Transaction not completed.");
      });

    } catch (error) {
      Alert.alert("Error", error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const displayFormattedDate = (dateString) => {
    if (!dateString) return "";
    const [y, m, d] = dateString.split('-');
    return `${d}-${m}-${y}`;
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
            <Text style={styles.cType}>{role === 'Mentor' ? 'Career & Growth Mentor' : 'Expert Consultant'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Select Date</Text>
          <View style={styles.calendarContainer}>
            <Calendar
              minDate={todayStr}
              onDayPress={(day) => setSelectedDate(day.dateString)}
              markingType={'custom'}
              markedDates={markedDatesForCalendar}
              theme={{ todayTextColor: '#F27A21', arrowColor: '#F27A21', textDayFontWeight: '500' }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Available Slots for {displayFormattedDate(selectedDate)}</Text>

          {isFetchingSlots ? (
            <ActivityIndicator size="large" color="#F27A21" style={{ marginVertical: 20 }} />
          ) : availableSlotsForDate.length > 0 ? (
            <View style={styles.grid}>
              {availableSlotsForDate.map((slotObj, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedTime(slotObj)}
                  style={[styles.slotCard, selectedTime?.slotId === slotObj.slotId && styles.activeSlotCard]}
                >
                  <Text style={[styles.slotText, selectedTime?.slotId === slotObj.slotId && styles.activeText]}>
                    {slotObj.time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.noSlotContainer}>
              <Ionicons name="calendar-clear-outline" size={32} color="#94A3B8" />
              <Text style={styles.noSlotText}>No slots available for this date.</Text>
            </View>
          )}

          {/* <TouchableOpacity style={styles.customTimeBtn} onPress={() => setShowTimePicker(true)}>
            <Ionicons name="time-outline" size={20} color="#F27A21" />
            <Text style={styles.customTimeText}>
              {selectedTime && !availableSlotsForDate.includes(selectedTime)
                ? `Custom Time: ${typeof selectedTime === 'string' ? selectedTime : selectedTime.time}`
                : "Or Enter Custom Time Manually"}
            </Text>
          </TouchableOpacity> */}
          {showTimePicker && (
            <DateTimePicker value={new Date()} mode="time" is24Hour={false} display="default" onChange={handleTimeChange} />
          )}
        </View>

        {/* 🛡️ SECURE BADGES */}
        <SecurePaymentBadges />

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

      <View style={styles.footer}>
        <View>
          <Text style={styles.footerSub}>Amount to Pay</Text>
          <Text style={styles.footerPrice}>₹{amount}</Text>
        </View>
        <TouchableOpacity
          style={[styles.mainPayBtn, (isLoading || !selectedDate || !selectedTime) && styles.disabledBtn]}
          onPress={handlePayment}
          disabled={isLoading || !selectedDate || !selectedTime}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.mainPayBtnText}>Book Now</Text>
              <MaterialIcons name="security" size={18} color="#fff" style={{ marginLeft: 8 }} />
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
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#F27A21', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  cName: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  cType: { fontSize: 13, color: '#64748B' },
  section: { marginBottom: 25 },
  sectionLabel: { fontSize: 16, fontWeight: '700', color: '#554333', marginBottom: 12 },
  calendarContainer: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0', paddingBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  slotCard: { width: '31%', backgroundColor: '#EEF2FF', paddingVertical: 12, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#fee9c7' },
  activeSlotCard: { backgroundColor: '#F27A21', borderColor: '#F27A21', transform: [{ scale: 1.02 }] },
  slotText: { fontSize: 13, fontWeight: '700', color: '#F27A21' },
  activeText: { color: '#fff' },
  noSlotContainer: { padding: 20, alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed', marginBottom: 15 },
  noSlotText: { fontSize: 15, fontWeight: '600', color: '#475569', marginTop: 8 },
  customTimeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, backgroundColor: '#EEF2FF', borderRadius: 10, borderWidth: 1, borderColor: '#fee9c7', borderStyle: 'dashed' },
  customTimeText: { marginLeft: 8, fontSize: 14, fontWeight: '600', color: '#F27A21' },
  
  /* SECURE BADGES STYLES */
  secureContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ECFDF5', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: '#D1FAE5', marginBottom: 20 },
  badgeItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  badgeTitle: { fontSize: 12, fontWeight: '600', color: '#065F46' },
  verticalDivider: { width: 1, height: 20, backgroundColor: '#A7F3D0' },

  tableCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  tableTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 15 },
  tableRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  tableLabel: { color: '#64748B', fontSize: 14 },
  tableValue: { color: '#1E293B', fontWeight: '600' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12, marginTop: 5 },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: '#F27A21' },
  footer: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#fff', padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 25, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#E2E8F0', elevation: 20 },
  footerPrice: { fontSize: 22, fontWeight: 'bold', color: '#1E293B' },
  footerSub: { fontSize: 12, color: '#64748B' },
  mainPayBtn: { backgroundColor: '#F27A21', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, flexDirection: 'row', alignItems: 'center' },
  mainPayBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  disabledBtn: { opacity: 0.5 }
});