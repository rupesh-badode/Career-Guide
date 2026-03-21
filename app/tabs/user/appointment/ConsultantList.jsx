import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AllConsultant } from '../../../../src/services/user';
import { useNavigation } from '@react-navigation/native';

// --- Animated List Item Component ---
const ConsultantListItem = ({ item, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(50)).current; // Slide in from the right
  const navigation = useNavigation();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        delay: index * 100, // Slightly faster stagger for lists
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
      <TouchableOpacity style={styles.listItemContainer} activeOpacity={0.7} onPress={() => navigation.navigate("CounselorProfile", {
        counselorId:item._id,
        counselorName: item.name,
        counselorAvatar: item.profilePicture,
        counselorRole: item.role,
        counselorExperience: item.experience,
        counselorSpecialization: item.specialization
      })} >
        {/* Left: Avatar */}
        <Image
          source={{ uri: item.profilePicture }}
          style={styles.avatar}
        />

        {/* Middle: Details */}
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

        {/* Right: Action Icon */}
        <View style={styles.actionContainer}>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#d1d5db" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// --- Main Component ---
const ConsultantList = () => {
  const [consultants, setConsultants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Uncomment below to use your API
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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={consultants}
        keyExtractor={(item) => item._id}
        renderItem={({ item, index }) => <ConsultantListItem item={item} index={index} />}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
        // This adds a subtle line between items
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      // ListHeaderComponent={
      //   <View style={styles.header}>
      //     <Text style={styles.headerTitle}>Consultants</Text>
      //     <Text style={styles.headerSubtitle}>Tap on a profile to view details</Text>
      //   </View>
      // }
      />
    </View>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // Changed to white for a cleaner list look
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  listPadding: {
    paddingBottom: 24,
  },
  listItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30, // Makes the image a perfect circle
    backgroundColor: '#e5e7eb',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  specialization: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 6,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subText: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 4,
  },
  actionContainer: {
    paddingLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginLeft: 92, // Aligns the separator with the text, not the avatar
  }
});

export default ConsultantList;