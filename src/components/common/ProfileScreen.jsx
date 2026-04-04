import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, Image, Pressable,
  ScrollView, SafeAreaView, Platform,
  Alert, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

// 👉 TEENO API IMPORT KAREIN
import { getUserProfile } from '../../services/authAPI';
import { getConsultantProfile } from '../../services/consultantAPI';
import { getMentorProfile } from '../../services/mentorAPI'; 
import { logout } from '../../redux/authSlice'; 
import CustomHeader from './CustomHeader';

// ==========================================
// 1. Animated Menu Item Component
// ==========================================
const AnimatedMenuItem = ({ icon, title, subtitle, color, onPress, isDanger, index }) => {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100, 
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, fadeAnim, slideAnim]); // Added missing dependencies

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.menuItem,
          {
            transform: [{ scale: pressed ? 0.96 : 1 }],
            backgroundColor: pressed ? '#F9FAFB' : '#FFFFFF',
            borderColor: isDanger ? '#FEE2E2' : '#F3F4F6',
          }
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: isDanger ? '#FEF2F2' : `${color}15` }]}>
          <Ionicons name={icon} size={22} color={isDanger ? '#EF4444' : color} />
        </View>
        <View style={styles.menuTextContainer}>
          <Text style={[styles.menuTitle, isDanger && { color: '#EF4444' }]}>{title}</Text>
          {subtitle && <Text style={[styles.menuSubtitle, isDanger && { color: '#F87171' }]}>{subtitle}</Text>}
        </View>
        <Ionicons name="chevron-forward" size={20} color={isDanger ? '#FCA5A5' : '#D1D5DB'} />
      </Pressable>
    </Animated.View>
  );
};

// ==========================================
// 2. Main Profile Component
// ==========================================
export default function ProfileScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const profileFadeAnim = useRef(new Animated.Value(0)).current;
  const profileSlideAnim = useRef(new Animated.Value(-20)).current;

  const role = useSelector((state) => state.auth?.role) || 'User';

  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        let response;

        if (role === 'Consultant') {
          response = await getConsultantProfile();
        } else if (role === 'Mentor') {
          response = await getMentorProfile();
        } else {
          response = await getUserProfile();
        }

        const profileInfo = response?.user || response?.consultant || response?.mentor || response?.data || response;
        if (profileInfo) setUserData(profileInfo);

        Animated.parallel([
          Animated.timing(profileFadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.spring(profileSlideAnim, { toValue: 0, tension: 50, friction: 7, useNativeDriver: true }),
        ]).start();

      } catch (error) {
        console.error(`Error fetching ${role} profile:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [role, profileFadeAnim, profileSlideAnim]); 

  function onLogout() {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to securely log out of your account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('userToken');
              await AsyncStorage.removeItem('userData');
              dispatch(logout());
              console.log("Logout Successfully! Redirecting...");
            } catch (error) {
              console.error("Failed to LogOut:", error);
            }
          },
        },
      ]
    );
  }
  
  let primaryColor = '#F27A21'; // User: Blue
  let bgColor = '#fff7ef';

  if (role === 'Consultant') {
    primaryColor = '#F27A21'; // Consultant: Green
    bgColor = '#EFF6FF';
  } else if (role === 'Mentor') {
    primaryColor = '#F27A21'; // Consultant: Green
    bgColor = '#EFF6FF';
  }

  const theme = {
    primary: primaryColor,
    background: bgColor,
  };

  return (
    <View style={styles.mainContainer}>
      <CustomHeader routeName="Profile" />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          {/* --- 1. ANIMATED PROFILE AVATAR SECTION --- */}
          <Animated.View 
            style={[
              styles.profileCard, 
              { opacity: profileFadeAnim, transform: [{ translateY: profileSlideAnim }] }
            ]}
          >
            <View style={styles.imageContainer}>
              <Image
                source={{
                  uri: userData?.profilePicture || 
                       `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.name || 'User')}&background=${theme.primary.replace('#','')}&color=fff` ,
                }}
                style={[styles.profileImage, { borderColor: theme.primary }]}
              />
              <View style={styles.onlineDot} />
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.userName} numberOfLines={1}>
                {isLoading ? "Loading..." : userData?.name || "Welcome!"}
              </Text>
              
              <View style={styles.contactRow}>
                <Ionicons name="mail" size={14} color="#9CA3AF" />
                <Text style={styles.userEmail} numberOfLines={1}>
                  {isLoading ? "Fetching details..." : userData?.email || "No Email"}
                </Text>
              </View>

              {/* 👉 FIXED: Logic Precedence Issue that caused App Crash */}
              {(userData?.phone || userData?.mobile) ? (
                <View style={styles.contactRow}>
                  <Ionicons name="call" size={14} color="#9CA3AF" />
                  <Text style={styles.userEmail}>+91 {userData?.phone || userData?.mobile}</Text>
                </View>
              ) : null}

              <Pressable
                onPress={() => navigation.navigate("EditProfile")}
                style={({ pressed }) => [
                  styles.roleTag,
                  { backgroundColor: theme.background, transform: [{ scale: pressed ? 0.95 : 1 }] }
                ]}
              >
                <Ionicons name="pencil" size={14} color={theme.primary} />
                <Text style={[styles.roleText, { color: theme.primary }]}>
                  Edit {role} Profile
                </Text>
              </Pressable>
            </View>
          </Animated.View>

          {/* --- 2. MENU SECTION --- */}
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>General Settings</Text>

            {/* CONSULTANT MENU */}
            {role === 'Consultant' && (
              <>
                <AnimatedMenuItem index={1} icon="person" title="Profile Details" subtitle="View and edit personal info" color={theme.primary} onPress={() => navigation.navigate("ConsultProfileDetails")} />
                <AnimatedMenuItem index={2} icon="document-text" title="Create KYC" subtitle="Submit your verification docs" color={theme.primary} onPress={() => navigation.navigate('KycScreen')} />
                <AnimatedMenuItem index={3} icon="shield-checkmark" title="KYC Status" subtitle="Check your verification details" color={theme.primary} onPress={() => navigation.navigate("KycDetails")} />
              </>
            )}

            {/* MENTOR MENU */}
            {role === 'Mentor' && (
              <>
                <AnimatedMenuItem index={1} icon="person" title="Mentor Profile" subtitle="Update your mentoring details" color={theme.primary} onPress={() => navigation.navigate("MentorProfileDetails")} />
                <AnimatedMenuItem index={2} icon="calendar" title="Manage Sessions" subtitle="View and manage your schedule" color={theme.primary} onPress={() => navigation.navigate("MentorSessions")} />
              </>
            )}

            {/* USER / STUDENT MENU */}
            {role === 'User' && (
              <>
                <AnimatedMenuItem index={1} icon="person" title="Profile Details" subtitle="View your personal information" color={theme.primary} onPress={() => navigation.navigate("ProfileDetail")} />
                <AnimatedMenuItem index={2} icon="lock-closed" title="Change Password" subtitle="Update your security key" color={theme.primary} onPress={() => navigation.navigate("ChangePassword")} />
                <AnimatedMenuItem index={3} icon="chatbubbles" title="Chat with Mentor" subtitle="Continue your private sessions" color={theme.primary} onPress={() => navigation.navigate('MentorChatList')} />
                <AnimatedMenuItem index={4} icon="cart" title="Cart Items" subtitle="Manage your pending purchases" color={theme.primary} onPress={() => navigation.navigate("CartScreen")} />
              </>
            )}

            <Text style={styles.sectionTitle}>Support & About</Text>

            {/* 👉 FIXED: Adjusted Index numbers for proper staggered animation */}
            <AnimatedMenuItem index={5} icon="shield-half" title="Legal Documents" subtitle="Terms, conditions & privacy policy" color={theme.primary} onPress={() => navigation.navigate("LegalScreen")} />
            <AnimatedMenuItem index={6} icon="videocam" title="Blogs" subtitle="Read our blogs" color={theme.primary} onPress={() => navigation.navigate("Blogs")} />
            
            <Text style={styles.sectionTitle}>Account Actions</Text>

            <AnimatedMenuItem index={7} icon="log-out" title="Logout" subtitle="Sign out of your account safely" isDanger={true} onPress={onLogout} />
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ... Styles exact same as your code, they are perfect ...
const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#F9FAFB' },
  safeArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100, paddingTop: 10 },
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 20, borderRadius: 24, marginBottom: 24, borderWidth: 1, borderColor: '#F3F4F6', ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 16 }, android: { elevation: 4 } }) },
  imageContainer: { position: 'relative', marginRight: 18 },
  profileImage: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, backgroundColor: '#F3F4F6' },
  onlineDot: { position: 'absolute', bottom: 2, right: 2, width: 16, height: 16, borderRadius: 8, backgroundColor: '#10B981', borderWidth: 3, borderColor: '#FFFFFF' },
  infoContainer: { flex: 1, justifyContent: 'center' },
  userName: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 6, letterSpacing: -0.5 },
  contactRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  userEmail: { fontSize: 13, color: '#6B7280', marginLeft: 6, fontWeight: '500' },
  roleTag: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginTop: 8, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  roleText: { fontSize: 12, fontWeight: '700', marginLeft: 6 },
  menuSection: { marginTop: 0 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1.2, marginTop: 20, marginBottom: 12, marginLeft: 8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, marginBottom: 12, borderWidth: 1, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8 }, android: { elevation: 1 } }) },
  iconContainer: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  menuTextContainer: { flex: 1 },
  menuTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 2 },
  menuSubtitle: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
});