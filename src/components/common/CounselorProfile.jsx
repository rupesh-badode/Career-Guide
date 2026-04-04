import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// 👉 DONO APIs IMPORT KI HAIN
import { SingleConsultant, SingleMentor } from '../../services/user'; 
import RatingModal from './RatingModal'; 

export default function CounselorProfile({ route, navigation }) {
  // 👉 1. Navigation params extraction
  const {
    counselorId,
    counselorName,
    counselorAvatar,
    counselorRole, // 'Mentor' ya 'Consultant'
    counselorExperience,
    counselorSpecialization
  } = route?.params || {};

  // 👉 2. States for API Data & Modals
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRatingModalVisible, setIsRatingModalVisible] = useState(false);

  const handleRatingSuccess = () => {
    Alert.alert("Success", "Thank you for your feedback!");
    // Optional: Refresh data by calling the fetch function again if needed
  };

  // 👉 3. Role Ke Based Par API Hit Karna
  useEffect(() => {
    const fetchProfileDetails = async () => {
      if (!counselorId) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        let response;

        // 🔥 Condition: Agar role Mentor hai to SingleMentor call karo, warna SingleConsultant
        if (counselorRole === 'Mentor') {
          response = await SingleMentor(counselorId);
        } else {
          response = await SingleConsultant(counselorId);
        }

        // Response structure handle karna (mentor/consultant/data)
        const fetchedData = response?.mentor || response?.consultant || response?.data || response;
        setProfileData(fetchedData);
      } catch (error) {
        console.log("Error fetching profile details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileDetails();
  }, [counselorId, counselorRole]); // Dependency me role bhi daal diya

  // 👉 4. Dynamic Variables (API data fallback to route params)
  const displayName = profileData?.name || counselorName || `Expert`;
  const displayAvatar = profileData?.image || profileData?.profilePicture || counselorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D8ABC&color=fff`;

  const roleStr = profileData?.role || counselorRole;
  // Mentors ke backend me shayad 'subject' ho, isliye fallback add kar diya
  const specStr = profileData?.specialization || profileData?.subject || counselorSpecialization || 'General';
  const displayRole = roleStr ? `${roleStr} • ${specStr}` : specStr;

  const displayExperience = profileData?.experience 
    ? `${profileData.experience} Years Exp.` 
    : counselorExperience 
      ? `${counselorExperience} Exp.` 
      : '5+ Years Exp.';

  const displayPrice = profileData?.price ? `₹ ${profileData.price} / session` : '₹ 500 / session';
  const bookingAmount = profileData?.price || 500;

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
          <Ionicons name="chevron-back-outline" size={24} color="#1F2937" />
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
        {isLoading && !profileData && (
          <ActivityIndicator size="small" color="#F27A21" style={{ marginBottom: 15 }} />
        )}

        {/* ==========================================
            2. PROFILE INFO CARD
        ========================================== */}
        <View style={styles.profileCard}>
          <Image source={{ uri: displayAvatar }} style={styles.profileImage} />

          <View style={styles.profileDetails}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>
                {displayName}
              </Text>
            </View>

            <Text style={styles.subtitle} numberOfLines={2}>{displayRole}</Text>

            <View style={styles.infoRow}>
              <Ionicons name="language-outline" size={14} color="#6B7280" />
              <Text style={styles.infoText}>
                {profileData?.languages?.join(', ') || 'English, Hindi'}
              </Text>
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
            3. ABOUT SECTION
        ========================================== */}
        {(profileData?.about || profileData?.bio) && (
          <View style={styles.aboutSection}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.aboutText}>{profileData?.about || profileData?.bio}</Text>
          </View>
        )}

        {/* ==========================================
            4. STATS SECTION 
        ========================================== */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <View style={styles.ratingRow}>
              <Text style={styles.statValue}>
                {profileData?.averageRating ? parseFloat(profileData.averageRating).toFixed(1) : '0.0'}
              </Text>
              <Ionicons name="star" size={18} color="#F27A21" style={styles.ratingStar} />
            </View>
            <Text style={styles.statLabel}>
              {profileData?.totalRatings 
                ? `${profileData.totalRatings} Review${profileData.totalRatings > 1 ? 's' : ''}` 
                : 'No Reviews'}
            </Text>
          </View>
        </View>

        {/* ==========================================
            5. USER REVIEWS SECTION
        ========================================== */}
        <View style={styles.reviewsSection}>
          <View style={styles.reviewSectionHeader}>
            <Text style={styles.sectionTitle}>
               User Reviews ({profileData?.reviews?.length || 0})
            </Text>
            
            <TouchableOpacity 
              style={styles.writeReviewBtn}
              activeOpacity={0.7}
              onPress={() => setIsRatingModalVisible(true)}
            >
              <Ionicons name="create-outline" size={16} color="#F27A21" />
              <Text style={styles.writeReviewText}>Write a Review</Text>
            </TouchableOpacity>
          </View>

          {profileData?.reviews && profileData.reviews.length > 0 ? (
            profileData.reviews.map((review, index) => (
              <View key={review._id || index} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View>
                    <Text style={styles.reviewerName}>{review.userName || review.user || "Anonymous"}</Text>
                    <View style={styles.starsRow}>
                      {[...Array(5)].map((_, i) => (
                        <Ionicons
                          key={i}
                          name={i < (review.rating || 0) ? "star" : "star-outline"}
                          size={14}
                          color={i < (review.rating || 0) ? "#F27A21" : "#D1D5DB"}
                        />
                      ))}
                    </View>
                  </View>
                  <Text style={styles.reviewDate}>
                    {review.date ? new Date(review.date).toLocaleDateString() : 'Recent'}
                  </Text>
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            ))
          ) : (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: '#9CA3AF' }}>No reviews yet. Be the first to review!</Text>
            </View>
          )}

          {profileData?.reviews?.length > 3 && (
            <TouchableOpacity style={styles.viewAllBtn} activeOpacity={0.7}>
              <Text style={styles.viewAllText}>Read All Reviews</Text>
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>

      {/* ==========================================
          6. FIXED BOTTOM ACTION BAR
      ========================================== */}
    
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={[styles.actionBtn, styles.callBtn]}
          activeOpacity={0.9}
          onPress={() => navigation.navigate("BookingScreen", {
            consultantId: counselorId,
            consultantName: displayName,
            amount: bookingAmount ,
            role: roleStr, // 🔥 Booking screen me sahi role bhejna zaroori hai
          })} 
        >
          <Ionicons name="calendar" size={20} color="#FFFFFF" />
          <Text style={styles.callBtnText}>Book Session Now</Text>
        </TouchableOpacity>
      </View>

      {/* ==========================================
          7. MODALS
      ========================================== */}
      <RatingModal 
        isVisible={isRatingModalVisible}
        onClose={() => setIsRatingModalVisible(false)}
        consultantId={counselorId || "123456789"} 
        onSubmitSuccess={handleRatingSuccess}
      />

    </SafeAreaView>
  );
}

// ==========================================
// UNIFIED STYLES
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
    textAlign: 'center',
  },
  iconButton: {
    padding: 5,
    width: 40,
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
  aboutSection: {
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  aboutText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 20,
    marginBottom: 20,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
      android: { elevation: 2 },
    }),
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
    justifyContent: 'center',
  },
  ratingStar: {
    marginLeft: 4,
    marginTop: -2,
  },
  reviewsSection: {
    paddingHorizontal: 5,
    paddingTop: 10,
    paddingBottom: 40,
  },
  reviewSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  writeReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF', 
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  writeReviewText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F27A21', 
    marginLeft: 4,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 4,
  },
  reviewDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  reviewComment: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  viewAllBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
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
    paddingBottom: Platform.OS === 'ios' ? 30 : 35,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.05, shadowRadius: 5 },
      android: { elevation: 10 },
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
  callBtn: {
    backgroundColor: '#F27A21',
  },
  callBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});