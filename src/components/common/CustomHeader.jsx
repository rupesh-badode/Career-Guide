import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, Image, Pressable, Platform, SafeAreaView,
  Modal,
  TouchableOpacity,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// 👉 1. REDUX SE HOOK IMPORT KAREIN
import { useSelector } from 'react-redux';

import { getUserProfile } from '../../services/authAPI';
import { getConsultantProfile } from '../../services/consultantAPI';

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
  // 👉 role prop yahan se hata diya hai kyunki ab Redux handle karega
  userName = "rahul",
  profilePic = 'https://i.pravatar.cc/150?img=11',
  notificationCount = 2,
  routeName,
  onProfilePress,
  onBackPress,
  onNotificationPress,
  onActionPress,
  onSearchChange
}) {

  // 👉 2. REDUX STATE SE ROLE NIKALEIN
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const role = useSelector((state) => state.auth.role);
  const [searchText, setSearchText] = useState('');
  const [isSearching, setIsSearching] = useState(false); // 👉 Search mode toggle
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [rawData, setRawData] = useState([]);

  const [userData, setUserData] = useState(null);
  const isCounselor = role === 'Consultant';
  const theme = {
    primary: isCounselor ? '#10B981' : '#3B82F6',
    greeting: isCounselor ? 'Hello,Dr.' : 'Hi, ',
    subText: isCounselor ? 'Ready for sessions?' : 'How are you feeling?',
    actionIcon: isCounselor ? 'calendar-outline' : 'search-outline',
  };


  const handleOptionSelect = (action) => {
  setDropdownVisible(false);
  if (onSortSelect) {
    onSortSelect(action); // 'asc', 'desc', ya 'unread' Parent screen ko bhej dega
  }
};

  const processedData = useMemo(() => {
    let filtered = [...rawData];

    // 1. Search Filter (Naam ke hisaab se)
    if (searchQuery) {
      filtered = filtered.filter(item => {
        const consultantName = item?.consultantId?.name || '';
        return consultantName.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }
    // 2. Dropdown Filters
    if (filterType === 'unread') {
      // Logic for unread (agar aapke data mein koi isRead/unread flag ho)
      // filtered = filtered.filter(item => item.hasUnreadMessages === true);
    } else if (filterType === 'asc') {
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (filterType === 'desc') {
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    return filtered;
  }, [rawData, searchQuery, filterType]);

  

  useEffect(() => {
    fetchProfile();
  }, [role]);

  async function fetchProfile() {
    try {
      let res;

      if (isCounselor) {
        res = await getConsultantProfile();
      } else {
        res = await getUserProfile();
      }

      const profileInfo = res?.data || res?.user || res?.consultant || res;

      if (profileInfo) {
        setUserData(profileInfo);
      }
    } catch (err) {
      console.log("Header Fetch Error:", err);
    }
  }

  const displayAvatar = userData?.profilePicture || profilePic;
  const displayName = userData?.name || userName;

  if (routeName === 'Profile') {
    return (
      <SafeAreaView style={{ backgroundColor: '#fff' }}>
        <View style={styles.profileHeaderContainer}>
          <Text style={styles.profileHeaderTitle}>Profile & Settings</Text>
          <View style={styles.sideSpace} />
        </View>
      </SafeAreaView>
    );
  }

  if (routeName === "Chat") {
    return (
      <SafeAreaView style={{ backgroundColor: '#fff' }}>
        <View style={styles.chatHeaderContainer}>

          {/* 👉 CONDITION: Agar Search on hai toh Text input dikhao, warna normal header */}
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
                  onSearchChange && onSearchChange(text); // Parent ko text bhejo
                }}
              />
              <TouchableOpacity onPress={() => {
                setIsSearching(false);
                setSearchText('');
                onSearchChange && onSearchChange(''); // Clear search
              }}>
                <Ionicons name="close-circle" size={22} color="#888" />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Pressable onPress={onProfilePress}>
                <Image source={{ uri: displayAvatar }} style={[styles.avatar, { borderColor: theme.primary }]} />
              </Pressable>

              <Text style={styles.chatHeaderTitle}>Messages</Text>

              <View style={styles.rightIconsContainer}>
                <View style={styles.rightSection}>
                  {/* 👉 Search Icon click par input open karo */}
                  <HeaderIconButton icon={theme.actionIcon} color="#333" onPress={() => setIsSearching(true)} />
                  <View style={{ width: 10 }} />
                  <HeaderIconButton icon="filter-outline" color="#333" badgeCount={notificationCount} onPress={() => setDropdownVisible(true)} />
                </View>
              </View>
            </>
          )}

        </View>
        <View style={styles.rightIconsContainer}>
          {/* Dropdown Modal */}
          <Modal
            transparent={true}
            visible={isDropdownVisible}
            animationType="fade"
            onRequestClose={() => setDropdownVisible(false)} // Android back button handle
          >
            {/* Background overlay click karne par close ho jayega */}
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setDropdownVisible(false)}
            >
              <View style={styles.dropdownContainer}>

                {/* Sort Ascending */}
                <TouchableOpacity style={styles.dropdownItem} onPress={() => handleOptionSelect('asc')}>
                  <Ionicons name="arrow-up-outline" size={20} color="#4B5563" />
                  <Text style={styles.dropdownText}>Sort Ascending</Text>
                </TouchableOpacity>

                {/* Sort Descending */}
                <TouchableOpacity style={styles.dropdownItem} onPress={() => handleOptionSelect('desc')}>
                  <Ionicons name="arrow-down-outline" size={20} color="#4B5563" />
                  <Text style={styles.dropdownText}>Sort Descending</Text>
                </TouchableOpacity>

                {/* Divider / Line */}
                <View style={styles.divider} />

                {/* Unread Messages */}
                <TouchableOpacity style={styles.dropdownItem} onPress={() => handleOptionSelect('unread')}>
                  <Ionicons name="mail-unread-outline" size={20} color="#3B82F6" />
                  <Text style={[styles.dropdownText, { color: '#3B82F6', fontWeight: '600' }]}>Unread Messages</Text>
                </TouchableOpacity>

              </View>
            </TouchableOpacity>
          </Modal>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ backgroundColor: '#fff' }}>
      <View style={styles.headerContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.leftSection,
            { transform: [{ scale: pressed ? 0.96 : 1 }] }
          ]}
          onPress={onProfilePress}
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

        <View style={styles.rightSection}>
          <HeaderIconButton icon={theme.actionIcon} color="#333" onPress={onActionPress} />
          <View style={{ width: 10 }} />
          <HeaderIconButton icon="notifications-outline" color="#333" badgeCount={notificationCount} onPress={onNotificationPress} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: Platform.OS == "android" ? 10 : 10,
    paddingTop: Platform.OS === "android" ? 40 : 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)', // Halka sa dark background focus ke liye
  },
  dropdownContainer: {
    position: 'absolute',
    top: 60, // Apne header height ke hisaab se isko adjust karein (e.g., 50, 60, 70)
    right: 16, // Screen ke right side se gap
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 8,
    width: 200,
    elevation: 5, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dropdownText: {
    fontSize: 15,
    color: '#4B5563',
    marginLeft: 12, // Icon aur text ke beech ka space
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
    marginHorizontal: 12,
  },
  profileHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    letterSpacing: 0.5,
  },
  profileHeaderContainer: {
    flexDirection: 'row',
    paddingTop: Platform.OS === "android" ? 40 : 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chatHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === "android" ? 40 : 10,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  chatHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#111',
  },
  rightIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    padding: 4,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    marginRight: 12,
  },
  textContainer: {
    justifyContent: 'center',
  },
  greetingText: {
    fontSize: 14,
    color: '#666',
  },
  nameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
  },
  subText: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ef4444',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 4,
  },
});