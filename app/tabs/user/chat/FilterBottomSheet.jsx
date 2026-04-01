import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView,
  Dimensions, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { height } = Dimensions.get('window');

// 👉 NAYA FILTER DATA (Aapke API response ke according)
const FILTER_DATA = [
  {
    id: 'specialization',
    title: 'Specialization',
    // Ye list aap dynamic bhi kar sakte ho backend se aane wale unique specializations ke basis pe
    options: ['Btech', 'Mtech', 'BCA', 'MCA', 'Management', 'Medical'] 
  },
  {
    id: 'status',
    title: 'Booking Status',
    options: ['Confirmed', 'Pending', 'Cancelled', 'Completed']
  },
  {
    id: 'paymentStatus',
    title: 'Payment Status',
    options: ['Paid', 'Pending', 'Failed']
  },
  {
    id: 'experience',
    title: 'Experience',
    options: ['0-2 Years', '3-5 Years', '6-10 Years', '10+ Years']
  },
  {
    id: 'rating',
    title: 'Rating',
    options: ['4.5 & Above', '4.0 & Above', '3.0 & Above', 'Top Rated Only']
  },
  {
    id: 'amount',
    title: 'Price Range',
    options: ['Free', 'Under ₹500', '₹500 - ₹1000', 'Above ₹1000']
  },
  {
    id: 'duration',
    title: 'Duration',
    options: ['10 mins', '15 mins', '30 mins', '60 mins']
  },
  {
    id: 'time',
    title: 'Session Time',
    options: ['Morning (6 AM - 12 PM)', 'Afternoon (12 PM - 4 PM)', 'Evening (4 PM - 8 PM)', 'Night (8 PM Onwards)']
  }
];

export default function FilterBottomSheet({ visible, onClose, onApply }) {
  const [activeTab, setActiveTab] = useState(FILTER_DATA[0].id); // Pehla tab default open

  // 👉 Naya State based on new data
  const [selectedFilters, setSelectedFilters] = useState({
    specialization: [],
    status: [],
    paymentStatus: [],
    experience: [],
    rating: [],
    amount: [],
    duration: [],
    time: []
  });

  // 👉 Checkbox toggle logic
  const toggleFilter = (categoryId, option) => {
    setSelectedFilters(prev => {
      const currentCategoryList = prev[categoryId];
      if (currentCategoryList.includes(option)) {
        // Remove if already selected
        return { ...prev, [categoryId]: currentCategoryList.filter(item => item !== option) };
      } else {
        // Add new selection
        return { ...prev, [categoryId]: [...currentCategoryList, option] };
      }
    });
  };

  // 👉 Clear All Logic
  const clearAllFilters = () => {
    setSelectedFilters({
      specialization: [],
      status: [],
      paymentStatus: [],
      experience: [],
      rating: [],
      amount: [],
      duration: [],
      time: []
    });
  };

  // 👉 Total selected count (Sirf button pe dikhane ke liye)
  const getTotalSelectedCount = () => {
    return Object.values(selectedFilters).reduce((total, arr) => total + arr.length, 0);
  };

  // 👉 Right side ke options render
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
                color={isSelected ? "#F59E0B" : "#9CA3AF"}
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
          
          {/* Top Handle */}
          <View style={styles.pullBarContainer}>
            <View style={styles.pullBar} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Filter Bookings</Text>
            <TouchableOpacity onPress={clearAllFilters}>
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
          </View>

          {/* Body */}
          <View style={styles.body}>
            
            {/* Left Sidebar */}
            <View style={styles.leftSidebar}>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
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

// STYLES 
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  bottomSheetContainer: {
    backgroundColor: '#FFFFFF',
    height: height * 0.75, 
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
    color: '#EF4444', 
  },
  body: {
    flex: 1,
    flexDirection: 'row',
  },
  leftSidebar: {
    width: '38%', // Thoda badhaya hai taaki bade titles (Payment Status) fit ho jaye
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
    borderLeftColor: '#F59E0B', 
  },
  sidebarTabText: {
    fontSize: 13, // Thoda font size adjust kiya
    color: '#4B5563',
    fontWeight: '500',
    flex: 1,
  },
  activeSidebarTabText: {
    color: '#F59E0B',
    fontWeight: '700',
  },
  badge: {
    backgroundColor: '#F59E0B',
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
    width: '62%',
    backgroundColor: '#FFFFFF',
    padding: 15,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14, // Thoda touch area badhaya
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
    paddingBottom: Platform.OS === 'ios' ? 30 : 20, 
  },
  applyButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#F59E0B',
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