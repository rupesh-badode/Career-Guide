import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  StyleSheet, SafeAreaView, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { login } from '../../src/redux/authSlice'; // Redux Login Action
import { otpVerify } from '../../src/services/authAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OtpVerification({ route, navigation }) {
  const dispatch = useDispatch();
  
  // Safely access email from params
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
      const res = await otpVerify({ email, otp });
      
      if (!res.success) {
        throw new Error(res.message || "OTP Verification failed");
      }
      
      const token = res?.token || res?.data?.token;
      const userDataToSave = { ...(res?.user || res?.data?.user), role: 'User' };

      if (token) {
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userData', JSON.stringify(userDataToSave));
        // Dispatched with data (Note: you had a second dispatch(login()) below, 
        // I removed it to prevent double-dispatching unless your slice requires it)
        dispatch(login(userDataToSave)); 
      }
      
      Alert.alert("Success!", "Account verified successfully.");

    } catch (error) {
      console.log("OTP Verification Error:", error);
      Alert.alert("Verification Failed", error.message || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.wrapper}>
            
            {/* Header / Close Button Section */}
            <View style={styles.header}>
              <TouchableOpacity 
                onPress={() => navigation.goBack()} 
                style={styles.crossBtn}
              >
                <Ionicons name="chevron-back" size={28} color="#111827" />
              </TouchableOpacity>
            </View>

            {/* Main Centered Content */}
            <View style={styles.content}>
              <View style={styles.iconCircle}>
                <Ionicons name="mail-open-outline" size={40} color="#F27A21" />
              </View>
              
              <Text style={styles.title}>Verify Your Email</Text>
              <Text style={styles.subtitle}>
                We have sent a verification code to: {"\n"}
                <Text style={styles.emailText}>{email || "your email"}</Text>
              </Text>

              <TextInput
                style={styles.otpInput}
                placeholder="• • • • • •"
                placeholderTextColor="#9CA3AF"
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

          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#FFFFFF' 
  },
  keyboardView: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 25,
    alignItems: 'flex-start',
  },
  crossBtn: {
    padding: 8,
    marginLeft: -8, // Shifts it slightly left for visual alignment
    borderRadius: 20,
  },
  content: { 
    flex: 1, 
    paddingHorizontal: 24, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingBottom: 60, // Bumps content up slightly to account for the header
  },
  iconCircle: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    backgroundColor: '#FFF2EA', // Changed to match the orange theme
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  title: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: '#111827', 
    marginBottom: 10 
  },
  subtitle: { 
    fontSize: 15, 
    color: '#6B7280', 
    textAlign: 'center', 
    marginBottom: 30, 
    lineHeight: 22 
  },
  emailText: { 
    fontWeight: 'bold', 
    color: '#111827' 
  },
  otpInput: { 
    width: '100%', 
    height: 60, 
    backgroundColor: '#F9FAFB', 
    borderWidth: 1.5, 
    borderColor: '#E5E7EB', 
    borderRadius: 12, 
    fontSize: 24, 
    letterSpacing: 12, 
    color: '#F27A21', // Matched to theme
    fontWeight: 'bold', 
    marginBottom: 24 
  },
  verifyBtn: { 
    width: '100%', 
    backgroundColor: '#F27A21', 
    height: 55, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center', 
    shadowColor: '#F27A21', // Matched to theme
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.25, 
    shadowRadius: 6, 
    elevation: 4 
  },
  verifyBtnDisabled: { 
    backgroundColor: '#F7B280', 
    shadowOpacity: 0,
    elevation: 0 
  },
  verifyBtnText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: 'bold',
    letterSpacing: 0.5
  }
});