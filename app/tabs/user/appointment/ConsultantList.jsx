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
  RefreshControl // 🔥 NAYA IMPORT ADD KIYA HAI
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { AllConsultant } from '../../../../src/services/user';
import { useNavigation } from '@react-navigation/native';

// --- Animated List Item Component ---
const ConsultantListItem = ({ item, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(50)).current; 
  const navigation = useNavigation();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, fadeAnim, translateX]);

  const avatarUrl = item?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(item?.name || 'User')}&background=0D8ABC&color=fff`;

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateX }],
        paddingHorizontal: 16,
        paddingVertical: 6,
      }}
    >
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.8} 
        onPress={() => navigation.navigate("CounselorProfile", {
          counselorId: item?._id,
          counselorName: item?.name,
          counselorAvatar: avatarUrl,
          counselorRole: item?.role,
          counselorExperience: item?.experience,
          counselorSpecialization: item?.specialization,
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
            {item?.isKycVerified && (
              <Ionicons name="checkmark-circle" size={16} color="#3B82F6" style={styles.verifiedIcon} />
            )}
          </View>
          
          <Text style={styles.specialization} numberOfLines={1}>
            {item?.role || 'Consultant'} • {item?.specialization || 'General'}
          </Text>

          {item?.bio ? (
             <Text style={styles.bioText} numberOfLines={1}>"{item.bio}"</Text>
          ) : null}

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

// --- Main Component ---
const ConsultantList = ({ contentPaddingTop = 20, onScroll, searchQuery, activeFilters }) => {
  const [consultants, setConsultants] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 🔥 PULL TO REFRESH STATES
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 👉 Is function ko modify kiya taaki refresh ke waqt bada loader na aaye
  const fetchConsultants = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const data = await AllConsultant();
      if (data?.success) setConsultants(data.consultants);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      if (!isRefresh) setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultants(false);
  }, []);

  // 🔥 NAYA FUNCTION PULL TO REFRESH KE LIYE
  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchConsultants(true);
    setIsRefreshing(false);
  };

  const filteredData = useMemo(() => {
    let result = consultants;

    if (searchQuery) {
      result = result.filter(item => 
        item?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (activeFilters) {
      // Future filter logic yahan add karein (e.g., activeFilters.role)
    }

    return result;
  }, [consultants, searchQuery, activeFilters]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ marginTop: 10, color: '#6B7280' }}>Loading consultants...</Text>
      </View>
    );
  }

  if (!loading && filteredData.length === 0) {
    return (
      <View style={styles.center}>
         <Ionicons name="search-outline" size={48} color="#D1D5DB" />
         <Text style={{ marginTop: 12, color: '#6B7280', fontSize: 16 }}>No consultants found.</Text>
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
        
        // 🔥 YAHAN REFRESH CONTROL ADD KIYA HAI
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#3B82F6" // iOS Spinner Color
            colors={['#3B82F6']} // Android Spinner Color
          />
        }
      />
    </View>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', 
    paddingTop: 30,
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingTop: 100
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
      android: { elevation: 2 }
    })
  },
  imageContainer: {
    position: 'relative',
  },
  avatar: {
    width: 64, 
    height: 64, 
    borderRadius: 32, 
    backgroundColor: '#E5E7EB',
    borderWidth: 1,
    borderColor: '#F3F4F6'
  },
  onlineDot: { 
    position: 'absolute', 
    bottom: 2, 
    right: 2, 
    width: 14, 
    height: 14, 
    borderRadius: 7, 
    backgroundColor: '#10B981', 
    borderWidth: 2, 
    borderColor: '#FFFFFF' 
  },
  infoContainer: {
    flex: 1, 
    marginLeft: 14, 
    justifyContent: 'center',
  },
  nameHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  name: {
    fontSize: 17, 
    fontWeight: '700', 
    color: '#111827', 
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  specialization: {
    fontSize: 13, 
    color: '#6B7280', 
    marginTop: 2,
    fontWeight: '500'
  },
  bioText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: 4,
  },
  bottomRow: {
    flexDirection: 'row', 
    alignItems: 'center',
    marginTop: 8,
  },
  badge: {
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  subText: {
    fontSize: 11, 
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: 'row', 
    alignItems: 'center',
    marginLeft: 12,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginLeft: 4,
  },
  ratingCount: {
    color: '#9CA3AF',
    fontWeight: '500',
    fontSize: 12
  },
  actionContainer: {
    paddingLeft: 10, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
});

export default ConsultantList;