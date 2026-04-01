import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Platform, Animated, ActivityIndicator, Alert, ScrollView,
  Keyboard, TouchableWithoutFeedback // Keyboard dismiss karne ke liye
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { login, changeRole } from '../../src/redux/authSlice';
import { LoginConsultant } from '../../src/services/consultantAPI';
import { loginApi } from '../../src/services/authAPI';
import { loginMentor } from '../../src/services/mentorAPI';

const InputField = React.memo(({ icon, placeholder, value, onChangeText, secureTextEntry, keyboardType = 'default', themeColor }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[
      styles.inputContainer,
      isFocused && { borderColor: themeColor, backgroundColor: '#FFFFFF', borderWidth: 1.5 }
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
});

export default function LoginScreen({ navigation }) {
  const dispatch = useDispatch();
  const role = useSelector((state) => state.auth.role) || 'User';
  
  // Keyboard height manage karne ke liye state
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // --- Theme Logic (Same as before) ---
  const isUser = role === 'User';
  const isCounselor = role === 'Consultant';
  const isMentor = role === 'Mentor';

  let themeColor = '#F27A21';
  let bgLightColor = '#EFF6FF';
  let iconName = 'person';
  let displayRole = 'User';

  if (isCounselor) {
    themeColor = '#F27A21'; bgLightColor = '#EFF6FF'; iconName = 'medical'; displayRole = 'Consultant';
  } else if (isMentor) {
    themeColor = '#F27A21'; bgLightColor = '#EFF6FF'; iconName = 'school'; displayRole = 'Mentor';
  }

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // --- Keyboard Listeners (Android ke liye special fix) ---
  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });

    Animated.timing(fadeAnim, {
      toValue: 1, duration: 800, useNativeDriver: true,
    }).start();

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Hold on!", "Please enter both Email and Password.");
      return;
    }
    setIsLoading(true);
    try {
      const credentials = { email, password };
      let token = null;
      let userDataToSave = {};

      if (isCounselor) {
        const response = await LoginConsultant(credentials);
        token = response?.token || response?.data?.token;
        userDataToSave = { role: 'Consultant' };
      } else if (isMentor) {
        const mentorResponse = await loginMentor(credentials);
        if (!mentorResponse.success) throw new Error(mentorResponse.message);
        token = mentorResponse.token;
        userDataToSave = { ...mentorResponse.data, role: 'Mentor' };
      } else {
        const response = await loginApi(credentials);
        token = response?.token || response?.data?.token;
        userDataToSave = { ...(response?.user || response?.data?.user), role: 'User' };
      }

      if (token) {
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userData', JSON.stringify(userDataToSave));
        dispatch(login(userDataToSave));
      }
    } catch (error) {
      Alert.alert("Login Failed", error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Tap anywhere to close keyboard */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContainer,
            // 💡 Magic Logic: Keyboard khulte hi bottom padding badha do
            { paddingBottom: keyboardHeight > 0 ? keyboardHeight - 50 : 40 }
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{ opacity: fadeAnim, flex: 1, justifyContent: 'center' }}>
            
            <View style={styles.headerContainer}>
              <View style={[styles.logoCircle, { backgroundColor: bgLightColor }]}>
                <Ionicons name={iconName} size={40} color={themeColor} />
              </View>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to access your {displayRole.toLowerCase()} dashboard</Text>
            </View>

            {/* Role Toggles */}
            <View style={styles.toggleContainer}>
              {['User', 'Consultant', 'Mentor'].map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.toggleBtn, role === r && styles.toggleActive]}
                  onPress={() => dispatch(changeRole(r))}
                >
                  <Text style={[styles.toggleText, role === r && { color: themeColor }]}>
                    {r.toUpperCase() === 'USER' ? 'STUDENT' : r.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              <InputField icon="mail-outline" placeholder="Email Address" value={email} onChangeText={setEmail} themeColor={themeColor} keyboardType="email-address" />
              <InputField icon="lock-closed-outline" placeholder="Password" value={password} onChangeText={setPassword} themeColor={themeColor} secureTextEntry />

              {isUser && (
                <TouchableOpacity style={styles.forgotPassContainer} onPress={() => navigation.navigate('ForgetPassword')}>
                  <Text style={[styles.forgotPassText, { color: themeColor }]}>Forgot Password?</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.loginBtn, { backgroundColor: themeColor, shadowColor: themeColor }, isLoading && { backgroundColor: '#9CA3AF' }]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.loginBtnText}>Log In as {displayRole}</Text>}
              </TouchableOpacity>
            </View>

            {isUser && (
              <View style={styles.footer}>
                <Text style={styles.footerText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={[styles.registerLink, { color: themeColor }]}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            )}

          </Animated.View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContainer: { flexGrow: 1, paddingHorizontal: 24, justifyContent: 'center' },
  headerContainer: { alignItems: 'center', marginBottom: 25 },
  logoCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', paddingHorizontal: 20 },
  toggleContainer: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 12, padding: 4, marginBottom: 25 },
  toggleBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  toggleActive: { backgroundColor: '#FFFFFF', elevation: 2 },
  toggleText: { fontSize: 11, fontWeight: '700', color: '#6B7280' },
  formContainer: { marginBottom: 20 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, marginBottom: 16, paddingHorizontal: 15, height: 55 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#111827', fontSize: 16, height: '100%' },
  forgotPassContainer: { alignItems: 'flex-end', marginBottom: 25 },
  forgotPassText: { fontSize: 14, fontWeight: '600' },
  loginBtn: { height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  loginBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  footerText: { color: '#6B7280', fontSize: 14 },
  registerLink: { fontSize: 14, fontWeight: 'bold' },
});