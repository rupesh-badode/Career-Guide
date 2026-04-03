import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  RefreshControl
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// 🔥 DONO APIs IMPORT KAREIN
import { AllConsultant, allMentor } from '../../../../src/services/user'; 

const ConsultantListItem = ({ item, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(50)).current; 
  const navigation = useNavigation();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay: index * 80, useNativeDriver: true }),
      Animated.timing(translateX, { toValue: 0, duration: 400, delay: index * 80, useNativeDriver: true }),
    ]).start();
  }, [index, fadeAnim, translateX]);

  const avatarUrl = item?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(item?.name || 'User')}&background=0D8ABC&color=fff`;

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX }], paddingHorizontal: 16, paddingVertical: 6 }}>
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.8} 
        onPress={() => navigation.navigate("CounselorProfile", {
          counselorId: item?._id,
          counselorName: item?.name,
          counselorAvatar: avatarUrl,
          counselorRole: item?.role, 
          counselorExperience: item?.experience,
          counselorSpecialization: item?.specialization || item?.subject, 
          counselorBio: item?.bio,
          counselorRating: item?.averageRating,
        })} 
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          {item?.isActive && <View style={styles.onlineDot} />}
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.nameHeader}>
            <Text style={styles.name} numberOfLines={1}>{item?.name || 'Unknown'}</Text>
            {item?.isKycVerified && <Ionicons name="checkmark-circle" size={16} color="#3B82F6" style={styles.verifiedIcon} />}
          </View>
          
          <Text style={styles.specialization} numberOfLines={1}>
            {item?.role || 'Expert'} • {item?.specialization || item?.subject || 'General'}
          </Text>

          {item?.bio ? <Text style={styles.bioText} numberOfLines={1}>"{item.bio}"</Text> : null}

          <View style={styles.bottomRow}>
            <View style={styles.badge}>
              <MaterialCommunityIcons name="briefcase-outline" size={14} color="#059669" />
              <Text style={[styles.subText, { color: '#059669', fontWeight: '600' }]}>
                {item?.experience || 0} Yrs Exp
              </Text>
            </View>
            
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.ratingText}>
                {item?.averageRating || 0}
                <Text style={styles.ratingCount}> ({item?.totalRatings || 0})</Text>
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actionContainer}>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const ConsultantList = ({ contentPaddingTop = 20, onScroll, searchQuery, activeFilters, activeCategory }) => {
  const [experts, setExperts] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAllData = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const [consultantRes, mentorRes] = await Promise.all([
        AllConsultant().catch(() => null),
        allMentor().catch(() => null)
      ]);

      let consultantsData = consultantRes?.consultants || consultantRes?.data || [];
      let mentorsData = mentorRes?.mentors || mentorRes?.data || [];

      consultantsData = consultantsData.map(c => ({ ...c, role: 'Consultant' }));
      mentorsData = mentorsData.map(m => ({ ...m, role: 'Mentor' }));

      setExperts([...consultantsData, ...mentorsData]);
    } catch (error) {
      console.error("Error fetching combined data:", error);
    } finally {
      if (!isRefresh) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData(false);
  }, []);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchAllData(true);
    setIsRefreshing(false);
  };

  // 🔥 FILTER LOGIC MOVED INSIDE USEMEMO
  const filteredData = useMemo(() => {
    let result = experts;

    // 1. CATEGORY FILTER (All / Mentor / Consultant)
    if (activeCategory && activeCategory !== "All") {
      result = result.filter(item => item?.role === activeCategory);
    }

    // 2. SEARCH FILTER
    if (searchQuery) {
      result = result.filter(item => 
        item?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 3. ADVANCED FILTERS (BottomSheet Filters)
    if (activeFilters) {
      result = result.filter(item => {
        // Specialization filter
        if (activeFilters.specialization?.length > 0) {
          const itemSpec = item.specialization || item.subject;
          if (!activeFilters.specialization.includes(itemSpec)) return false;
        }

        // Experience filter
        if (activeFilters.experience?.length > 0) {
          if (!activeFilters.experience.includes(item.experience)) return false;
        }

        // Rating filter (Fixed from item.rating to item.averageRating)
        if (activeFilters.rating?.length > 0) {
          const rating = item.averageRating || 0;
          if (rating < 4) return false;
        }

        // Price filter
        if (activeFilters.amount?.length > 0) {
          const price = item.price || 0;
          if (activeFilters.amount.includes('Free') && price !== 0) return false;
          if (activeFilters.amount.includes('Under ₹500') && price >= 500) return false;
        }

        return true;
      });
    }

    return result;
  }, [experts, searchQuery, activeCategory, activeFilters]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#F27A21" />
        <Text style={{ marginTop: 10, color: '#6B7280' }}>Loading Experts...</Text>
      </View>
    );
  }

  if (!loading && filteredData.length === 0) {
    return (
      <View style={styles.center}>
         <Ionicons name="search-outline" size={48} color="#D1D5DB" />
         <Text style={{ marginTop: 12, color: '#6B7280', fontSize: 16 }}>No experts found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.FlatList
        data={filteredData} 
        keyExtractor={(item) => item?._id || Math.random().toString()}
        renderItem={({ item, index }) => <ConsultantListItem item={item} index={index} />}
        contentContainerStyle={{ 
            paddingTop: contentPaddingTop, 
            paddingBottom: 100 
        }}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#F27A21" 
            colors={['#F27A21']} 
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', paddingTop: 30 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#F3F4F6', ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 }, android: { elevation: 2 } }) },
  imageContainer: { position: 'relative' },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#E5E7EB', borderWidth: 1, borderColor: '#F3F4F6' },
  onlineDot: { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: '#10B981', borderWidth: 2, borderColor: '#FFFFFF' },
  infoContainer: { flex: 1, marginLeft: 14, justifyContent: 'center' },
  nameHeader: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: 17, fontWeight: '700', color: '#111827' },
  verifiedIcon: { marginLeft: 4 },
  specialization: { fontSize: 13, color: '#6B7280', marginTop: 2, fontWeight: '500' },
  bioText: { fontSize: 12, color: '#9CA3AF', fontStyle: 'italic', marginTop: 4 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#D1FAE5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  subText: { fontSize: 11, marginLeft: 4 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginLeft: 12 },
  ratingText: { fontSize: 13, fontWeight: '700', color: '#374151', marginLeft: 4 },
  ratingCount: { color: '#9CA3AF', fontWeight: '500', fontSize: 12 },
  actionContainer: { paddingLeft: 10, justifyContent: 'center', alignItems: 'center' },
});

export default ConsultantList;