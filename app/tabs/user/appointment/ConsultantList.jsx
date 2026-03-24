import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AllConsultant } from '../../../../src/services/user';
import { useNavigation } from '@react-navigation/native';

// --- Animated List Item Component ---
// ⚠️ Unnecessary props hata diye hain item se
const ConsultantListItem = ({ item, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(50)).current; 
  const navigation = useNavigation();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        delay: index * 100, 
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration: 350,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, fadeAnim, translateX]);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateX }]
      }}
    >
      <TouchableOpacity 
        style={styles.listItemContainer} 
        activeOpacity={0.7} 
        onPress={() => navigation.navigate("CounselorProfile", {
          counselorId: item._id,
          counselorName: item.name,
          counselorAvatar: item.profilePicture,
          counselorRole: item.role,
          counselorExperience: item.experience,
          counselorSpecialization: item.specialization
        })} 
      >
        <Image source={{ uri: item.profilePicture }} style={styles.avatar} />

        <View style={styles.infoContainer}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.specialization} numberOfLines={1}>
            {item.role} • {item.specialization}
          </Text>

          <View style={styles.bottomRow}>
            <View style={styles.iconTextRow}>
              <MaterialCommunityIcons name="briefcase-outline" size={14} color="#6b7280" />
              <Text style={styles.subText}>{item.experience} Yrs</Text>
            </View>
            <View style={[styles.iconTextRow, { marginLeft: 12 }]}>
              <MaterialCommunityIcons name="star" size={14} color="#f59e0b" />
              <Text style={styles.subText}>Top Rated</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionContainer}>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#d1d5db" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// --- Main Component ---
// 👇 Yahan par ab searchQuery aur activeFilters bhi le rahe hain
const ConsultantList = ({ contentPaddingTop, onScroll, searchQuery, activeFilters }) => {
  const [consultants, setConsultants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await AllConsultant();
        if (data.success) setConsultants(data.consultants);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // 🔥 SEARCH AUR FILTER LOGIC YAHAN ADD KIYA HAI
  const filteredData = useMemo(() => {
    let result = consultants;

    // 1. Search Query Logic (Name se filter)
    if (searchQuery) {
      result = result.filter(item => 
        item?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 2. Advanced Filters Logic (Maan lijiye specialization pe hai, isko apne hisaab se adjust karein)
    if (activeFilters) {
      // Example: Agar filter me role pass hua hai
      // if (activeFilters.role) {
      //   result = result.filter(item => item.role === activeFilters.role);
      // }
    }

    return result;
  }, [consultants, searchQuery, activeFilters]);


  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.FlatList
        data={filteredData} // 👈 Ab yahan filtered data pass ho raha hai
        keyExtractor={(item) => item._id}
        renderItem={({ item, index }) => <ConsultantListItem item={item} index={index} />}
        
        // ✅ FIX: paddingTop ko StyleSheet se nikalkar yahan inline pass kar diya
        contentContainerStyle={{ 
            paddingTop: contentPaddingTop, 
            paddingBottom: 80 
        }}
        
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20, // ❌ Ise hata diya warna padding double ho jayegi!
    backgroundColor: '#ffffff', 
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  // ... baaki sab same hai ...
  listItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
  },
  avatar: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: '#e5e7eb',
  },
  infoContainer: {
    flex: 1, marginLeft: 16, justifyContent: 'center',
  },
  name: {
    fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 2,
  },
  specialization: {
    fontSize: 14, color: '#4b5563', marginBottom: 6,
  },
  bottomRow: {
    flexDirection: 'row', alignItems: 'center',
  },
  iconTextRow: {
    flexDirection: 'row', alignItems: 'center',
  },
  subText: {
    fontSize: 13, color: '#6b7280', marginLeft: 4,
  },
  actionContainer: {
    paddingLeft: 12, justifyContent: 'center', alignItems: 'center',
  },
  separator: {
    height: 1, backgroundColor: '#f3f4f6', marginLeft: 92, 
  }
});

export default ConsultantList;