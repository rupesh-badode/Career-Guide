import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Easing,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const THEME_COLOR = '#F27A21';

// ==========================================
// MOCK DATA: STUDENTS REVIEW
// ==========================================
const STUDENTS = [
  {
    id: '1',
    name: 'Aarav Sharma',
    score: 'NEET Score: 680',
    review: 'The guidance I received was game-changing. It helped me clear all my doubts and secure my dream college!',
    image: 'https://png.pngtree.com/png-vector/20250911/ourlarge/pngtree-smart-indian-high-school-student-png-image_17410390.webp',
  },
  {
    id: '2',
    name: 'Priya Verma',
    score: 'JEE Rank: 1450',
    review: 'Amazing mentors! The one-on-one video sessions made complex topics so much easier to understand.',
    image: 'https://www.eurokidsindia.com/blog/wp-content/uploads/2024/10/Top10_Essential_Trait_GoodStudent.jpg-870x437.jpg',
  },
  {
    id: '3',
    name: 'Rahul Mehta',
    score: 'NEET Score: 655',
    review: 'Highly recommended. The availability of consultants and quick chat support is just top-notch.',
    image: 'https://static.vecteezy.com/system/resources/thumbnails/024/295/121/small/school-boy-with-books-illustration-ai-generative-free-photo.jpg',
  },
  {
    id: '4',
    name: 'Kavya Singh',
    score: 'Career Guidance',
    review: 'I was totally confused about my career path. The counseling session gave me crystal clear clarity.',
    image: 'https://t3.ftcdn.net/jpg/05/60/70/68/360_F_560706812_0GNEvn3tqo6OVQtE0JIvlwZx8fu6S2SR.jpg',
  },
];

// Calculation for exact seamless loop
const CARD_WIDTH = 280;
const CARD_MARGIN = 12;
const SINGLE_ITEM_WIDTH = CARD_WIDTH + CARD_MARGIN * 2;
const TOTAL_SET_WIDTH = STUDENTS.length * SINGLE_ITEM_WIDTH;

export default function StudentSuccessMarquee() {
  const translateX = useRef(new Animated.Value(0)).current;

  // ==========================================
  // INFINITE MARQUEE ANIMATION
  // ==========================================
  useEffect(() => {
    const startAnimation = () => {
      translateX.setValue(0);
      Animated.timing(translateX, {
        toValue: -TOTAL_SET_WIDTH, // Move exactly one full set width to the left
        duration: STUDENTS.length * 4000, // Speed adjustment (4 seconds per card)
        easing: Easing.linear, // Smooth, constant speed
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          startAnimation(); // Loop seamlessly
        }
      });
    };

    startAnimation();
  }, [translateX]);

  // Duplicating array to create the infinite scrolling illusion
  const renderData = [...STUDENTS, ...STUDENTS];

  return (
    <View style={styles.container}>
      
      {/* SECTION HEADER */}
      <View style={styles.header}>
        <View style={styles.pillBadge}>
          <Text style={styles.pillText}>SUCCESS STORIES</Text>
        </View>
        <Text style={styles.heading}>Hear From Our Students</Text>
        <Text style={styles.subHeading}>Thousands of students have achieved their dreams with our expert consultants.</Text>
      </View>

      {/* MARQUEE CONTAINER */}
      <View style={styles.marqueeWrapper}>
        <Animated.View 
          style={[styles.marqueeTrack, { transform: [{ translateX }] }]}
        >
          {renderData.map((item, index) => (
            <View key={`${item.id}-${index}`} style={styles.card}>
              
              {/* Overlapping Avatar */}
              <View style={styles.avatarWrapper}>
                <Image source={{ uri: item.image }} style={styles.avatar} />
                <View style={styles.quoteIconBadge}>
                  <Ionicons name="chevron-down" size={12} color="#FFF" />
                </View>
              </View>

              {/* 5-Star Rating */}
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons key={star} name="star" size={14} color="#F27A21" style={{ marginRight: 2 }} />
                ))}
              </View>

              {/* Review Text */}
              <Text style={styles.reviewText} numberOfLines={4}>
                "{item.review}"
              </Text>

              {/* Student Details */}
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{item.name}</Text>
                <Text style={styles.studentScore}>{item.score}</Text>
              </View>

            </View>
          ))}
        </Animated.View>
      </View>

    </View>
  );
}

// ==========================================
// STYLES
// ==========================================
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fdf5f0', // Very light emerald background
    paddingVertical: 50,
    overflow: 'hidden', // IMPORTANT: Hides the cards outside the screen
  },
  
  // --- Header ---
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 50, // Extra margin for the overlapping avatars
  },
  pillBadge: {
    backgroundColor: 'rgba(243, 185, 122, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME_COLOR,
    letterSpacing: 1.5,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subHeading: {
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },

  // --- Marquee Track ---
  marqueeWrapper: {
    width: '100%',
  },
  marqueeTrack: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // --- Review Card ---
  card: {
    width: CARD_WIDTH,
    marginHorizontal: CARD_MARGIN,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    paddingTop: 35, // Space for overlapping avatar
    marginBottom: 40,
    position: 'relative',
    ...Platform.select({
      ios: { shadowColor: '#F27A21', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 15 },
      android: { elevation: 5 },
    }),
    borderWidth: 1,
    borderColor: '#ECFDF5',
  },

  // --- Overlapping Avatar ---
  avatarWrapper: {
    position: 'absolute',
    top: -30, // Pushes the avatar outside the top border
    left: 24,
    zIndex: 10,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: '#E5E7EB',
  },
  quoteIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: -5,
    backgroundColor: THEME_COLOR,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  // --- Card Content ---
  starsRow: {
    flexDirection: 'row',
    marginBottom: 12,
    marginTop: 5,
  },
  reviewText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
    fontStyle: 'italic',
    marginBottom: 20,
  },
  studentInfo: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  studentScore: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME_COLOR,
  },
});