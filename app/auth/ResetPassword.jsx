import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  SafeAreaView, KeyboardAvoidingView, Platform,
  Animated, ActivityIndicator, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { resetPassword } from '../../src/services/user';



export default function ResetPassword({ route, navigation }) {
  // Pichle page se bheja gaya email access karein
  const { email } = route.params || {};

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, [fadeAnim]);

  const handleResetPassword = async () => {
    if (!otp || !newPassword) {
      Alert.alert("Hold on!", "Please enter OTP and New Password.");
      return;
    }

    setIsLoading(true);
    try {
      // Backend schema ke hisaab se: { email, otp, newPassword }
      await resetPassword({ email, otp, newPassword });
      
      Alert.alert("Success!", "Password has been reset successfully. Please login.");
      // Kaam khatam hone par wapas Login par bhej dein
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert("Failed", error.message || "Could not reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Animated.View style={{ opacity: fadeAnim, flex: 1, paddingHorizontal: 24, justifyContent: 'center' }}>
          
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>

          <View style={styles.headerContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="key" size={40} color="#3B82F6" />
            </View>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>Enter the OTP sent to <Text style={{fontWeight: 'bold'}}>{email}</Text> and your new password.</Text>
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="keypad-outline" size={20} color="#9CA3AF" style={{ marginRight: 10 }} />
            <TextInput
              style={styles.input}
              placeholder="Enter OTP"
              placeholderTextColor="#9CA3AF"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={{ marginRight: 10 }} />
            <TextInput
              style={styles.input}
              placeholder="New Password"
              placeholderTextColor="#9CA3AF"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={true}
            />
          </View>

          <TouchableOpacity 
            style={[styles.btn, isLoading && styles.btnDisabled]} 
            onPress={handleResetPassword}
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnText}>Reset Password</Text>}
          </TouchableOpacity>

        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ==========================================
// STYLES (Dono screens ke liye common)
// ==========================================
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  backButton: { position: 'absolute', top: 20, left: 24, zIndex: 10, padding: 5 },
  headerContainer: { alignItems: 'center', marginBottom: 35, marginTop: 40 },
  logoCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', paddingHorizontal: 10, lineHeight: 20 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, marginBottom: 16, paddingHorizontal: 15, height: 55 },
  input: { flex: 1, color: '#111827', fontSize: 16, height: '100%' },
  btn: { backgroundColor: '#3B82F6', height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 10, shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 4 },
  btnDisabled: { backgroundColor: '#93C5FD', elevation: 0 },
  btnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
});