import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ==========================================
// DUMMY DATA GENERATORS
// ==========================================
// Generate next 7 days for Date Picker
const getNext7Days = () => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  let dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push({
      id: i.toString(),
      dayName: i === 0 ? 'Today' : days[d.getDay()],
      dateNumber: d.getDate(),
      fullDate: d.toDateString(),
    });
  }
  return dates;
};

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '11:30 AM', 
  '02:00 PM', '03:00 PM', '04:30 PM', '06:00 PM'
];

const COMMUNICATION_MODES = [
  { id: 'video', title: 'Video Call', icon: 'videocam', price: '$15/min', desc: 'Face-to-face interaction' },
  { id: 'audio', title: 'Voice Call', icon: 'call', price: '$10/min', desc: 'High quality audio call' },
  { id: 'chat', title: 'Chat', icon: 'chatbubbles', price: '$5/min', desc: 'Text messaging session' },
];

export default function BookAppointment({ navigation, route }) {
  // --- States ---
  const [selectedDate, setSelectedDate] = useState(getNext7Days()[0].fullDate);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedMode, setSelectedMode] = useState('video'); // Default Video

  const DATES = getNext7Days();
  const counselorName = route?.params?.counselorName || 'Dr. Sarah Lee';

  return (
    <SafeAreaView style={styles.safeArea}>
      

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={20} color="#4F46E5" />
          <Text style={styles.infoText}>Booking session with <Text style={{fontWeight: 'bold'}}>{counselorName}</Text></Text>
        </View>

        {/* ==========================================
            2. DATE PICKER (Horizontal)
        ========================================== */}
        <Text style={styles.sectionTitle}>Select Date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
          {DATES.map((item) => {
            const isSelected = selectedDate === item.fullDate;
            return (
              <TouchableOpacity 
                key={item.id} 
                style={[styles.dateCard, isSelected && styles.activeDateCard]}
                onPress={() => setSelectedDate(item.fullDate)}
                activeOpacity={0.7}
              >
                <Text style={[styles.dateName, isSelected && styles.activeText]}>{item.dayName}</Text>
                <Text style={[styles.dateNumber, isSelected && styles.activeText]}>{item.dateNumber}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ==========================================
            3. TIME SLOTS
        ========================================== */}
        <Text style={styles.sectionTitle}>Available Time Slots</Text>
        <View style={styles.timeGrid}>
          {TIME_SLOTS.map((time, index) => {
            const isSelected = selectedTime === time;
            return (
              <TouchableOpacity 
                key={index} 
                style={[styles.timeSlot, isSelected && styles.activeTimeSlot]}
                onPress={() => setSelectedTime(time)}
                activeOpacity={0.7}
              >
                <Text style={[styles.timeText, isSelected && styles.activeTimeText]}>{time}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ==========================================
            4. COMMUNICATION MODE
        ========================================== */}
        <Text style={styles.sectionTitle}>Session Mode</Text>
        <View style={styles.modeContainer}>
          {COMMUNICATION_MODES.map((mode) => {
            const isSelected = selectedMode === mode.id;
            return (
              <TouchableOpacity 
                key={mode.id} 
                style={[styles.modeCard, isSelected && styles.activeModeCard]}
                onPress={() => setSelectedMode(mode.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconWrapper, isSelected && styles.activeIconWrapper]}>
                  <Ionicons name={mode.icon} size={22} color={isSelected ? '#FFFFFF' : '#4F46E5'} />
                </View>
                <View style={styles.modeTextContainer}>
                  <Text style={styles.modeTitle}>{mode.title}</Text>
                  <Text style={styles.modeDesc}>{mode.desc}</Text>
                </View>
                <View style={styles.priceTag}>
                  <Text style={styles.modePrice}>{mode.price}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

      </ScrollView>

      {/* ==========================================
          5. FIXED BOTTOM PAYMENT BAR
      ========================================== */}
      <View style={styles.bottomBar}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Payable</Text>
          <Text style={styles.totalAmount}>
            {COMMUNICATION_MODES.find(m => m.id === selectedMode)?.price}
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.payBtn, !selectedTime && { backgroundColor: '#A5B4FC' }]} 
          disabled={!selectedTime}
          onPress={() => alert('Proceed to Payment Gateway')}
        >
          <Text style={styles.payBtnText}>Proceed to Pay</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: 5 }} />
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

// ==========================================
// STYLES
// ==========================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  scrollContent: {
    flex:1,
    padding: 20,
    paddingBottom: 20, // For bottom bar
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4F46E5',
  },
  infoText: {
    marginLeft: 8,
    color: '#4338CA',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    marginTop: 10,
  },
  
  // --- Date Picker Styles ---
  dateScroll: {
    marginBottom: 15,
  },
  dateCard: {
    width: 65,
    height: 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeDateCard: {
    backgroundColor: '#4F46E5', // Indigo
    borderColor: '#4F46E5',
  },
  dateName: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  dateNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  activeText: {
    color: '#FFFFFF',
  },

  // --- Time Slots Styles ---
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10, // Modern gap property (RN 0.71+)
    marginBottom: 20,
  },
  timeSlot: {
    width: '31%', // 3 in a row
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeTimeSlot: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  timeText: {
    color: '#4B5563',
    fontWeight: '600',
    fontSize: 13,
  },
  activeTimeText: {
    color: '#4F46E5',
  },

  // --- Mode Styles ---
  modeContainer: {
    marginBottom: 20,
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeModeCard: {
    borderColor: '#4F46E5',
    backgroundColor: '#F8FAFC', // Very light blue/gray
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  activeIconWrapper: {
    backgroundColor: '#4F46E5',
  },
  modeTextContainer: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  modeDesc: {
    fontSize: 12,
    color: '#6B7280',
  },
  priceTag: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  modePrice: {
    color: '#10B981',
    fontWeight: 'bold',
    fontSize: 13,
  },

  // --- Bottom Bar ---
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical:15,
    paddingTop: 5,
    paddingBottom: Platform.OS === 'ios' ? 30 : 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.1, shadowRadius: 5 },
      android: { elevation: 10 },
    }),
  },
  totalContainer: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  payBtn: {
    flexDirection: 'row',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  payBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});