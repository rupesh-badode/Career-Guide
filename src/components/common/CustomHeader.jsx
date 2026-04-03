import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Image, Pressable, Platform,
  Modal, TouchableOpacity, TextInput, LayoutAnimation, UIManager,
  Animated, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getUserProfile } from '../../services/authAPI';
import { getConsultantProfile } from '../../services/consultantAPI';
import { getMentorProfile } from '../../services/mentorAPI';
import { getCart } from '../../services/user';
import { logout } from '../../redux/authSlice';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ✨ Premium Icon Button with Shadow & Glow
const HeaderIconButton = ({ icon, onPress, color, badgeCount, isPremium }) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        isPremium && styles.premiumIconButton, // Amber specific styling
        { transform: [{ scale: pressed ? 0.9 : 1 }] }
      ]}
    >
      <Ionicons name={icon} size={22} color={isPremium ? '#FFFFFF' : color} />
      {badgeCount > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeCount > 99 ? '99+' : badgeCount}</Text>
        </View>
      ) : null}
    </Pressable>
  );
};

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export default function CustomHeader({
  userName = "Guest",
  profilePic = 'https://i.pravatar.cc/150?img=11',
  notificationCount = 0,
  routeName,
  onProfilePress,
  onLogoutPress,
  onBackPress,
  onNotificationPress,
  onActionPress,
  onSearchChange,
  onFilterPress,
  onSortSelect,
  translateY,
  headerOpacity
}) {

  const insets = useSafeAreaInsets();
  const role = useSelector((state) => state.auth.role) || 'User';
  const isConsultant = role === 'Consultant';
  const isMentor = role === 'Mentor';
  const isUser = role === 'User';

  const [isProfileDropdownVisible, setProfileDropdownVisible] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const isFocused = useIsFocused();
  const [searchText, setSearchText] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [userData, setUserData] = useState(null);

  const navigation = useNavigation();
  const dispatch = useDispatch();

  let primaryColor = '#F59E0B'; // Your Amber
  let greetingText = 'Hi, ';
  let subTextMsg = 'How are you feeling?';
  let actionIcn = 'search-outline';

  if (isConsultant) {
    primaryColor = '#10B981';
    greetingText = 'Hello, Expert ';
    subTextMsg = 'Ready for sessions?';
    actionIcn = 'calendar-outline';
  } else if (isMentor) {
    primaryColor = '#8B5CF6';
    greetingText = 'Welcome,';
    subTextMsg = 'Check your upcoming classes';
    actionIcn = 'calendar-outline';
  }

  const theme = {
    primary: primaryColor,
    greeting: greetingText,
    subText: subTextMsg,
    actionIcon: actionIcn,
  };

  useEffect(() => {
    if (isFocused && isUser) {
      fetchCartCount();
    }
  }, [isFocused, isUser]);

  const fetchCartCount = async () => {
    try {
      const res = await getCart();
      if (res?.data?.items) {
        setCartCount(res.data.items.length);
      }
    } catch (err) {
      console.log("Header cart fetch error", err);
    }
  };

  const handleLogoutClick = () => {
    setProfileDropdownVisible(false);
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out?",
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
            } catch (error) {
              console.error("Failed to LogOut:", error);
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    async function fetchProfile() {
      try {
        let res;
        if (isConsultant) {
          res = await getConsultantProfile();
        } else if (isMentor) {
          res = await getMentorProfile();
        } else {
          res = await getUserProfile();
        }
        const profileInfo = res?.data || res?.user || res?.consultant || res?.mentor || res;
        if (profileInfo) setUserData(profileInfo);
      } catch (err) {
        console.log("Header Fetch Error:", err);
      }
    }
    if (isFocused) {
      fetchProfile();
    }
  }, [isFocused, role]);

  const toggleSearch = (state) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsSearching(state);
    if (!state) {
      setSearchText('');
      onSearchChange && onSearchChange('');
    }
  };

  const handleProfileMenuSelect = (action) => {
    setProfileDropdownVisible(false);
    if (action === 'profile') {
      onProfilePress ? onProfilePress() : navigation.navigate("Profile");
    } else if (action === 'logout') {
      onLogoutPress ? onLogoutPress() : handleLogoutClick();
    }
  };

  const displayAvatar = userData?.profilePicture || profilePic;
  const displayName = userData?.name || userName;

  // ✨ Premium Search Bar Design
  const renderSearchBar = () => (
    <View style={styles.searchBarContainer}>
      <Ionicons name="search" size={20} color="#F59E0B" />
      <TextInput
        style={styles.searchInput}
        placeholder="Search experts, mentors..."
        placeholderTextColor="#9CA3AF"
        value={searchText}
        autoFocus
        onChangeText={(text) => {
          setSearchText(text);
          onSearchChange && onSearchChange(text);
        }}
      />
      <TouchableOpacity onPress={() => toggleSearch(false)} style={styles.closeSearchBtn}>
        <Ionicons name="close-circle" size={20} color="#9CA3AF" />
      </TouchableOpacity>
    </View>
  );

  const renderHeaderContent = () => {
    
    // 1. PROFILE SCREEN
    if (routeName === 'Profile') {
      return (
        <View style={[styles.contentContainer, { justifyContent: 'center' }]}>
          <Text style={styles.profileHeaderTitle}>Profile & Settings</Text>
        </View>
      );
    }

    // 2. CHAT / SESSIONS / APPOINTMENTS
    if (routeName === 'Chat' || routeName === 'Sessions' || routeName === 'Appointment' || routeName === 'Appoinment') {
      const headerTitle = routeName === 'Chat' ? 'Messages' : routeName === 'Sessions' ? 'Sessions' : 'Appointments';
      return (
        <View style={[styles.contentContainer, { justifyContent: 'space-between' }]}>
          {isSearching ? renderSearchBar() : (
            <View style={styles.leftSection}>
              <Pressable onPress={() => setProfileDropdownVisible(true)}>
                <View style={styles.avatarRing}>
                  <Image source={{ uri: displayAvatar }} style={styles.avatar} />
                </View>
              </Pressable>
              <Text style={styles.chatHeaderTitle}>{headerTitle}</Text>
            </View>
          )}
          {!isSearching && (
            <View style={styles.rightIconsContainer}>
              <HeaderIconButton icon={theme.actionIcon} color="#4B5563" onPress={() => toggleSearch(true)} />
              <HeaderIconButton icon="filter" color="#4B5563" onPress={() => onFilterPress && onFilterPress()} />
            </View>
          )}


        </View>
      );
    }

    // 3. COUNSELLOR CHAT SCREEN
    if (routeName === "CounsellorChat" || routeName === "CounsutantAppoinment") {
      return (
        <View style={[styles.contentContainer, { justifyContent: 'space-between' }]}>
          {isSearching ? renderSearchBar() : (
            <Pressable
              style={({ pressed }) => [styles.leftSection, { transform: [{ scale: pressed ? 0.96 : 1 }] }]}
              onPress={() => setProfileDropdownVisible(true)}
            >
              <View style={styles.avatarRing}>
                <Image source={{ uri: displayAvatar }} style={styles.avatar} />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.greetingText}>
                  {theme.greeting}
                  <Text style={styles.nameText}>{displayName}</Text>
                </Text>
                <Text style={styles.subText}>{theme.subText}</Text>
              </View>
            </Pressable>
          )}

          {!isSearching && (
            <View style={styles.rightIconsContainer}>
               {routeName === "CounsellorChat" && (
                 <HeaderIconButton icon="search-outline" color="#4B5563" onPress={() => toggleSearch(true)} />
               )}
               <HeaderIconButton icon={theme.actionIcon} color="#4B5563" onPress={onActionPress} />
            </View>
          )}
        </View>
      );
    }
    

    if (routeName === "MentorChat") {
      return (
        <View style={[styles.contentContainer, { justifyContent: 'space-between' }]}>
          {isSearching ? renderSearchBar() : (
            <Pressable
              style={({ pressed }) => [styles.leftSection, { transform: [{ scale: pressed ? 0.96 : 1 }] }]}
              onPress={() => setProfileDropdownVisible(true)}
            >
              <View style={styles.avatarRing}>
                <Image source={{ uri: displayAvatar }} style={styles.avatar} />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.greetingText}>
                  {theme.greeting}
                  <Text style={styles.nameText}>{displayName}</Text>
                </Text>
                <Text style={styles.subText}>{theme.subText}</Text>
              </View>
            </Pressable>
          )}

          {!isSearching && (
            <View style={styles.rightIconsContainer}>
               {routeName === "MentorChat" && (
                 <HeaderIconButton icon="search-outline" color="#4B5563" onPress={() => toggleSearch(true)} />
               )}
               {/* <HeaderIconButton icon={theme.actionIcon} color="#4B5563" onPress={onActionPress} /> */}
            </View>
          )}
        </View>
      );
    }


    // 4. HOME & DASHBOARD (OR DEFAULT FALLBACK)
    return (
      <View style={styles.contentContainer}>
        {/* Left Profile Section */}
        <Pressable
          style={({ pressed }) => [styles.leftSection, { transform: [{ scale: pressed ? 0.96 : 1 }] }]}
          onPress={() => setProfileDropdownVisible(true)}
        >
          <View style={styles.avatarRing}>
            <Image source={{ uri: displayAvatar }} style={styles.avatar} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.greetingText}>
              {theme.greeting}
              <Text style={styles.nameText}>{displayName}</Text>
            </Text>
            <Text style={styles.subText}>{theme.subText}</Text>
          </View>
        </Pressable>

        {/* Right Icons Section */}
        <View style={styles.rightIconsContainer}>
          {isUser && (
            <HeaderIconButton 
              icon="cart" 
              color="#4B5563" 
              badgeCount={cartCount} 
              onPress={() => navigation.navigate("CartScreen")} 
            />
          )}
          
          <HeaderIconButton 
            icon="wallet" 
            color="#FFFFFF" 
            isPremium={true} 
            badgeCount={notificationCount} 
            onPress={onNotificationPress || (() => console.log("Wallet pressed"))} 
          />
          
          {(!isUser && !isConsultant && !isMentor) && (
             <HeaderIconButton icon={theme.actionIcon} color="#4B5563" onPress={onActionPress} />
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={{ zIndex: 1000 }}>
      {/* Background Blur layer */}
      <BlurView
        intensity={95}
        tint="light"
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: insets.top,
          zIndex: 1001,
        }}
      />

      {/* Main Header Container with Drop Shadow */}
      <AnimatedBlurView
        intensity={90}
        tint="light"
        style={[
          styles.blurWrapper,
          {
            paddingTop: (insets?.top || 40) + 12, // slightly more padding
            transform: [{ translateY: translateY || 0 }]
          }
        ]}
      >
        {renderHeaderContent()}
      </AnimatedBlurView>

      {/* Profile Modal */}
      <Modal transparent={true} visible={isProfileDropdownVisible} animationType="fade" onRequestClose={() => setProfileDropdownVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setProfileDropdownVisible(false)}>
          <View style={[styles.dropdownContainerLeft, { top: insets.top + 65 }]}>
            <TouchableOpacity style={styles.dropdownItem} onPress={() => handleProfileMenuSelect('profile')}>
              <View style={styles.dropdownIconWrapper}>
                 <Ionicons name="person" size={18} color="#F59E0B" />
              </View>
              <Text style={styles.dropdownText}>My Profile</Text>
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity style={styles.dropdownItem} onPress={() => handleProfileMenuSelect('logout')}>
              <View style={[styles.dropdownIconWrapper, { backgroundColor: '#FEE2E2' }]}>
                 <Ionicons name="log-out" size={18} color="#EF4444" />
              </View>
              <Text style={[styles.dropdownText, { color: '#EF4444', fontWeight: '700' }]}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  blurWrapper: { 
    // Tagda Bottom Shadow for Header
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderBottomWidth: 0, 
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 10 },
      android: { elevation: 8 },
      web: { boxShadow: '0px 6px 15px rgba(0,0,0,0.06)' }
    })
  },
  contentContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingBottom: 16 
  },
  
  // Left Side / Profile
  leftSection: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatarRing: {
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    padding: 2, 
    backgroundColor: '#FFFFFF', // inner white border
    borderWidth: 2, 
    borderColor: '#F59E0B', // Amber outer ring
    marginRight: 12,
    // Avatar Shadow
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  avatar: { width: '100%', height: '100%', borderRadius: 20 },
  textContainer: { justifyContent: 'center' },
  greetingText: { fontSize: 13, color: '#6B7280', letterSpacing: 0.2 },
  nameText: { fontSize: 16, fontWeight: '800', color: '#111827', letterSpacing: -0.2 },
  subText: { fontSize: 12, color: '#9CA3AF', marginTop: 2, fontWeight: '600' },
  
  // Right Side / Icons
  rightIconsContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconButton: { 
    width: 42, 
    height: 42, 
    borderRadius: 21, 
    backgroundColor: '#F3F4F6', // Light grey for standard buttons
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  premiumIconButton: {
    backgroundColor: '#F59E0B', // Amber color for primary action (Notification)
    borderWidth: 0,
    // Amber Glow Shadow
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  badge: { 
    position: 'absolute', 
    top: -4, 
    right: -4, 
    backgroundColor: '#EF4444', 
    minWidth: 20, 
    height: 20, 
    borderRadius: 10, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 2, 
    borderColor: '#FFF' 
  },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: '900', paddingHorizontal: 4 },
  
  // Typography for alternate screens
  profileHeaderTitle: { fontSize: 20, fontWeight: '800', color: '#111827', letterSpacing: 0.5 },
  chatHeaderTitle: { fontSize: 20, fontWeight: '800', color: '#111827', marginLeft: 4 },
  
  // Search Bar
  searchBarContainer: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFFBEB', // Very light amber tint
    borderRadius: 20, 
    paddingHorizontal: 16, 
    height: 44,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginRight: 10,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#111827', fontWeight: '500' },
  closeSearchBtn: { padding: 4 },
  
  // Modal Dropdown
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' },
  dropdownContainerLeft: { 
    position: 'absolute', 
    left: 20, 
    backgroundColor: '#FFFFFF', 
    borderRadius: 20, 
    paddingVertical: 10, 
    width: 220, 
    // Dropdown Shadow
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 10 }, 
    shadowOpacity: 0.15, 
    shadowRadius: 20,
    elevation: 10,
  },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 },
  dropdownIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFFBEB', // Light amber background for icon
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownText: { fontSize: 15, color: '#374151', marginLeft: 14, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 4, marginHorizontal: 16 },
});