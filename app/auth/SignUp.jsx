import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  SafeAreaView, KeyboardAvoidingView, Platform,
  Animated, ActivityIndicator, Alert, ScrollView, Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { registerApi } from '../../src/services/authAPI';

// Make sure to import your API service correctly
// import { registerUser } from '../../src/services/user'; 

const { width } = Dimensions.get('window');

const InputField = ({ icon, placeholder, value, onChangeText, secureTextEntry, keyboardType = 'default' }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.inputContainer, isFocused && styles.inputFocused]}>
      <Ionicons name={icon} size={20} color={isFocused ? '#F27A21' : '#9CA3AF'} style={styles.inputIcon} />
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

export default function RegisterScreen() {
  const navigation = useNavigation();

  // Form State
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Personal
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Step 2: Academic/Exam
  const [dob, setDob] = useState('');
  const [dot, setDot] = useState('');
  const [neetScore, setNeetScore] = useState('');

  // Step 3: Address
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState(''); 
  const [zipCode, setZipCode] = useState('');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Initial Load Animation
  useEffect(() => {
    animateIn();
  }, []);

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true })
    ]).start();
  };

  const animateOutAndChangeStep = (nextStep, direction) => {
    const slideOutValue = direction === 'next' ? -50 : 50;
    const slideInValue = direction === 'next' ? 50 : -50;

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: slideOutValue, duration: 200, useNativeDriver: true })
    ]).start(() => {
      setStep(nextStep);
      slideAnim.setValue(slideInValue);
      animateIn();
    });
  };

  const handleNext = () => {
    if (step === 1) {
      if (!name || !email || !phone || !password) {
        Alert.alert("Hold on!", "Please fill all personal details.");
        return;
      }
      animateOutAndChangeStep(2, 'next');
    } else if (step === 2) {
      if (!dob  || !neetScore) {
        Alert.alert("Hold on!", "Please fill all exam details.");
        return;
      }
      animateOutAndChangeStep(3, 'next');
    }
  };

  const handleBack = () => {
    if (step > 1) animateOutAndChangeStep(step - 1, 'back');
  };

  const handleRegister = async () => {
    if (!addressLine1 || !city || !stateName || !zipCode) {
      Alert.alert("Hold on!", "Please fill required address fields.");
      return;
    }

    setIsLoading(true);
    try {
      // ✅ Payload exactly matches your requested backend req.body
      const userData = {
        name, 
        email, 
        password, 
        neetScore, 
        phone, 
        dob, 
        address: { 
          addressLine1, 
          addressLine2, 
          city, 
          state: stateName, 
          zipCode 
        }
      };

      const res =    await registerApi(userData);

      if (res.success) {
        Alert.alert("Registration Success", "You have successfully registered.");
        navigation.navigate("OtpVerification", { email }); // Pass email for OTP verification
      } else {
        Alert.alert("Registration Failed", res.message || "Something went wrong");
        setIsLoading(false);
      }
  
      console.log("Submitting payload:", userData);
      

    } catch (error) {
      Alert.alert("Registration Failed", error.message || "Something went wrong");
      setIsLoading(false);
    }
  };

  const renderProgressBar = () => {
    return (
      <View style={styles.progressContainer}>
        {[1, 2, 3].map((item) => (
          <View key={item} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={[styles.progressDot, step >= item && styles.progressDotActive]}>
              <Text style={[styles.progressDotText, step >= item && styles.progressDotTextActive]}>
                {item}
              </Text>
            </View>
            {item < 3 && (
              <View style={[styles.progressLine, step > item && styles.progressLineActive]} />
            )}
          </View>
        ))}
      </View>
    );
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
          keyboardShouldPersistTaps="handled" 
        >
          <View style={styles.headerContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="person-add" size={36} color="#F27A21" />
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to get started and book your sessions!</Text>
          </View>

          {renderProgressBar()}

          <Animated.View 
            style={{ 
              opacity: fadeAnim, 
              transform: [{ translateX: slideAnim }],
              flex: 1 
            }}
          >
            <View style={styles.formContainer}>
              
              {/* STEP 1: PERSONAL DETAILS */}
              {step === 1 && (
                <View>
                  <Text style={styles.sectionHeader}>Personal Details</Text>
                  <InputField icon="person-outline" placeholder="Full Name" value={name} onChangeText={setName} />
                  <InputField icon="mail-outline" placeholder="Email Address" value={email} onChangeText={setEmail} keyboardType="email-address" />
                  <InputField icon="call-outline" placeholder="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                  <InputField icon="lock-closed-outline" placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry={true} />
                </View>
              )}

              {/* STEP 2: EXAM DETAILS */}
              {step === 2 && (
                <View>
                  <Text style={styles.sectionHeader}>Academic Info</Text>
                  <InputField icon="calendar-outline" placeholder="Date of Birth (YYYY-MM-DD)" value={dob} onChangeText={setDob} />
                  <InputField icon="school-outline" placeholder="NEET Score" value={neetScore} onChangeText={setNeetScore} keyboardType="numeric" />
                </View>
              )}

              {/* STEP 3: ADDRESS DETAILS */}
              {step === 3 && (
                <View>
                  <Text style={styles.sectionHeader}>Address Details</Text>
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
                </View>
              )}

              {/* NAVIGATION BUTTONS */}
              <View style={styles.buttonRow}>
                {step > 1 && (
                  <TouchableOpacity style={styles.backBtn} onPress={handleBack} disabled={isLoading}>
                    <Ionicons name="arrow-back" size={24} color="#F27A21" />
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity 
                  style={[styles.registerBtn, isLoading && styles.registerBtnDisabled, step > 1 && { flex: 1, marginLeft: 15 }]} 
                  onPress={step === 3 ? handleRegister : handleNext}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.registerBtnText}>{step === 3 ? "Sign Up" : "Next Step"}</Text>
                  )}
                </TouchableOpacity>
              </View>

            </View>

            {step === 1 && (
              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation?.navigate('Login')}>
                  <Text style={styles.loginLink}>Log In</Text>
                </TouchableOpacity>
              </View>
            )}

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContainer: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  headerContainer: { alignItems: 'center', marginBottom: 20, marginTop: 40 },
  logoCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', paddingHorizontal: 20 },
  
  // Progress Bar Styles
  progressContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  progressDot: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' },
  progressDotActive: { backgroundColor: '#F27A21' },
  progressDotText: { color: '#9CA3AF', fontSize: 14, fontWeight: 'bold' },
  progressDotTextActive: { color: '#FFFFFF' },
  progressLine: { width: 40, height: 3, backgroundColor: '#E5E7EB', marginHorizontal: 5 },
  progressLineActive: { backgroundColor: '#F27A21' },

  formContainer: { marginBottom: 20 },
  sectionHeader: { fontSize: 14, fontWeight: 'bold', color: '#F27A21', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 15, marginLeft: 4 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, marginBottom: 16, paddingHorizontal: 15, height: 55 },
  inputFocused: { borderColor: '#F27A21', backgroundColor: '#FFFFFF', shadowColor: '#F27A21', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 1 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#111827', fontSize: 16, height: '100%' },
  row: { flexDirection: 'row' },
  flex1: { flex: 1 },
  
  // Button Styles
  buttonRow: { flexDirection: 'row', alignItems: 'center', marginTop: 15 },
  backBtn: { height: 55, width: 55, borderRadius: 12, borderWidth: 1, borderColor: '#F27A21', justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
  registerBtn: { flex: 1, backgroundColor: '#F27A21', height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', shadowColor: '#F27A21', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 4 },
  registerBtnDisabled: { backgroundColor: '#FCA5A5', elevation: 0, shadowOpacity: 0 }, // Adjust disabled color as needed
  registerBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
  
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  footerText: { color: '#6B7280', fontSize: 14 },
  loginLink: { color: '#F27A21', fontSize: 14, fontWeight: 'bold' },
});