import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, 
  ScrollView, Alert, Platform, UIManager, LayoutAnimation, Animated, 
  TextInput, KeyboardAvoidingView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CreateAvailability } from '../../../../src/services/consultantAPI';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const THEME_COLOR = '#F59E0B'; // Emerald Green
const TEXT_DARK = '#111827';
const TEXT_MUTED = '#6B7280';

// Pre-defined slots
const DEFAULT_SLOTS = [
  "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", 
  "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", 
  "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM"
];

export default function CreateAvailabilityScreen({ navigation }) {
  const todayStr = new Date().toISOString().split('T')[0];
  
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('');
  
  // Custom Time ke liye states
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [allAvailableSlots, setAllAvailableSlots] = useState(DEFAULT_SLOTS);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  const toggleSlot = (slot) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (selectedSlots.includes(slot)) {
      setSelectedSlots(prev => prev.filter(s => s !== slot));
    } else {
      setSelectedSlots(prev => [...prev, slot]);
    }
  };

  const handleTimeChange = (event, selectedDateObj) => {
    setShowTimePicker(false);
    if (selectedDateObj) {
      let hours = selectedDateObj.getHours();
      let minutes = selectedDateObj.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      
      hours = hours % 12;
      hours = hours ? hours : 12; 
      minutes = minutes < 10 ? '0' + minutes : minutes;
      
      const formattedTime = `${hours}:${minutes} ${ampm}`;
      
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      
      if (!allAvailableSlots.includes(formattedTime)) {
        setAllAvailableSlots(prev => [...prev, formattedTime]);
      }
      if (!selectedSlots.includes(formattedTime)) {
        setSelectedSlots(prev => [...prev, formattedTime]);
      }
    }
  };

  const handleSubmit = async () => {
    if (!selectedDate) {
      Alert.alert("Missing Details", "Please select a date.");
      return;
    }
    if (selectedSlots.length === 0) {
      Alert.alert("Missing Details", "Please select at least one time slot.");
      return;
    }
    if (!amount || isNaN(amount)) {
      Alert.alert("Missing Amount", "Please enter a valid amount.");
      return;
    }
    if(!duration){
      Alert.alert("Missing Duration", "Please enter a valid duration.");
      return;
    }

    setIsLoading(true);

    try {
      // 👉 FIX: amount ab har slot ke andar aayega
      const formattedSlots = selectedSlots.map(time => ({
        time: time,
        amount: Number(amount),
        duration:Number(duration) 
      }));

      const payload = {
        date: selectedDate, // 'YYYY-MM-DD'
        slots: formattedSlots // Array of objects [{time, amount}]
      };

      console.log("Submitting Payload:", payload);

      const response = await CreateAvailability(payload); 
      
      console.log("API Response:", response);
      
      if (response && response.success) { 
        Alert.alert("Success", "Availability created successfully.");
        // Optional: navigation.goBack();
      } else {
        Alert.alert("Error", response?.message || "Failed to create availability.");
      }
    } catch (error) {
      console.log("Create Availability Error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Set Availability</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
            
            {/* CALENDAR */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Date</Text>
              <View style={styles.card}>
                <Calendar
                  minDate={todayStr}
                  onDayPress={handleDayPress}
                  markedDates={{
                    [selectedDate]: { selected: true, selectedColor: THEME_COLOR, selectedTextColor: '#fff' }
                  }}
                  theme={{
                    todayTextColor: THEME_COLOR,
                    arrowColor: THEME_COLOR,
                    textDayFontWeight: '500',
                    monthTextColor: TEXT_DARK,
                    textMonthFontWeight: 'bold',
                  }}
                />
              </View>
            </View>
            {/* duration */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Duration (Minutes)</Text>
              <View style={[styles.card, styles.inputContainer]}>
                <Ionicons name="timer-outline" size={24} color={TEXT_MUTED} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 30"
                  placeholderTextColor="#9CA3AF"
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="numeric" // Number pad khulega
                  returnKeyType="done"
                />
              </View>
            </View>

            {/* TIME SLOTS */}
            <View style={styles.section}>
              <View style={styles.slotsHeader}>
                <Text style={styles.sectionTitle}>Select Time Slots</Text>
                <Text style={styles.slotCount}>
                  {selectedSlots.length > 0 ? `${selectedSlots.length} Selected` : 'None Selected'}
                </Text>
              </View>
              
              <View style={styles.gridContainer}>
                {allAvailableSlots.map((slot, index) => {
                  const isSelected = selectedSlots.includes(slot);
                  return (
                    <TouchableOpacity
                      key={index}
                      activeOpacity={0.7}
                      onPress={() => toggleSlot(slot)}
                      style={[styles.slotChip, isSelected && styles.slotChipActive]}
                    >
                      <Ionicons 
                        name={isSelected ? "time" : "time-outline"} 
                        size={16} 
                        color={isSelected ? "#fff" : TEXT_MUTED} 
                        style={{ marginRight: 6 }} 
                      />
                      <Text style={[styles.slotText, isSelected && styles.slotTextActive]}>
                        {slot}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity 
                style={styles.customTimeBtn}
                onPress={() => setShowTimePicker(true)}
              >
                <Ionicons name="add-circle-outline" size={20} color={THEME_COLOR} />
                <Text style={styles.customTimeText}>Add Custom Time Slot</Text>
              </TouchableOpacity>

              {showTimePicker && (
                <DateTimePicker
                  value={new Date()}
                  mode="time"
                  is24Hour={false}
                  display="default"
                  onChange={handleTimeChange}
                />
              )}
            </View>

            {/* AMOUNT PER SLOT */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Amount Per Slot (₹)</Text>
              <View style={[styles.card, styles.inputContainer]}>
                <Ionicons name="wallet-outline" size={24} color={TEXT_MUTED} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 500"
                  placeholderTextColor="#9CA3AF"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric" // Number pad khulega
                  returnKeyType="done"
                />
              </View>
            </View>

          </Animated.View>
        </ScrollView>

        {/* FOOTER */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.submitBtnText}>Save Availability</Text>
                <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' }, // Halka grayish background better contrast ke liye
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: TEXT_DARK },
  scrollContent: { padding: 16, paddingBottom: 180 }, // Footer ke liye space
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: TEXT_DARK, marginBottom: 12 },
  
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#F3F4F6', 
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 8 
  },
  
  slotsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  slotCount: { fontSize: 13, fontWeight: '600', color: THEME_COLOR, marginBottom: 12 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
  
  slotChip: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    width: '31%', 
    backgroundColor: '#fff', 
    paddingVertical: 12, 
    borderRadius: 12, 
    borderWidth: 1.5, 
    borderColor: '#E5E7EB' 
  },
  slotChipActive: { 
    backgroundColor: THEME_COLOR, 
    borderColor: THEME_COLOR, 
    transform: [{ scale: 1.02 }] // Smooth press feel
  },
  slotText: { fontSize: 13, fontWeight: '600', color: TEXT_MUTED },
  slotTextActive: { color: '#fff' },
  
  customTimeBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 14, 
    marginTop: 16, 
    backgroundColor: '#ECFDF5', 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#A7F3D0', 
    borderStyle: 'dashed' 
  },
  customTimeText: { marginLeft: 8, fontSize: 14, fontWeight: '600', color: THEME_COLOR },
  
  // 👉 ADDED: Input aur Icon ki styling
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: TEXT_DARK,
    fontWeight: '600',
    height: '100%',
  },
  
  footer: { 
    position: 'absolute', 
    bottom: 0, 
    width: '100%', 
    backgroundColor: '#fff', 
    padding: 16, 
    paddingBottom: Platform.OS === 'ios' ? 34 :100, 
    borderTopWidth: 1, 
    borderTopColor: '#F3F4F6', 
    elevation: 10 
  },
  submitBtn: { 
    backgroundColor: THEME_COLOR, 
    paddingVertical: 16, 
    borderRadius: 12, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    shadowColor: THEME_COLOR, 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 6, 
    elevation: 5 
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});