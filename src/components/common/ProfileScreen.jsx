import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Image, Pressable,
  ScrollView, SafeAreaView, Platform,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

// 👉 DONO API IMPORT KAREIN
import { getUserProfile } from '../../services/authAPI';
import { changeRole, logout } from '../../redux/authSlice';
import { getConsultantProfile } from '../../services/consultantAPI';
import CustomHeader from './CustomHeader';


// ==========================================
// Reusable Animated Menu Item Component
// ==========================================
const MenuItem = ({ icon, title, subtitle, color, onPress, isDanger }) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        {
          transform: [{ scale: pressed ? 0.98 : 1 }],
          backgroundColor: pressed ? '#f0f0f0' : '#fff',
        }
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: isDanger ? '#fee2e2' : `${color}20` }]}>
        <Ionicons name={icon} size={22} color={isDanger ? '#ef4444' : color} />
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={[styles.menuTitle, isDanger && { color: '#ef4444' }]}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward-outline" size={20} color="#ccc" />
    </Pressable>
  );
};

// ==========================================
// Main Profile Component
// ==========================================
export default function ProfileScreen() {

  const dispatch = useDispatch();
  const navigation = useNavigation();

  // 👉 Redux setup se role nikalna (Data fetch hone se pehle role pata hona chahiye)
  const role = useSelector((state) => state.auth.role);

  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 👉 2. Fetch data on component mount ya role change hone par
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        let response;

        // Role ke according alag-alag API call hogi
        if (role === 'Consultant') {
          response = await getConsultantProfile();
        } else {
          response = await getUserProfile();
        }

        // Backend response format ke hisaab se data nikalna
        // (Ye safe approach hai agar backend user/consultant/data kisi me bhi bheje)
        const profileInfo = response?.user || response?.consultant || response?.data || response;

        if (profileInfo) {
          setUserData(profileInfo);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [role]); // Array me role pass kiya, taaki agar role switch ho to naya data aaye

  function onLogout() {
    Alert.alert(
      "Confirm Logout",
      "Are You Sure?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
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

  // Role badalne ka function (Testing ke liye)
  const handleSwitchRole = () => {
    const newRole = role === "User" ? "Consultant" : "User";
    dispatch(changeRole(newRole));
  };

  // Theme Setup (Redux role ke hisaab se)
  const theme = {
    primary: role === 'Consultant' ? '#10B981' : '#3B82F6',
    background: role === 'Consultant' ? '#ECFDF5' : '#EFF6FF',
  };

  return (

    <>
    <CustomHeader routeName="Profile" />

    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>

          {/* --- 1. PROFILE AVATAR SECTION (API Integrated) --- */}
          <View style={styles.profileSection}>
            <View style={styles.imageContainer}>
              <Image
                source={{
                  uri:
                  userData?.profilePicture ||
                  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
                }}
                style={styles.profileImage}
              />
            </View>

            <View style={styles.infoContainer}>
              {/* Name & Email mapping */}
              <Text style={styles.userName} numberOfLines={1}>
                {isLoading ? "Loading..." : userData?.name || "No Name"}
              </Text>
              <Text style={styles.userEmail} numberOfLines={1}>
                {isLoading ? "Please wait" : userData?.email || "No Email"}
              </Text>

              {userData?.phone && (
                <Text style={[styles.userEmail, { marginTop: -5, fontSize: 12 }]}>
                  📞 +91 {userData.phone}
                </Text>
              )}

              <Pressable
                onPress={() => navigation.navigate("EditProfile")}
                style={({ pressed }) => [
                  styles.roleTag,
                  { backgroundColor: theme.background, transform: [{ scale: pressed ? 0.95 : 1 }] }
                ]}
              >
                <Text style={[styles.roleText, { color: theme.primary }]}>
                  Edit Profile
                </Text>
              </Pressable>
            </View>
          </View>

          {/* --- 2. MENU SECTION --- */}
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>General</Text>


            {/* <MenuItem
              icon="home-outline"
              title="Home"
              color={theme.primary}
              onPress={() => console.log('Home pressed')}
              /> */}

            {/* <Text style={styles.sectionTitle}>
              {role === 'counselor' ? 'Professional Tools' : 'Services'}
              </Text> */}
            {role === 'Consultant' ? (
              <>
                <MenuItem
                  icon="person-outline"
                  title="Profile Details"
                  color={theme.primary}
                  onPress={() => navigation.navigate("ConsultProfileDetails")}
                  />

                <MenuItem
                  icon="people-outline"
                  title="Create Kyc"
                  subtitle="View and manage kyc"
                  color={theme.primary}
                  onPress={() => navigation.navigate('KycScreen')}
                  />
                <MenuItem
                  icon="wallet-outline"
                  title="KYC Details"
                  color={theme.primary}
                  onPress={() =>navigation.navigate("KycDetails")}
                />
              </>
            ) : (
              <>
                <MenuItem
                  icon="person-outline"
                  title="Profile Details"
                  color={theme.primary}
                  onPress={() => navigation.navigate("ProfileDetail")}
                />

                <MenuItem
                  icon="chatbubbles-outline"
                  title="Chat with Counselor"
                  subtitle="Start a private session"
                  color={theme.primary}
                  onPress={() => console.log('Chat pressed')}
                  />
                <MenuItem
                  icon="cart-outline"
                  title="Cart itmes"
                  color={theme.primary}
                  onPress={() => navigation.navigate("CartScreen")}
                />
              </>
            )}

            <Text style={styles.sectionTitle}>Company</Text>

            <MenuItem
              icon="document-text"
              title="Legal Documents"
              color={theme.primary}
              onPress={()=>navigation.navigate("LegalScreen")}
            />

            <Text style={styles.sectionTitle}>Account</Text>

            <MenuItem
              icon="log-out-outline"
              title="Logout"
              isDanger={true}
              onPress={onLogout}
            />
          </View>

        </ScrollView>
      </View>
    </SafeAreaView>
</>
  );
}

// ==========================================
// Styles (Unchanged)
// ==========================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingTop: Platform.OS === 'android' ? 100 : 0,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop:Platform.OS==="android"?0:20,
    marginBottom: 0,
    paddingHorizontal: 5,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 20,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#fff',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  roleTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  menuSection: {
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
});