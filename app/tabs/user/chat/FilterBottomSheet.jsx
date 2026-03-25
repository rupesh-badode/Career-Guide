import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView,
  Animated, Dimensions, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { height } = Dimensions.get('window');

// 👉 Filter Categories and Options Data
const FILTER_DATA = [
  {
    id: 'instituteType',
    title: 'Institute Type',
    options: ['AIIMS', 'Central Universities', 'Deemed Universities', 'Government', 'Private']
  },
  {
    id: 'managementType',
    title: 'Management Type',
    options: ['Government Quota', 'Management Quota', 'NRI Quota', 'Jain Minority', 'Muslim Minority']
  },
  {
    id: 'state',
    title: 'State',
    options: ['Maharashtra', 'Delhi', 'Karnataka', 'Uttar Pradesh', 'Rajasthan', 'Gujarat', 'Tamil Nadu']
  },
  {
    id: 'university',
    title: 'University',
    options: ['Delhi University (DU)', 'MUHS Nashik', 'KGMU Lucknow', 'RGUHS Bangalore']
  }
];

export default function FilterBottomSheet({ visible, onClose, onApply }) {
  const [activeTab, setActiveTab] = useState(FILTER_DATA[0].id); // Default pehla tab open rahega
  const [selectedFilters, setSelectedFilters] = useState({
    instituteType: [],
    managementType: [],
    state: [],
    university: []
  });

  // 👉 Checkbox toggle logic
  const toggleFilter = (categoryId, option) => {
    setSelectedFilters(prev => {
      const currentCategoryList = prev[categoryId];
      if (currentCategoryList.includes(option)) {
        // Agar pehle se selected hai, toh hatao
        return { ...prev, [categoryId]: currentCategoryList.filter(item => item !== option) };
      } else {
        // Naya select karo
        return { ...prev, [categoryId]: [...currentCategoryList, option] };
      }
    });
  };

  // 👉 Clear All Logic
  const clearAllFilters = () => {
    setSelectedFilters({
      instituteType: [],
      managementType: [],
      state: [],
      university: []
    });
  };

  // 👉 Get total selected count
  const getTotalSelectedCount = () => {
    return Object.values(selectedFilters).reduce((total, arr) => total + arr.length, 0);
  };

  // Right side ke options render karne ke liye
  const renderRightContent = () => {
    const activeCategoryData = FILTER_DATA.find(cat => cat.id === activeTab);
    if (!activeCategoryData) return null;

    return (
      <ScrollView style={styles.rightContent} showsVerticalScrollIndicator={false}>
        {activeCategoryData.options.map((option, index) => {
          const isSelected = selectedFilters[activeTab].includes(option);
          return (
            <TouchableOpacity
              key={index}
              style={styles.checkboxRow}
              activeOpacity={0.7}
              onPress={() => toggleFilter(activeTab, option)}
            >
              <Ionicons
                name={isSelected ? "checkbox" : "square-outline"}
                size={24}
                color={isSelected ? "#4F46E5" : "#9CA3AF"}
              />
              <Text style={[styles.checkboxText, isSelected && styles.checkboxTextSelected]}>
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.dismissArea} activeOpacity={1} onPress={onClose} />
        
        {/* 👉 Bottom Sheet Container */}
        <View style={styles.bottomSheetContainer}>
          
          {/* Top Handle / Pull Bar */}
          <View style={styles.pullBarContainer}>
            <View style={styles.pullBar} />
          </View>

          {/* Header (Title & Clear All) */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Filters</Text>
            <TouchableOpacity onPress={clearAllFilters}>
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
          </View>

          {/* Main Content (Left Sidebar & Right Options) */}
          <View style={styles.body}>
            
            {/* Left Sidebar */}
            <View style={styles.leftSidebar}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {FILTER_DATA.map((item) => {
                  const isActive = activeTab === item.id;
                  const selectedCount = selectedFilters[item.id].length;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.sidebarTab, isActive && styles.activeSidebarTab]}
                      onPress={() => setActiveTab(item.id)}
                    >
                      <Text style={[styles.sidebarTabText, isActive && styles.activeSidebarTabText]}>
                        {item.title}
                      </Text>
                      {/* Show count badge if items are selected in this category */}
                      {selectedCount > 0 && (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>{selectedCount}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Right Content */}
            {renderRightContent()}

          </View>

          {/* Footer (Apply Button) */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.applyButton} 
              activeOpacity={0.8}
              onPress={() => {
                onApply(selectedFilters);
                onClose();
              }}
            >
              <Text style={styles.applyButtonText}>
                APPLY FILTERS {getTotalSelectedCount() > 0 ? `(${getTotalSelectedCount()})` : ''}
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark transparent background
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  bottomSheetContainer: {
    backgroundColor: '#FFFFFF',
    height: height * 0.75, // Screen ka 75% height lega
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  pullBarContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  pullBar: {
    width: 40,
    height: 5,
    backgroundColor: '#D1D5DB',
    borderRadius: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444', // Red color for clear action
  },
  body: {
    flex: 1,
    flexDirection: 'row',
  },
  leftSidebar: {
    width: '35%',
    backgroundColor: '#F9FAFB',
    borderRightWidth: 1,
    borderRightColor: '#F3F4F6',
  },
  sidebarTab: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeSidebarTab: {
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 4,
    borderLeftColor: '#4F46E5', // Indigo primary color
  },
  sidebarTabText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
    flex: 1,
  },
  activeSidebarTabText: {
    color: '#4F46E5',
    fontWeight: '700',
  },
  badge: {
    backgroundColor: '#4F46E5',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  rightContent: {
    width: '65%',
    backgroundColor: '#FFFFFF',
    padding: 15,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  checkboxText: {
    fontSize: 15,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  checkboxTextSelected: {
    fontWeight: '600',
    color: '#111827',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
    paddingBottom: Platform.OS === 'ios' ? 30 : 36, // iOS safe area padding
  },
  applyButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  }
});