import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, Image, ScrollView,
  TouchableOpacity, ActivityIndicator, SafeAreaView,
  Animated, Platform, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getMentorProfile } from '../../../../src/services/mentorAPI';

const PURPLE_THEME = '#8B5CF6';

const InfoCard = ({ icon, label, value, color = PURPLE_THEME }) => (
  <View style={styles.infoCard}>
    <View style={[styles.iconCircle, { backgroundColor: `${color}15` }]}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <View style={styles.infoTextContainer}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || 'Not Provided'}</Text>
    </View>
  </View>
);

export default function MentorProfileDetails() {
  const navigation = useNavigation();
  const [mentorData, setMentorData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await getMentorProfile();
      
      // 👉 UPDATED EXTRACTION: Aapka data "consultant" key ke andar hai
      const data = res?.consultant || res?.mentor || res?.data || res;
      setMentorData(data);
      
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 7, useNativeDriver: true })
      ]).start();
    } catch (error) {
      console.error("Error fetching mentor profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={PURPLE_THEME} />
        <Text style={styles.loaderText}>Loading Mentor Profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mentor Profile</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate("EditProfile", { existingProfile: mentorData })}
          style={styles.editButton}
        >
          <Ionicons name="create-outline" size={24} color={PURPLE_THEME} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          
          {/* Profile Card */}
          <View style={styles.profileMainCard}>
            <View style={styles.avatarWrapper}>
              <Image
                source={{ uri: mentorData?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(mentorData?.name)}&background=8B5CF6&color=fff` }}
                style={styles.profileImage}
              />
              {mentorData?.isActive && <View style={styles.activeBadge} />}
            </View>
            <Text style={styles.mentorName}>{mentorData?.name || 'User'}</Text>
            <Text style={styles.mentorRole}>{mentorData?.role || 'Mentor'}</Text>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{mentorData?.experience || 0}</Text>
                <Text style={styles.statLabel}>Yrs Exp.</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{mentorData?.averageRating || 0}</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
            </View>
          </View>

          {/* Bio Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About Me</Text>
            <View style={styles.bioCard}>
              <Text style={styles.bioText}>
                {mentorData?.bio || "No biography added yet."}
              </Text>
            </View>
          </View>

          {/* Contact & Expertise Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Expertise & Contact</Text>
            <InfoCard icon="book-outline" label="Specialization" value={mentorData?.specialization} />
            <InfoCard icon="mail-outline" label="Email Address" value={mentorData?.email} />
            <InfoCard icon="call-outline" label="Mobile Number" value={mentorData?.mobile || mentorData?.phone} />
            <InfoCard 
              icon="shield-checkmark-outline" 
              label="KYC Status" 
              value={mentorData?.isKycVerified ? "Verified" : "Not Verified"} 
              color={mentorData?.isKycVerified ? "#10B981" : "#EF4444"} 
            />
          </View>

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { marginTop: 12, color: '#6B7280', fontSize: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    paddingTop:30,
    borderBottomColor: '#F3F4F6',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
      android: { elevation: 3 }
    })
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  editButton: { padding: 4 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  profileMainCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  avatarWrapper: { position: 'relative', marginBottom: 16 },
  profileImage: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: PURPLE_THEME },
  activeBadge: {
    position: 'absolute', bottom: 5, right: 5,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: '#10B981', borderWidth: 3, borderColor: '#FFF'
  },
  mentorName: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 4 },
  mentorRole: { fontSize: 14, color: PURPLE_THEME, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20, width: '100%', justifyContent: 'center' },
  statItem: { alignItems: 'center', paddingHorizontal: 20 },
  statValue: { fontSize: 18, fontWeight: '800', color: '#1F2937' },
  statLabel: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: '#E5E7EB' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginBottom: 12, marginLeft: 4 },
  bioCard: { backgroundColor: '#FFF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#F3F4F6' },
  bioText: { fontSize: 15, color: '#4B5563', lineHeight: 22 },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  iconCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  infoTextContainer: { flex: 1 },
  infoLabel: { fontSize: 12, color: '#9CA3AF', fontWeight: '600', marginBottom: 2 },
  infoValue: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
});