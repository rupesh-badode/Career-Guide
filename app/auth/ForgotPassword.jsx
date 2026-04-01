import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
   KeyboardAvoidingView, Platform,
  Animated, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';
import { forgetPassword } from '../../src/services/user';

// 👉 MOCK API (Isey apne actual function se replace karein)
export default function ForgotPassword({ navigation }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, [fadeAnim]);

  const handleSendOTP = async () => {
    if (!email) {
      Alert.alert("Hold on!", "Please enter your registered email address.");
      return;
    }

    setIsLoading(true);
    try {
      // API call: Backend ko sirf email jayega
      await forgetPassword({ email });
      
      Alert.alert("Success", "OTP sent to your email!");
      // Naye page par email sath lekar jayein
      navigation.navigate('ResetPassword', { email: email });
    } catch (error) {
      Alert.alert("Failed", error.message || "Could not send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Animated.View style={{ opacity: fadeAnim, flex: 1, paddingHorizontal: 24, justifyContent: 'center' }}>
          
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </TouchableOpacity>

          <View style={styles.headerContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="lock-closed" size={40} color="#F27A21" />
            </View>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>Enter your email address to receive a password reset OTP.</Text>
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={{ marginRight: 10 }} />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity 
            style={[styles.btn, isLoading && styles.btnDisabled]} 
            onPress={handleSendOTP}
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnText}>Send OTP</Text>}
          </TouchableOpacity>

        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ... Styles neeche combined hain ...
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  backButton: { position: 'absolute', top: 20, left: 24, zIndex: 10, padding: 5 },
  headerContainer: { alignItems: 'center', marginBottom: 35, marginTop: 40 },
  logoCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', paddingHorizontal: 10, lineHeight: 20 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, marginBottom: 16, paddingHorizontal: 15, height: 55 },
  input: { flex: 1, color: '#111827', fontSize: 16, height: '100%' },
  btn: { backgroundColor: '#F27A21', height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 10, shadowColor: '#F27A21', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 4 },
  btnDisabled: { backgroundColor: '#93C5FD', elevation: 0 },
  btnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
});