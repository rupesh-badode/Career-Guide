import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const SearchBar = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();

  const handleSearch = (text) => {
    setSearchQuery(text);
    // Call the optional onSearch prop if it was passed in
    if (onSearch) {
      onSearch(text);
    }
  };

  return (
    < TouchableOpacity
      activeOpacity={0.9}
      style={styles.searchContainer} // Aapka wrapper style
      onPress={() => navigation.navigate("Appointments", { autoFocusSearch: true })}
    >
      <Ionicons name="search-outline" size={22} color="#94a3b8" style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search "
        placeholderTextColor="#94a3b8"
        value={searchQuery}
        editable={false}        // 🔥 Taki yahan keyboard open na ho
        pointerEvents="none"    // 🔥 Clicks ko parent TouchableOpacity par pass karega
      />
    </TouchableOpacity >
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc', // Light gray background matching the image
    borderRadius: 15,           // Rounded corners
    paddingHorizontal: 16,
    paddingVertical: 2,
    margin: 10
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#0f172a',
  },
});

export default SearchBar;