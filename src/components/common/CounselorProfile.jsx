import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AllConsultant } from '../../services/user';

// ==========================================
// DUMMY REVIEWS DATA
// ==========================================
const REVIEWS = [
  {
    id: '1',
    user: 'Amit Kumar',
    rating: 5,
    date: '2 days ago',
    comment: 'Amazing session! Helped me clear my doubts completely.',
  },
  {
    id: '2',
    user: 'Priya S.',
    rating: 4,
    date: '1 week ago',
    comment: 'Very professional and to the point. Highly recommended.',
  }
];

export default function CounselorProfile({ route, navigation }) {
  // 👉 1. Navigation params extraction with safe fallback
  const {
    counselorId,
    counselorName,
    counselorAvatar,
    counselorRole,
    counselorExperience,
    counselorSpecialization
  } = route?.params || {};

  // 👉 2. Fallback Variables
  const displayName = counselorName || `Dr. Unknown`;
  const displayAvatar = counselorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D8ABC&color=fff`;
  const displayRole = counselorRole ? `${counselorRole} • ${counselorSpecialization || 'General'}` : 'Senior Consultant';
  const displayExperience = counselorExperience ? `${counselorExperience} Exp.` : '5+ Years Exp.';
  const displayPrice = '₹ 15 / min';

  

  return (
    <SafeAreaView style={styles.safeArea}>

      {/* ==========================================
          1. TOP HEADER
      ========================================== */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation?.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {displayName}
        </Text>

        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="share-outline" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      {/* ==========================================
          MAIN SCROLLABLE CONTENT
      ========================================== */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* ==========================================
            2. PROFILE INFO CARD
        ========================================== */}
        <View style={styles.profileCard}>
          {/* FIXED: Using displayAvatar here so fallback works */}
          <Image source={{ uri: displayAvatar }} style={styles.profileImage} />

          <View style={styles.profileDetails}>

            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>
                {displayName}
              </Text>
              <TouchableOpacity>
                <Ionicons name="ellipsis-horizontal" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.subtitle} numberOfLines={2}>{displayRole}</Text>

            <View style={styles.infoRow}>
              <Ionicons name="language-outline" size={14} color="#6B7280" />
              {/* FIXED: Removed COUNSELOR reference */}
              <Text style={styles.infoText}>English, Hindi</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="briefcase-outline" size={14} color="#6B7280" />
              <Text style={styles.infoText}>{displayExperience}</Text>
            </View>

            <View style={styles.priceTag}>
              <Text style={styles.priceText}>{displayPrice}</Text>
            </View>

          </View>
        </View>

        {/* ==========================================
            3. STATS SECTION
        ========================================== */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            {/* FIXED: Removed COUNSELOR reference */}
            <Text style={styles.statValue}>1.2k+</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>50k+</Text>
            <Text style={styles.statLabel}>Minutes</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statBox}>
            <View style={styles.ratingRow}>
              <Text style={styles.statValue}>4.9</Text>
              <Ionicons name="star" size={16} color="#F59E0B" style={{ marginLeft: 4, marginTop: -2 }} />
            </View>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        {/* ==========================================
            4. USER REVIEWS SECTION
        ========================================== */}
        <View style={styles.reviewsSection}>
          {/* FIXED: Using REVIEWS array directly */}
          <Text style={styles.sectionTitle}>User Reviews ({REVIEWS.length})</Text>

          {REVIEWS.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View>
                  <Text style={styles.reviewerName}>{review.user}</Text>
                  <View style={styles.starsRow}>
                    {[...Array(5)].map((_, i) => (
                      <Ionicons
                        key={i}
                        name={i < review.rating ? "star" : "star-outline"}
                        size={14}
                        color="#F59E0B"
                      />
                    ))}
                  </View>
                </View>
                <Text style={styles.reviewDate}>{review.date}</Text>
              </View>
              <Text style={styles.reviewComment}>{review.comment}</Text>
            </View>
          ))}

          <TouchableOpacity style={styles.viewAllBtn}>
            <Text style={styles.viewAllText}>Read All Reviews</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* ==========================================
          5. FIXED BOTTOM ACTION BAR
      ========================================== */}
      <View style={styles.bottomBar}>
        {/* <TouchableOpacity
          style={[styles.actionBtn, styles.chatBtn]}
          onPress={() => navigation.navigate('ChatScreen', {
            counselorId: counselorId,
            counselorName: displayName,
            counselorAvatar: displayAvatar,
            consultationId: counselorId
          })}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={20} color="#4F46E5" />
          <Text style={styles.chatBtnText}>Chat</Text>
        </TouchableOpacity> */}

        <View style={{ width: 15 }} />

        <TouchableOpacity style={[styles.actionBtn, styles.callBtn]}
          onPress={() => navigation.navigate("BookingScreen", { // 👉 1. Change target screen
            consultantId: counselorId,       // 👉 2. Pass the ID for the backend
            consultantName: displayName,    // 👉 3. Pass name for the UI
            amount:  500   // 👉 4. Pass the price (fallback to 500 if missing)
          })} >
          <Ionicons name="calendar-outline" size={20} color="#FFFFFF" />
          <Text style={styles.callBtnText}>Book Now</Text>
        </TouchableOpacity>
      </View>

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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 40 : 10,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center', // Center aligned the name
  },
  iconButton: {
    padding: 5,
    width: 40, // Fixed width so title stays perfectly centered
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  profileCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
      android: { elevation: 2 },
      web: { boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.04)' },
    }),
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#E5E7EB',
    marginRight: 15,
  },
  profileDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  subtitle: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 8,
    lineHeight: 18,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
  },
  priceTag: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  priceText: {
    color: '#10B981',
    fontWeight: 'bold',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 20,
    marginBottom: 20,
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E7EB',
  },
  reviewsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  starsRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  reviewDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  reviewComment: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
  },
  viewAllBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewAllText: {
    color: '#4F46E5',
    fontWeight: 'bold',
    fontSize: 14,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: Platform.OS === 'ios' ? 30 : 15,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.05, shadowRadius: 5 },
      android: { elevation: 10 },
      web: { boxShadow: '0px -4px 10px rgba(0, 0, 0, 0.03)' },
    }),
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 25,
  },
  chatBtn: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#4F46E5',
  },
  chatBtnText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  callBtn: {
    backgroundColor: '#4F46E5',
  },
  callBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});