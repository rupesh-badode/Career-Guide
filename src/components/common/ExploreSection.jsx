import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// --- Dummy Data ---
const CATEGORIES = ['All', 'IT/Software', 'Design', 'Marketing', 'Finance'];

const JOBS_DATA = [
  {
    id: '1',
    title: 'Frontend Developer',
    company: 'TechCorp India',
    location: 'Remote',
    salary: '₹8L - ₹12L',
    type: 'Full Time',
    category: 'IT/Software',
  },
  {
    id: '2',
    title: 'UI/UX Designer',
    company: 'Creative Studio',
    location: 'Bangalore, KA',
    salary: '₹6L - ₹10L',
    type: 'Full Time',
    category: 'Design',
  },
  {
    id: '3',
    title: 'Digital Marketing Intern',
    company: 'GrowthX',
    location: 'Mumbai, MH',
    salary: '₹15k/month',
    type: 'Internship',
    category: 'Marketing',
  },
  {
    id: '4',
    title: 'Backend Engineer (Node.js)',
    company: 'Star Chain Labs',
    location: 'Remote',
    salary: '₹10L - ₹15L',
    type: 'Contract',
    category: 'IT/Software',
  },
];

export default function ExploreSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // --- Filter Logic ---
  // Search query aur category dono ke hisaab se data filter hoga
  const filteredJobs = JOBS_DATA.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          job.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || job.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  // --- UI Components ---
  const renderJobCard = ({ item }) => (
    <TouchableOpacity style={styles.jobCard} activeOpacity={0.7}>
      <View style={styles.jobHeader}>
        <View>
          <Text style={styles.jobTitle}>{item.title}</Text>
          <Text style={styles.companyName}>{item.company}</Text>
        </View>
        <Ionicons name="bookmark-outline" size={24} color="#6B7280" />
      </View>
      
      <View style={styles.jobDetails}>
        <View style={styles.detailBadge}>
          <Ionicons name="location-outline" size={14} color="#4B5563" />
          <Text style={styles.detailText}>{item.location}</Text>
        </View>
        <View style={styles.detailBadge}>
          <Ionicons name="cash-outline" size={14} color="#4B5563" />
          <Text style={styles.detailText}>{item.salary}</Text>
        </View>
        <View style={[styles.detailBadge, { backgroundColor: '#E0E7FF' }]}>
          <Text style={[styles.detailText, { color: '#4F46E5', fontWeight: '600' }]}>{item.type}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      
      {/* 1. Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search jobs, courses, companies..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* 2. Categories Horizontal Scroll */}
      <View style={styles.categoriesWrapper}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[
                styles.categoryChip, 
                activeCategory === item && styles.activeCategoryChip
              ]}
              onPress={() => setActiveCategory(item)}
            >
              <Text style={[
                styles.categoryText,
                activeCategory === item && styles.activeCategoryText
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        />
      </View>

      {/* 3. Job/Course List */}
      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>
          {activeCategory === 'All' ? 'Recommended for you' : `${activeCategory} Opportunities`}
        </Text>
        
        {filteredJobs.length > 0 ? (
          <FlatList
            data={filteredJobs}
            keyExtractor={(item) => item.id}
            renderItem={renderJobCard}
            scrollEnabled={false} // Agar parent mein ScrollView hai toh isko false rakhein
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>No results found for "{searchQuery}"</Text>
          </View>
        )}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Light gray background
  },
  // Search Bar Styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
      android: { elevation: 2 },
      web: { boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)' },
    }),
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    outlineStyle: 'none', // Web par focus ring hatane ke liye
  },
  // Category Styles
  categoriesWrapper: {
    marginTop: 20,
    marginBottom: 10,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeCategoryChip: {
    backgroundColor: '#4F46E5', // Indigo
    borderColor: '#4F46E5',
  },
  categoryText: {
    color: '#4B5563',
    fontWeight: '500',
  },
  activeCategoryText: {
    color: '#FFFFFF',
  },
  // List Styles
  listContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 15,
  },
  jobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
      android: { elevation: 3 },
      web: { boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.03)' },
    }),
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 14,
    color: '#6B7280',
  },
  jobDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8, // React Native 0.71+ mein gap support karta hai
  },
  detailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#4B5563',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    marginTop: 10,
    fontSize: 16,
    color: '#9CA3AF',
  },
});