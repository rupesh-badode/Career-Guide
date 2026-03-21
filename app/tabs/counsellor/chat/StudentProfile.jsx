import React from 'react';
import { 
  View, Text, StyleSheet, Image, SafeAreaView, 
  TouchableOpacity, ScrollView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function StudentProfile({ route, navigation }) {
  // 👉 Peechli screen se real data receive kar rahe hain
  const { studentData, bookingData } = route?.params || {};

  

  // Agar galti se data na aaye toh fallback UI
  if (!studentData) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <Ionicons name="person-circle-outline" size={60} color="#D1D5DB" />
        <Text style={styles.errorText}>User data not found!</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Address ko format karna
  const addressObj = studentData.address || {};
  const fullAddress = `${addressObj.addressLine1 || ''}, ${addressObj.addressLine2 ? addressObj.addressLine2 + ', ' : ''}${addressObj.city || ''}, ${addressObj.state || ''} - ${addressObj.zipCode || ''}`;

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Student Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* TOP PROFILE CARD */}
        <View style={styles.topCard}>
          <Image 
            source={{ uri: studentData.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(studentData.name)}&background=0D8ABC&color=fff` }} 
            style={styles.avatarLarge} 
          />
          <Text style={styles.profileName}>{studentData.name}</Text>
          
          <View style={styles.badgeRow}>
            {/* Verified Status */}
            <View style={[styles.statusBadge, { backgroundColor: studentData.isVerified ? '#ECFDF5' : '#FEF2F2' }]}>
              <Ionicons 
                name={studentData.isVerified ? "checkmark-circle" : "close-circle"} 
                size={16} 
                color={studentData.isVerified ? '#10B981' : '#EF4444'} 
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.statusText, { color: studentData.isVerified ? '#10B981' : '#EF4444' }]}>
                {studentData.isVerified ? 'Verified' : 'Not Verified'}
              </Text>
            </View>

            {/* Booking Status */}
            {bookingData?.status && (
              <View style={[styles.statusBadge, { backgroundColor: '#EFF6FF', marginLeft: 8 }]}>
                <Text style={[styles.statusText, { color: '#3B82F6' }]}>
                  {bookingData.status.toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ACTION BUTTONS */}
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: '#3B82F6' }]}
            onPress={() => {
              navigation.navigate('ChatScreen', {
                receiverId: studentData._id,
                receiverId: studentData.name,
                receiverId: studentData.profilePicture,
                consultationId: consultantId._id
              });
            }}
          >
            <Ionicons name="chatbubble-ellipses" size={20} color="#FFF" />
            <Text style={styles.actionBtnText}>Message</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#F3F4F6' }]}>
            <Ionicons name="call" size={20} color="#1F2937" />
            <Text style={[styles.actionBtnText, { color: '#1F2937' }]}>Call</Text>
          </TouchableOpacity>
        </View>

        {/* INFO SECTION */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Personal Details</Text>
          
          <View style={styles.infoBox}>
            
            {/* EMAIL */}
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={22} color="#6B7280" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Email Address</Text>
                <Text style={styles.infoValue}>{studentData.email}</Text>
              </View>
            </View>
            <View style={styles.divider} />

            {/* PHONE */}
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={22} color="#6B7280" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Phone Number</Text>
                <Text style={styles.infoValue}>{studentData.phone}</Text>
              </View>
            </View>
            <View style={styles.divider} />

            {/* NEET SCORE */}
            <View style={styles.infoRow}>
              <Ionicons name="medical-outline" size={22} color="#6B7280" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>NEET Score</Text>
                <Text style={styles.infoValue}>{studentData.neetScore || 'N/A'}</Text>
              </View>
            </View>
            <View style={styles.divider} />

            {/* ROLE */}
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={22} color="#6B7280" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Role</Text>
                <Text style={styles.infoValue}>{studentData.role}</Text>
              </View>
            </View>

          </View>
        </View>

        {/* ADDRESS SECTION */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={22} color="#6B7280" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Full Address</Text>
                <Text style={[styles.infoValue, { lineHeight: 22 }]}>
                  {fullAddress.length > 5 ? fullAddress : 'Address not provided'}
                </Text>
              </View>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ==========================================
// STYLES
// ==========================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    marginTop: 10,
    fontSize: 18,
    color: '#EF4444',
    fontWeight: '600',
  },
  backButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
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
  },
  iconButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  topCard: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#F3F4F6',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: -20,
    paddingHorizontal: 20,
    gap: 15,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  infoSection: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  infoBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  infoTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 4,
    marginLeft: 37,
  }
});