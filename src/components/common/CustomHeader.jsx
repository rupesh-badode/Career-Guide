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

const HeaderIconButton = ({ icon, onPress, color, badgeCount }) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        { transform: [{ scale: pressed ? 0.85 : 1 }] }
      ]}
    >
      <Ionicons name={icon} size={24} color={color} />
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

  let primaryColor = '#4F46E5';
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

  // ✨ Helper function to avoid duplicating the search bar UI 4 times
  const renderSearchBar = () => (
    <View style={styles.searchBarContainer}>
      <Ionicons name="search" size={20} color="#888" />
      <TextInput
        style={styles.searchInput}
        placeholder="Search by name..."
        placeholderTextColor="#999"
        value={searchText}
        autoFocus
        onChangeText={(text) => {
          setSearchText(text);
          onSearchChange && onSearchChange(text);
        }}
      />
      <TouchableOpacity onPress={() => toggleSearch(false)} style={{ padding: 4 }}>
        <Ionicons name="close-circle" size={22} color="#888" />
      </TouchableOpacity>
    </View>
  );

  const renderHeaderContent = () => {
    
    // 1. PROFILE SCREEN
    if (routeName === 'Profile') {
      return (
        <View style={styles.contentContainer}>
          <Text style={styles.profileHeaderTitle}>Profile & Settings</Text>
        </View>
      );
    }

    // 2. CHAT & SESSIONS SCREENS
    if (routeName === 'Chat' || routeName === 'Sessions') {
      const headerTitle = routeName === 'Chat' ? 'Messages' : 'Sessions';
      return (
        <View style={[styles.contentContainer, { justifyContent: 'space-between' }]}>
          {isSearching ? renderSearchBar() : (
            <View style={styles.leftSection}>
              <Pressable onPress={() => setProfileDropdownVisible(true)}>
                <Image source={{ uri: displayAvatar }} style={[styles.avatar, { borderColor: theme.primary }]} />
              </Pressable>
              <Text style={styles.chatHeaderTitle}>{headerTitle}</Text>
            </View>
          )}
          {!isSearching && (
            <View style={styles.rightIconsContainer}>
              <HeaderIconButton icon={theme.actionIcon} color="#333" onPress={() => toggleSearch(true)} />
              <View style={{ width: 10 }} />
              <HeaderIconButton icon="filter-outline" color="#333" onPress={() => onFilterPress && onFilterPress()} />
            </View>
          )}
        </View>
      );
    }

    // 3. APPOINTMENTS SCREEN
    if (routeName === "Appointment" || routeName === "Appoinment") {
      const headerTitle = "Appointments";
      return (
        <View style={[styles.contentContainer, { justifyContent: 'space-between' }]}>
          {isSearching ? renderSearchBar() : (
            <View style={styles.leftSection}>
              <Pressable onPress={() => setProfileDropdownVisible(true)}>
                <Image source={{ uri: displayAvatar }} style={[styles.avatar, { borderColor: theme.primary }]} />
              </Pressable>
              <Text style={styles.chatHeaderTitle}>{headerTitle}</Text>
            </View>
          )}
          {!isSearching && (
            <View style={styles.rightIconsContainer}>
              <HeaderIconButton icon={theme.actionIcon} color="#333" onPress={() => toggleSearch(true)} />
              <View style={{ width: 10 }} />
              <HeaderIconButton icon="filter-outline" color="#333" onPress={() => onFilterPress && onFilterPress()} />
            </View>
          )}
        </View>
      );
    }

    // 4. COUNSELLOR CHAT SCREEN
    if (routeName === "CounsellorChat") {
      return (
        <View style={[styles.contentContainer, { justifyContent: 'space-between' }]}>
          {isSearching ? renderSearchBar() : (
            <Pressable
              style={({ pressed }) => [styles.leftSection, { transform: [{ scale: pressed ? 0.96 : 1 }] }]}
              onPress={() => setProfileDropdownVisible(true)}
            >
              <Image source={{ uri: displayAvatar }} style={[styles.avatar, { borderColor: theme.primary }]} />
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
               <HeaderIconButton icon="search-outline" color="#333" onPress={() => toggleSearch(true)} />
               <View style={{ width: 10 }} />
               <HeaderIconButton icon={theme.actionIcon} color="#333" onPress={onActionPress} />
            </View>
          )}
        </View>
      );
    }
    // 4. COUNSELLOR CHAT SCREEN
    if (routeName === "CounsutantAppoinment") {
      return (
        <View style={[styles.contentContainer, { justifyContent: 'space-between' }]}>
          {isSearching ? renderSearchBar() : (
            <Pressable
              style={({ pressed }) => [styles.leftSection, { transform: [{ scale: pressed ? 0.96 : 1 }] }]}
              onPress={() => setProfileDropdownVisible(true)}
            >
              <Image source={{ uri: displayAvatar }} style={[styles.avatar, { borderColor: theme.primary }]} />
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
               <View style={{ width: 10 }} />
               <HeaderIconButton icon={theme.actionIcon} color="#333" onPress={onActionPress} />
            </View>
          )}
        </View>
      );
    }

    // 5. HOME & DASHBOARD (OR DEFAULT FALLBACK)
    // 👉 Note: Fixed the broken structural bugs from your original code here
    return (
      <View style={styles.contentContainer}>
        <Pressable
          style={({ pressed }) => [styles.leftSection, { transform: [{ scale: pressed ? 0.96 : 1 }] }]}
          onPress={() => setProfileDropdownVisible(true)}
        >
          <Image source={{ uri: displayAvatar }} style={[styles.avatar, { borderColor: theme.primary }]} />
          <View style={styles.textContainer}>
            <Text style={styles.greetingText}>
              {theme.greeting}
              <Text style={styles.nameText}>{displayName}</Text>
            </Text>
            <Text style={styles.subText}>{theme.subText}</Text>
          </View>
        </Pressable>

        <View style={styles.rightIconsContainer}>
          {isUser ? (
            <HeaderIconButton 
              icon="cart-outline" 
              color="#333" 
              badgeCount={cartCount} 
              onPress={() => navigation.navigate("CartScreen")} 
            />
          ) : null}
          {(isConsultant || isMentor) ? (
            <HeaderIconButton 
              icon="notifications-outline" 
              color="#333" 
              badgeCount={notificationCount} 
              onPress={onNotificationPress || (() => console.log("Notif pressed"))} 
            />
          ) : null}
          {(!isUser && !isConsultant && !isMentor) && (
             <HeaderIconButton icon={theme.actionIcon} color="#333" onPress={onActionPress} />
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={{ zIndex: 1000 }}>
      <BlurView
        intensity={90}
        tint="light"
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: insets.top,
          zIndex: 1001,
        }}
      />

      <AnimatedBlurView
        intensity={85}
        tint="light"
        style={[
          styles.blurWrapper,
          {
            paddingTop: (insets?.top || 40) + 10,
            transform: [{ translateY: translateY || 0 }]
          }
        ]}
      >
        {renderHeaderContent()}
      </AnimatedBlurView>

      <Modal transparent={true} visible={isProfileDropdownVisible} animationType="fade" onRequestClose={() => setProfileDropdownVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setProfileDropdownVisible(false)}>
          <View style={[styles.dropdownContainerLeft, { top: insets.top + 60 }]}>
            <TouchableOpacity style={styles.dropdownItem} onPress={() => handleProfileMenuSelect('profile')}>
              <Ionicons name="person-circle-outline" size={22} color="#4B5563" />
              <Text style={styles.dropdownText}>My Profile</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.dropdownItem} onPress={() => handleProfileMenuSelect('logout')}>
              <Ionicons name="log-out-outline" size={22} color="#EF4444" />
              <Text style={[styles.dropdownText, { color: '#EF4444', fontWeight: '600' }]}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  blurWrapper: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(0,0,0,0.1)' },
  contentContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 15 },
  leftSection: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, marginRight: 12 },
  textContainer: { justifyContent: 'center' },
  greetingText: { fontSize: 14, color: '#4B5563' },
  nameText: { fontSize: 16, fontWeight: '700', color: '#111827' },
  subText: { fontSize: 12, color: '#6B7280', marginTop: 2, fontWeight: '500' },
  rightIconsContainer: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.6)', justifyContent: 'center', alignItems: 'center' },
  badge: { position: 'absolute', top: -2, right: -2, backgroundColor: '#EF4444', minWidth: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#FFF' },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold', paddingHorizontal: 4 },
  profileHeaderTitle: { fontSize: 20, fontWeight: '700', color: '#111', letterSpacing: 0.5, textAlign: 'center', flex: 1 },
  chatHeaderTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  searchBarContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.05)', borderRadius: 16, paddingHorizontal: 15, paddingVertical: 10, marginRight: 10 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 16, color: '#111' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.15)' },
  dropdownContainerLeft: { position: 'absolute', left: 20, backgroundColor: '#FFFFFF', borderRadius: 16, paddingVertical: 8, width: 200, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 12 },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 },
  dropdownText: { fontSize: 15, color: '#4B5563', marginLeft: 12, fontWeight: '500' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#E5E7EB', marginVertical: 4, marginHorizontal: 16 },
});