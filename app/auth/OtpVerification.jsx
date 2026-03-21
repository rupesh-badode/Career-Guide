import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  StyleSheet, SafeAreaView, ActivityIndicator, Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { login } from '../../src/redux/authSlice'; // Redux Login Action

// 👉 YAHAN APNI VERIFY OTP API IMPORT KAREIN
import { verifyOtp } from '../../src/services/user'; 

export default function OtpVerification({ route, navigation }) {
  const dispatch = useDispatch();
  
  // Pichle page se bheja gaya email yahan access karein
  const { email } = route.params || {};
  
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 4) {
      Alert.alert("Invalid", "Please enter a valid OTP.");
      return;
    }

    setIsLoading(true);
    try {
      // Backend object pass karna -> { email, otp }
      await verifyOtp({ email, otp });
      
      Alert.alert("Success!", "Account created successfully.");
      
      // Verification ke baad Redux status true karein taaki seedha home screen khule
      dispatch(login()); 

    } catch (error) {
      Alert.alert("Verification Failed", error.message || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        <View style={styles.iconCircle}>
          <Ionicons name="mail-open-outline" size={40} color="#3B82F6" />
        </View>
        
        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.subtitle}>
          We have sent a verification code to: {"\n"}
          <Text style={{ fontWeight: 'bold', color: '#111827' }}>{email}</Text>
        </Text>

        <TextInput
          style={styles.otpInput}
          placeholder="Enter OTP"
          keyboardType="number-pad"
          maxLength={6}
          value={otp}
          onChangeText={setOtp}
          textAlign="center"
        />

        <TouchableOpacity 
          style={[styles.verifyBtn, isLoading && styles.verifyBtnDisabled]} 
          onPress={handleVerifyOTP}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.verifyBtnText}>Verify OTP</Text>
          )}
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, paddingHorizontal: 24, justifyContent: 'center', alignItems: 'center' },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#111827', marginBottom: 10 },
  subtitle: { fontSize: 15, color: '#6B7280', textAlign: 'center', marginBottom: 30, lineHeight: 22 },
  otpInput: { width: '100%', height: 60, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, fontSize: 24, letterSpacing: 8, color: '#3B82F6', fontWeight: 'bold', marginBottom: 20 },
  verifyBtn: { width: '100%', backgroundColor: '#3B82F6', height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 4 },
  verifyBtnDisabled: { backgroundColor: '#93C5FD', elevation: 0 },
  verifyBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});