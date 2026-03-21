import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  SafeAreaView, KeyboardAvoidingView, Platform,
  Animated, ActivityIndicator, Alert, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { registerUser } from '../../src/services/user'; 
import { useNavigation } from '@react-navigation/native';

const InputField = ({ icon, placeholder, value, onChangeText, secureTextEntry, keyboardType = 'default' }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.inputContainer, isFocused && styles.inputFocused]}>
      <Ionicons name={icon} size={20} color={isFocused ? '#3B82F6' : '#9CA3AF'} style={styles.inputIcon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoCapitalize="none"
      />
    </View>
  );
};

export default function RegisterScreen({}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [neetScore, setNeetScore] = useState('');

  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState(''); 
  const [zipCode, setZipCode] = useState('');

  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Glitch se bachne ke liye sirf fade animation rakhi hai, translate hata di hai
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleRegister = async () => {
    if (!name || !email || !password || !phone) {
      Alert.alert("Hold on!", "Name, Email, Password and Phone are required.");
      return;
    }

    setIsLoading(true);
    try {
      const userData = {
        name, email, password, phone, neetScore,
        address: { addressLine1, addressLine2, city, state: stateName, zipCode }
      };

      await registerUser(userData);
      
      // ✅ SUCCESS HONE PAR OTP PAGE PAR BHEJEIN AUR EMAIL SATH LE JAYEIN
      navigation.navigate('OtpVerification', { email: email });

    } catch (error) {
      Alert.alert("Registration Failed", error.message || error || "Something went wrong");
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
        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled" // ✅ YEH GLITCH FIX KAREGA
        >
          <Animated.View style={{ opacity: fadeAnim, flex: 1, justifyContent: 'center' }}>
            
            <View style={styles.headerContainer}>
              <View style={styles.logoCircle}>
                <Ionicons name="person-add" size={36} color="#3B82F6" />
              </View>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Sign up to get started and book your sessions!</Text>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.sectionHeader}>Personal Details</Text>
              
              <InputField icon="person-outline" placeholder="Full Name" value={name} onChangeText={setName} />
              <InputField icon="mail-outline" placeholder="Email Address" value={email} onChangeText={setEmail} keyboardType="email-address" />
              <InputField icon="call-outline" placeholder="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
              <InputField icon="school-outline" placeholder="NEET Score" value={neetScore} onChangeText={setNeetScore} keyboardType="numeric" />
              <InputField icon="lock-closed-outline" placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry={true} />

              <Text style={[styles.sectionHeader, { marginTop: 10 }]}>Address Details</Text>
              
              <InputField icon="home-outline" placeholder="Address Line 1" value={addressLine1} onChangeText={setAddressLine1} />
              <InputField icon="business-outline" placeholder="Address Line 2 (Optional)" value={addressLine2} onChangeText={setAddressLine2} />
              
              <View style={styles.row}>
                <View style={styles.flex1}>
                  <InputField icon="location-outline" placeholder="City" value={city} onChangeText={setCity} />
                </View>
                <View style={{ width: 10 }} />
                <View style={styles.flex1}>
                  <InputField icon="map-outline" placeholder="State" value={stateName} onChangeText={setStateName} />
                </View>
              </View>

              <InputField icon="pin-outline" placeholder="Zip Code" value={zipCode} onChangeText={setZipCode} keyboardType="numeric" />

              <TouchableOpacity 
                style={[styles.registerBtn, isLoading && styles.registerBtnDisabled]} 
                onPress={handleRegister}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Text style={styles.registerBtnText}>Sign Up</Text>}
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation?.navigate('Login')}>
                <Text style={styles.loginLink}>Log In</Text>
              </TouchableOpacity>
            </View>

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// STYLES (Same as before)
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContainer: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  headerContainer: { alignItems: 'center', marginBottom: 30, marginTop: 40 },
  logoCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', paddingHorizontal: 20 },
  formContainer: { marginBottom: 20 },
  sectionHeader: { fontSize: 14, fontWeight: 'bold', color: '#3B82F6', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 15, marginLeft: 4 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, marginBottom: 16, paddingHorizontal: 15, height: 55 },
  inputFocused: { borderColor: '#3B82F6', backgroundColor: '#FFFFFF', shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 1 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#111827', fontSize: 16, height: '100%' },
  row: { flexDirection: 'row' },
  flex1: { flex: 1 },
  registerBtn: { backgroundColor: '#3B82F6', height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 15, shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 4 },
  registerBtnDisabled: { backgroundColor: '#93C5FD', elevation: 0, shadowOpacity: 0 },
  registerBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  footerText: { color: '#6B7280', fontSize: 14 },
  loginLink: { color: '#3B82F6', fontSize: 14, fontWeight: 'bold' },
});