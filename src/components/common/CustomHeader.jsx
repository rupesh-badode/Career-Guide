import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Image, Pressable, Platform,
  Modal, TouchableOpacity, TextInput, LayoutAnimation, UIManager
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getUserProfile } from '../../services/authAPI';
import { getConsultantProfile } from '../../services/consultantAPI';

// Enable Android LayoutAnimations
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
          <Text style={styles.badgeText}>{badgeCount}</Text>
        </View>
      ) : null}
    </Pressable>
  );
};

export default function CustomHeader({
  userName = "rahul",
  profilePic = 'https://i.pravatar.cc/150?img=11',
  notificationCount = 2,
  routeName,
  onProfilePress,
  onLogoutPress, 
  onBackPress,
  onNotificationPress,
  onActionPress,
  onSearchChange,
  onFilterPress,
  onSortSelect
}) {

  const insets = useSafeAreaInsets();
  const role = useSelector((state) => state.auth.role);
  
  const [isFilterDropdownVisible, setFilterDropdownVisible] = useState(false);
  const [isProfileDropdownVisible, setProfileDropdownVisible] = useState(false);
  
  const [searchText, setSearchText] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [userData, setUserData] = useState(null);

  const isCounselor = role === 'Consultant';
  const theme = {
    primary: isCounselor ? '#10B981' : '#4F46E5',
    greeting: isCounselor ? 'Hello, Dr. ' : 'Hi, ',
    subText: isCounselor ? 'Ready for sessions?' : 'How are you feeling?',
    actionIcon: isCounselor ? 'calendar-outline' : 'search-outline',
  };

  useEffect(() => {
    fetchProfile();
  }, [role]);

  async function fetchProfile() {
    try {
      let res = isCounselor ? await getConsultantProfile() : await getUserProfile();
      const profileInfo = res?.data || res?.user || res?.consultant || res;
      if (profileInfo) setUserData(profileInfo);
    } catch (err) {
      console.log("Header Fetch Error:", err);
    }
  }

  const toggleSearch = (state) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsSearching(state);
    if (!state) {
      setSearchText('');
      onSearchChange && onSearchChange('');
    }
  };

  const handleFilterSelect = (action) => {
    setFilterDropdownVisible(false);
    if (onSortSelect) onSortSelect(action);
  };

  const handleProfileMenuSelect = (action) => {
    setProfileDropdownVisible(false);
    if (action === 'profile' && onProfilePress) {
      onProfilePress(); 
    } else if (action === 'logout' && onLogoutPress) {
      onLogoutPress(); 
    }
  };

  const displayAvatar = userData?.profilePicture || profilePic;
  const displayName = userData?.name || userName;

  const renderHeaderContent = () => {
    if (routeName === 'Profile') {
      return (
        <View style={styles.contentContainer}>
          <Text style={styles.profileHeaderTitle}>Profile & Settings</Text>
        </View>
      );
    }

    if (routeName === 'Chat') {
      return (
        <View style={[styles.contentContainer, { justifyContent: 'space-between' }]}>
          {isSearching ? (
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
              <TouchableOpacity onPress={() => toggleSearch(false)}>
                <Ionicons name="close-circle" size={22} color="#888" />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.leftSection}>
                <Pressable onPress={() => setProfileDropdownVisible(true)}>
                  <Image source={{ uri: displayAvatar }} style={[styles.avatar, { borderColor: theme.primary }]} />
                </Pressable>
                <Text style={styles.chatHeaderTitle}>Messages</Text>
              </View>

              <View style={styles.rightIconsContainer}>
                <HeaderIconButton icon={theme.actionIcon} color="#333" onPress={() => toggleSearch(true)} />
                <View style={{ width: 10 }} />
                <HeaderIconButton 
                  icon="filter-outline" 
                  color="#333" 
                  // badgeCount={notificationCount} 
                  onPress={onFilterPress} 
                />
              </View>
            </>
          )}
        </View>
      );
    }

    // 👉 NAYA: Specially for 'Home' route - bina search/action icon ke
    if (routeName === 'Home') {
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
              <Text style={styles.subText}>{theme.subText} <Ionicons name="chevron-down" size={16} color="#6B7280" style={{ marginLeft: 0}} /></Text>
            </View>
          </Pressable>

          <View style={styles.rightIconsContainer}>
            {/* Search/Action Icon Hata Diya Gaya Hai */}
            <HeaderIconButton icon="cart-outline" color="#333" badgeCount={notificationCount} onPress={onNotificationPress} />
          </View>
        </View>
      );
    }

    // Default Fallback (Baaki kisi screen ke liye jahan icon chahiye)
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
            <Text style={styles.subText}>{theme.subText} <Ionicons name="chevron-down" size={16} color="#6B7280" style={{ marginLeft: 0}} /></Text>
          </View>
        </Pressable>

        <View style={styles.rightIconsContainer}>
          <HeaderIconButton icon={theme.actionIcon} color="#333" onPress={onActionPress} />
          <View style={{ width: 10 }} />
          <HeaderIconButton icon="cart-outline" color="#333" badgeCount={notificationCount} onPress={onNotificationPress} />
        </View>
      </View>
    );
  };

  return (
    <>
      <BlurView intensity={85} tint="light" style={[styles.blurWrapper, { paddingTop: insets.top + 10 }]}>
        {renderHeaderContent()}
      </BlurView>

      {/* RIGHT SIDE: Filter Dropdown */}
      <Modal
        transparent={true}
        visible={isFilterDropdownVisible}
        animationType="fade"
        onRequestClose={() => setFilterDropdownVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setFilterDropdownVisible(false)}>
          <View style={[styles.dropdownContainerRight, { top: insets.top + 60 }]}>
            <TouchableOpacity style={styles.dropdownItem} onPress={() => handleFilterSelect('asc')}>
              <Ionicons name="arrow-up-outline" size={20} color="#4B5563" />
              <Text style={styles.dropdownText}>Sort Ascending</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dropdownItem} onPress={() => handleFilterSelect('desc')}>
              <Ionicons name="arrow-down-outline" size={20} color="#4B5563" />
              <Text style={styles.dropdownText}>Sort Descending</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.dropdownItem} onPress={() => handleFilterSelect('unread')}>
              <Ionicons name="mail-unread-outline" size={20} color="#4F46E5" />
              <Text style={[styles.dropdownText, { color: '#4F46E5', fontWeight: '600' }]}>Unread Messages</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* LEFT SIDE: Profile Dropdown */}
      <Modal
        transparent={true}
        visible={isProfileDropdownVisible}
        animationType="fade"
        onRequestClose={() => setProfileDropdownVisible(false)}
      >
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
    </>
  );
}

const styles = StyleSheet.create({
  blurWrapper: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  contentContainer: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingBottom: 15,
  },
  leftSection: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, marginRight: 12 },
  textContainer: { justifyContent: 'center' },
  greetingText: { fontSize: 14, color: '#4B5563' },
  nameText: { fontSize: 16, fontWeight: '700', color: '#111827' },
  subText: { fontSize: 12, color: '#6B7280', marginTop: 2, fontWeight: '500' },
  rightIconsContainer: { flexDirection: 'row', alignItems: 'center' },
  iconButton: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.6)',
    justifyContent: 'center', alignItems: 'center',
  },
  badge: {
    position: 'absolute', top: -2, right: -2, backgroundColor: '#EF4444',
    minWidth: 18, height: 18, borderRadius: 9, justifyContent: 'center',
    alignItems: 'center', borderWidth: 1.5, borderColor: '#FFF',
  },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold', paddingHorizontal: 4 },
  profileHeaderTitle: { fontSize: 20, fontWeight: '700', color: '#111', letterSpacing: 0.5, textAlign: 'center', flex: 1 },
  chatHeaderTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  searchBarContainer: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: 16,
    paddingHorizontal: 15, paddingVertical: 10,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 16, color: '#111' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.15)' },
  dropdownContainerRight: {
    position: 'absolute', right: 20, backgroundColor: '#FFFFFF',
    borderRadius: 16, paddingVertical: 8, width: 220, elevation: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1, shadowRadius: 12,
  },
  dropdownContainerLeft: {
    position: 'absolute', left: 20, backgroundColor: '#FFFFFF',
    borderRadius: 16, paddingVertical: 8, width: 200, elevation: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1, shadowRadius: 12,
  },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 },
  dropdownText: { fontSize: 15, color: '#4B5563', marginLeft: 12, fontWeight: '500' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#E5E7EB', marginVertical: 4, marginHorizontal: 16 },
});