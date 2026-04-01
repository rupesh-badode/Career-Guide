import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ActivityIndicator, ScrollView, Alert, SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getConsultantProfile } from '../../../../src/services/consultantAPI';

// --- Reusable List Item Component (Updated with Consultant Theme Color) ---
const ListItem = ({ icon, label, value, isBio }) => (
  <View style={[styles.listItem, isBio && { alignItems: 'flex-start' }]}>
    <View style={styles.iconContainer}>
      <Ionicons name={icon} size={20} color="#F59E0B" />
    </View>
    <View style={styles.textContainer}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, isBio && { lineHeight: 22, marginTop: 4 }]}>
        {value || 'N/A'}
      </Text>
    </View>
  </View>
);

const ConsultProfileDetails = ({ navigation }) => {
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await getConsultantProfile();
      
      // 👉 API response ke according 'consultant' object nikalna
      setProfileData(data?.consultant || data); 
    } catch (error) {
      console.log("Error fetching profile:", error);
      Alert.alert("Error", "Could not load profile details.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#F59E0B" />
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF'}}>
      <View style={styles.header}>
        <Ionicons 
          name="chevron-back" 
          size={24} 
          color="#1F2937" 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
        <Text style={styles.headerTitle}>Profile Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        
        {/* --- PERSONAL INFORMATION --- */}
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
            label="Mobile Number" 
            value={profileData.mobile} 
          />
          <View style={styles.divider} />

          <ListItem 
            icon="shield-checkmark-outline" 
            label="Role" 
            value={profileData.role} 
          />
          <View style={styles.divider} />

          <ListItem 
            icon="star-outline" 
            label="Average Rating" 
            value={profileData.averageRating?.toString()} 
          />
          <View style={styles.divider} />

          <ListItem 
            icon="star-outline" 
            label="Total Rating" 
            value={profileData.totalRatings?.toString()} 
          />
        </View>

        {/* --- PROFESSIONAL DETAILS --- */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Professional Details</Text>
          
          <ListItem 
            icon="ribbon-outline" 
            label="Specialization" 
            value={profileData.specialization} 
          />
          <View style={styles.divider} />

          <ListItem 
            icon="briefcase-outline" 
            label="Experience" 
            value={profileData.experience ? `${profileData.experience} Years` : 'N/A'} 
          />
          <View style={styles.divider} />

          <ListItem 
            icon="information-circle-outline" 
            label="Bio" 
            value={profileData.bio} 
            isBio={true}
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6', 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingTop:35,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
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
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
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
    marginLeft: 55, 
  },
});

export default ConsultProfileDetails;