import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, ScrollView, Alert, SafeAreaView,
  Button,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getUserProfile } from '../../../../src/services/authAPI';

// --- Reusable List Item Component ---
const ListItem = ({ icon, label, value }) => (
  <View style={styles.listItem}>
    <View style={styles.iconContainer}>
      <Ionicons name={icon} size={20} color="#F27A21" />
    </View>
    <View style={styles.textContainer}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || 'N/A'}</Text>
    </View>
  </View>
);

const ProfileDetailsList = ({ navigation }) => {
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await getUserProfile();

      // Agar backend ka data kisi object (like data.user ya data.data) me aata hai, 
      // toh usko adjust kar lena. Main assume kar raha hu direct object aa raha hai.
      setProfileData(data.user || data);
    } catch (error) {
      console.log("Error fetching profile:", error);
      Alert.alert("Error", "Could not load profile details.");
    } finally {
      setIsLoading(false);
    }
  };

  // Address formatter helper
  const formatAddress = (addressObj) => {
    if (!addressObj) return 'No Address Provided';
    const { addressLine1, addressLine2, city, state, zipCode } = addressObj;

    // Sirf wahi fields dikhayega jo khali nahi hain
    const parts = [addressLine1, addressLine2, city, state, zipCode].filter(Boolean);
    return parts.join(', ');
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#F27A21" />
        <Text style={{ marginTop: 10, color: '#666' }}>Loading Profile...</Text>
      </View>
    );
  }

  if (!profileData) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ color: '#666' }}>No Data Available</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Ionicons
          name="chevron-back"
          size={24}
          color="#1F2937"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />

        <Text style={styles.headerTitle}>Profile Details</Text>

        {/* 👉 Empty View ko Edit Button se replace kar diya */}
        <TouchableOpacity
          onPress={() => navigation.navigate("EditProfile")}
          style={{ marginLeft: 12, padding: 4 }}
        >
          <Ionicons name="pencil" size={22} color="#F27A21" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <ListItem
            icon="person-outline"
            label="Full Name"
            value={profileData.name}
          />
          <View style={styles.divider} />

          <ListItem
            icon="mail-outline"
            label="Email Address"
            value={profileData.email}
          />
          <View style={styles.divider} />

          <ListItem
            icon="call-outline"
            label="Phone Number"
            value={profileData.phone}
          />
          <View style={styles.divider} />

          <ListItem
            icon="shield-checkmark-outline"
            label="Role"
            value={profileData.role}
          />
          <View style={styles.divider} />

          <ListItem
            icon="school-outline"
            label="NEET Score"
            value={profileData.neetScore?.toString()}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Location Details</Text>

          <ListItem
            icon="location-outline"
            label="Full Address"
            value={formatAddress(profileData.address)}
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Header ke color se match karega taaki top status bar white dikhe
    paddingTop: 25,
  },
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6', // Light gray background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 22,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    textAlign: "center",
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 16,
    // Shadows
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 15,
    marginTop: 5,
    marginLeft: 5,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF', // Light blue background for icon
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 55, // Icon ke baad se line start hogi
  },
});

export default ProfileDetailsList;