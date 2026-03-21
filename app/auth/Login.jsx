import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
 KeyboardAvoidingView, Platform,
  Animated, ActivityIndicator, Alert, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
// 👉 REDUX IMPORTS
import { useDispatch, useSelector } from 'react-redux';
import { login, changeRole } from '../../src/redux/authSlice';

// 👉 API IMPORTS
import { LoginConsultant } from '../../src/services/consultantAPI';
import { loginApi } from '../../src/services/authAPI';

// 👉 InputField me ab hum 'themeColor' pass kar rahe hain
// 👉 Removed elevation and shadow from the dynamic focus style so Android doesn't redraw and drop focus!
const InputField = ({ icon, placeholder, value, onChangeText, secureTextEntry, keyboardType = 'default', themeColor }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[
      styles.inputContainer,
      isFocused && { borderColor: themeColor, backgroundColor: '#FFFFFF', borderWidth: 1.5 } // Replaced elevation with a slightly thicker border for the active effect
    ]}>
      <Ionicons name={icon} size={20} color={isFocused ? themeColor : '#9CA3AF'} style={styles.inputIcon} />
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

export default function LoginScreen({ navigation }) {
  const dispatch = useDispatch();

  // 👉 1. REDUX se current role uthana
  const role = useSelector((state) => state.auth.role);
  const isCounselor = role === 'Consultant';

  // 👉 2. DYNAMIC THEME COLOR (Counselor = Green, User = Blue)
  const themeColor = isCounselor ? '#10B981' : '#3B82F6';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Hold on!", "Please enter both Email and Password.");
      return;
    }

    setIsLoading(true);
    try {
      const credentials = { email, password };
      let response;

      // API Call
      if (isCounselor) {
        response = await LoginConsultant(credentials);
      } else {
        response = await loginApi(credentials);
      }

      const token = response?.token || response?.data?.token;
      let userDataToSave = {};

      // 👉 Yahan humne dono API responses ko alag-alag handle kiya hai
      if (isCounselor) {
        // Consultant wale response me koi 'user' object nahi hai, direct role hai
        userDataToSave = {
          role: response?.role || 'Consultant',
          // Agar aage chalkar API me name ya id aaye, toh yahan add kar sakte ho
        };
      } else {
        // User wale response me poora 'user' object aata hai
        userDataToSave = response?.user || response?.data?.user || {};
        // Ensure role is exactly 'User'
        userDataToSave.role = 'User'; 
      }

      if (token) {
        // 1. Storage me Token aur UserData dono save karo
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userData', JSON.stringify(userDataToSave));
        
        console.log("Saved User Data:", userDataToSave);

        // 2. Redux state me dispatch karo (isse app turant login state me jayegi)
        dispatch(login(userDataToSave));
      } else {
        Alert.alert("Login Failed", "Invalid email or password");
      }
    } catch (error) {
      Alert.alert("Login Failed", error.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        // 👉 FIX 2: Set Android behavior to undefined
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          // 👉 FIX 3: Changed 'always' to 'handled' so the keyboard only dismisses when clicking OUTSIDE the inputs
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* Your Animated.View and everything else stays exactly the same inside here */}
          <Animated.View style={{ opacity: fadeAnim, flex: 1, justifyContent: 'center' }}>

            <View style={styles.headerContainer}>
              <View style={[styles.logoCircle, { backgroundColor: isCounselor ? '#D1FAE5' : '#EFF6FF' }]}>
                <Ionicons
                  name={isCounselor ? "medical" : "person"}
                  size={40}
                  color={themeColor} // Dynamic Icon Color
                />
              </View>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>
                Sign in to access your {isCounselor ? "dashboard" : "sessions"}
              </Text>
            </View>

            {/* 👉 REDUX CONTROLLED TOGGLE */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleBtn, !isCounselor && styles.toggleActive]}
                onPress={() => dispatch(changeRole('User'))} // Redux Action
              >
                <Text style={[styles.toggleText, !isCounselor && { color: themeColor }]}>USER</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toggleBtn, isCounselor && styles.toggleActive]}
                onPress={() => dispatch(changeRole('Consultant'))} // Redux Action
              >
                <Text style={[styles.toggleText, isCounselor && { color: themeColor }]}>CONSULTANT</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
              <InputField
                icon="mail-outline"
                placeholder="Email Address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                themeColor={themeColor} // Pass theme color here
              />
              <InputField
                icon="lock-closed-outline"
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
                themeColor={themeColor} // Pass theme color here
              />

              <TouchableOpacity style={styles.forgotPassContainer} onPress={() => navigation?.navigate('ForgetPassword')}>
                <Text style={[styles.forgotPassText, { color: themeColor }]}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                // Dynamic Button Color and Shadow
                style={[
                  styles.loginBtn,
                  { backgroundColor: themeColor, shadowColor: themeColor },
                  isLoading && { backgroundColor: '#9CA3AF', shadowOpacity: 0 }
                ]}
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.loginBtnText}>Log In as {isCounselor ? 'Consultant' : 'User'}</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation?.navigate('Register')}>
                <Text style={[styles.registerLink, { color: themeColor }]}>Sign Up</Text>
              </TouchableOpacity>
            </View>

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContainer: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40, justifyContent: 'center' },
  headerContainer: { alignItems: 'center', marginBottom: 25 },
  logoCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', paddingHorizontal: 20 },

  // Toggle Styles (A bit cleaned up since colors are dynamic now)
  toggleContainer: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 12, padding: 4, marginBottom: 25 },
  toggleBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  toggleActive: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  toggleText: { fontSize: 15, fontWeight: '600', color: '#6B7280' },

  formContainer: { marginBottom: 20 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, marginBottom: 16, paddingHorizontal: 15, height: 55 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#111827', fontSize: 16, height: '100%' },
  forgotPassContainer: { alignItems: 'flex-end', marginBottom: 25 },
  forgotPassText: { fontSize: 14, fontWeight: '600' },
  loginBtn: { height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 4 },
  loginBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  footerText: { color: '#6B7280', fontSize: 14 },
  registerLink: { fontSize: 14, fontWeight: 'bold' },
});