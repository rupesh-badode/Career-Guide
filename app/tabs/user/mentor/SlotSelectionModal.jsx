import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView,
  Platform,
  TextInput,
  KeyboardAvoidingView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PRIMARY_COLOR = '#F27A21';

const getNext7Days = () => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + i);
    dates.push(nextDate);
  }
  return dates;
};

const AVAILABLE_SLOTS = [
  "09:00 AM", "10:30 AM", "12:00 PM", 
  "02:00 PM", "04:30 PM", "06:00 PM", "08:00 PM"
];

export default function SlotSelectionModal({ visible, onClose, mentor, onConfirm }) {
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  
  // 👉 Naya State: User ka custom amount store karne ke liye
  const [customAmount, setCustomAmount] = useState('');

  useEffect(() => {
    if (visible) {
      const upcomingDates = getNext7Days();
      setDates(upcomingDates);
      setSelectedDate(upcomingDates[0]); 
      setSelectedTime(null); 
      setCustomAmount(''); // Modal khulte hi amount clear kar do
    }
  }, [visible]);

  const handleConfirm = () => {
    // Check if amount is entered
    if (!selectedDate || !selectedTime || !customAmount) return;
    
    const formattedDate = selectedDate.toISOString().split('T')[0];
    // 👉 Amount ko bhi confirm function me bhej rahe hain
    onConfirm(mentor, formattedDate, selectedTime, customAmount);
  };

  if (!visible || !mentor) return null;

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView 
        style={styles.overlay} 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableOpacity style={styles.overlayTouchable} onPress={onClose} activeOpacity={1} />
        
        <View style={styles.bottomSheet}>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Book Session</Text>
              <Text style={styles.headerSubtitle}>with {mentor.name}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#4B5563" />
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Select Date</Text>
          <View style={styles.dateScrollWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateScroll}>
              {dates.map((date, index) => {
                const isSelected = selectedDate?.getDate() === date.getDate();
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                const dayNum = date.getDate();

                return (
                  <TouchableOpacity 
                    key={index} 
                    style={[styles.dateBox, isSelected && styles.dateBoxSelected]}
                    onPress={() => {
                      setSelectedDate(date);
                      setSelectedTime(null);
                    }}
                  >
                    <Text style={[styles.dayName, isSelected && styles.textSelected]}>{dayName}</Text>
                    <Text style={[styles.dayNum, isSelected && styles.textSelected]}>{dayNum}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <Text style={styles.sectionTitle}>Available Time</Text>
          <View style={styles.timeGrid}>
            {AVAILABLE_SLOTS.map((time, index) => {
              const isSelected = selectedTime === time;
              return (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.timeBox, isSelected && styles.timeBoxSelected]}
                  onPress={() => setSelectedTime(time)}
                >
                  <Text style={[styles.timeText, isSelected && styles.textSelected]}>{time}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 👉 NAYA: Amount Input Field */}
          <Text style={styles.sectionTitle}>Enter Amount (₹)</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="e.g. 500"
            keyboardType="number-pad"
            value={customAmount}
            onChangeText={setCustomAmount}
          />

          <View style={styles.footer}>
            <TouchableOpacity 
              style={[
                styles.confirmBtn, 
                (!selectedDate || !selectedTime || !customAmount) && styles.confirmBtnDisabled
              ]}
              disabled={!selectedDate || !selectedTime || !customAmount}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmBtnText}>
                {customAmount ? `Proceed to Pay ₹${customAmount}` : 'Enter Details to Pay'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  overlayTouchable: { flex: 1 },
  bottomSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 20, paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  headerSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  closeBtn: { backgroundColor: '#F3F4F6', padding: 8, borderRadius: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginBottom: 12 },
  dateScrollWrapper: { marginBottom: 25, marginHorizontal: -20 },
  dateScroll: { paddingHorizontal: 20, gap: 12 },
  dateBox: { width: 65, height: 75, borderRadius: 16, borderWidth: 1.5, borderColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF', marginRight: 12 },
  dateBoxSelected: { borderColor: PRIMARY_COLOR, backgroundColor: PRIMARY_COLOR },
  dayName: { fontSize: 13, color: '#6B7280', marginBottom: 4, fontWeight: '500' },
  dayNum: { fontSize: 18, color: '#111827', fontWeight: 'bold' },
  textSelected: { color: '#FFFFFF' },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 25 },
  timeBox: { width: '31%', paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB', alignItems: 'center' },
  timeBoxSelected: { borderColor: PRIMARY_COLOR, backgroundColor: PRIMARY_COLOR },
  timeText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  
  // 👉 Amount Input styling
  amountInput: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 20,
    backgroundColor: '#FAFAFA'
  },
  
  footer: { borderTopWidth: 1, borderColor: '#F3F4F6', paddingTop: 15 },
  confirmBtn: { backgroundColor: PRIMARY_COLOR, paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  confirmBtnDisabled: { backgroundColor: '#D1D5DB' },
  confirmBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});