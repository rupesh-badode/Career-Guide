import React, { useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, Image, TouchableOpacity,
    Animated, ScrollView, Dimensions, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const MentorProfileLanding = ({ navigation }) => {
    // 👉 Animation Values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateYAnim = useRef(new Animated.Value(50)).current;
    const headerScaleAnim = useRef(new Animated.Value(0.9)).current;

    // 👉 Mock Mentor Data (Isko apne API/Redux state se replace kar lena)
    const mentor = {
        name: "Dr. Aman Pandey",
        tagline: "Senior Tech & Career Mentor",
        rating: "4.9",
        reviews: 128,
        experience: "8+ Years",
        students: "500+",
        bio: "Hi! I specialize in helping students crack top product companies and navigate their tech careers. I believe in practical, hands-on guidance rather than just theoretical advice. Let's build your dream career together!",
        expertise: ["React Native", "System Design", "Career Guidance", "Node.js"],
        image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=256&auto=format&fit=crop"
    };

    useEffect(() => {
        // 👉 Start Staggered Animations on Mount
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(translateYAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(headerScaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            {/* Top Navigation Bar */}
            <View style={styles.navBar}>
                <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.iconButton}>
                    <Ionicons name="arrow-back" size={24} color="#111827" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                    <Ionicons name="share-social-outline" size={24} color="#111827" />
                </TouchableOpacity>
            </View>

            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* 1. HERO SECTION (Animated Scale & Fade) */}
                <Animated.View style={[styles.heroSection, { opacity: fadeAnim, transform: [{ scale: headerScaleAnim }] }]}>
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: mentor.image }} style={styles.profileImage} />
                        <View style={styles.activeBadge} />
                    </View>
                    
                    <Text style={styles.mentorName}>
                        {mentor.name} <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                    </Text>
                    <Text style={styles.tagline}>{mentor.tagline}</Text>
                </Animated.View>

                {/* 2. STATS ROW (Animated Slide Up) */}
                <Animated.View style={[styles.statsContainer, { opacity: fadeAnim, transform: [{ translateY: translateYAnim }] }]}>
                    <View style={styles.statBox}>
                        <Ionicons name="star" size={22} color="#F59E0B" />
                        <Text style={styles.statValue}>{mentor.rating}</Text>
                        <Text style={styles.statLabel}>{mentor.reviews} Reviews</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                        <Ionicons name="people" size={22} color="#8B5CF6" />
                        <Text style={styles.statValue}>{mentor.students}</Text>
                        <Text style={styles.statLabel}>Mentored</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                        <Ionicons name="briefcase" size={22} color="#10B981" />
                        <Text style={styles.statValue}>{mentor.experience}</Text>
                        <Text style={styles.statLabel}>Experience</Text>
                    </View>
                </Animated.View>

                {/* 3. ABOUT SECTION */}
                <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: translateYAnim }] }]}>
                    <Text style={styles.sectionTitle}>About Me</Text>
                    <Text style={styles.bioText}>{mentor.bio}</Text>
                </Animated.View>

                {/* 4. EXPERTISE LABELS */}
                <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: translateYAnim }] }]}>
                    <Text style={styles.sectionTitle}>Expertise</Text>
                    <View style={styles.tagsContainer}>
                        {mentor.expertise.map((item, index) => (
                            <View key={index} style={styles.tag}>
                                <Text style={styles.tagText}>{item}</Text>
                            </View>
                        ))}
                    </View>
                </Animated.View>

                {/* Spacer for bottom button */}
                <View style={{ height: 80 }} /> 
            </ScrollView>

            {/* 5. STICKY BOTTOM BUTTON */}
            <Animated.View style={[styles.bottomCard, { opacity: fadeAnim, transform: [{ translateY: translateYAnim }] }]}>
                <View style={styles.priceContainer}>
                    <Text style={styles.priceLabel}>Session Fee</Text>
                    <Text style={styles.priceValue}>₹499 <Text style={styles.priceUnit}>/ 45 min</Text></Text>
                </View>
                <TouchableOpacity 
                    style={styles.bookButton}
                    onPress={() => console.log("Navigate to Booking Flow")}
                    activeOpacity={0.8}
                >
                    <Text style={styles.bookButtonText}>Book Session</Text>
                </TouchableOpacity>
            </Animated.View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    navBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 5,
        backgroundColor: '#F9FAFB',
    },
    iconButton: {
        padding: 8,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    heroSection: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 25,
    },
    imageContainer: {
        position: 'relative',
        marginBottom: 15,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: '#FFFFFF',
    },
    activeBadge: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        width: 20,
        height: 20,
        backgroundColor: '#10B981',
        borderRadius: 10,
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    mentorName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    tagline: {
        fontSize: 15,
        color: '#6B7280',
        fontWeight: '500',
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingVertical: 20,
        paddingHorizontal: 10,
        marginBottom: 25,
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 4,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 10,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginTop: 6,
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 12,
    },
    bioText: {
        fontSize: 15,
        color: '#4B5563',
        lineHeight: 24,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10, // Available in modern React Native versions
    },
    tag: {
        backgroundColor: '#EDE9FE', // Light purple
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: Platform.OS === 'ios' ? 0 : 10, // Fallback if gap doesn't work perfectly on older Androids
    },
    tagText: {
        color: '#8B5CF6',
        fontSize: 14,
        fontWeight: '600',
    },
    bottomCard: {
        position: 'absolute',
        bottom: 0,
        width: width,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 15,
        paddingBottom: Platform.OS === 'ios' ? 30 : 20,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 10,
    },
    priceContainer: {
        flex: 1,
    },
    priceLabel: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    priceValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#111827',
    },
    priceUnit: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: 'normal',
    },
    bookButton: {
        backgroundColor: '#8B5CF6',
        paddingHorizontal: 30,
        paddingVertical: 14,
        borderRadius: 12,
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    bookButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default MentorProfileLanding;