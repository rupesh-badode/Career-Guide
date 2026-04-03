import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    ActivityIndicator,
    ScrollView,
    RefreshControl,
    Platform
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { getDashboardStats } from '../../../../src/services/consultantAPI';


// --- Animated Card Component ---
const StatCard = ({ title, value, subtext, icon, color, fadeAnim, translateYAnim }) => {
    return (
        <Animated.View
            style={[
                styles.cardContainer,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: translateYAnim }],
                }
            ]}
        >
            <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
                <MaterialCommunityIcons name={icon} size={28} color={color} />
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.cardValue}>{value}</Text>
                <Text style={styles.cardTitle}>{title}</Text>
                {subtext ? <Text style={styles.cardSubtext}>{subtext}</Text> : null}
            </View>
        </Animated.View>
    );
};

export default function StatsScreen() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // 🔥 6 Cards ke liye 6 Animations Refs (Fade & Slide Up)
    const fadeAnims = useRef([...Array(6)].map(() => new Animated.Value(0))).current;
    const translateYAnims = useRef([...Array(6)].map(() => new Animated.Value(40))).current;

    // API Call Function
    const fetchStats = async (isRefresh = false) => {
        if (!isRefresh) setLoading(true);
        try {
            const response = await getDashboardStats();
            if (response?.success) {
                setStats(response.data.data);
                triggerAnimations(); // Data aane ke baad animation start karein
            }
        } catch (error) {
            console.error("Dashboard Fetch Error:", error);
        } finally {
            setLoading(false);
            if (isRefresh) setRefreshing(false);
        }
    };

    // Staggered Animation Logic (Ek ke baad ek card aayega)
    const triggerAnimations = () => {
        // Pehle purani values reset karein (taaki refresh pe wapas animate ho)
        fadeAnims.forEach(anim => anim.setValue(0));
        translateYAnims.forEach(anim => anim.setValue(40));

        const animations = fadeAnims.map((fadeAnim, index) => {
            return Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.spring(translateYAnims[index], {
                    toValue: 0,
                    speed: 12,
                    bounciness: 6,
                    useNativeDriver: true,
                })
            ]);
        });

        // 100ms ke gap par har card aayega
        Animated.stagger(100, animations).start();
    };

    useEffect(() => {
        fetchStats(false);
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchStats(true);
    };

    if (loading && !stats) {
        return (
            <View style={styles.loaderCenter}>
                <ActivityIndicator size="large" color="#F27A21" />
                <Text style={styles.loaderText}>Loading your dashboard...</Text>
            </View>
        );
    }

    // Default values fallback incase of missing data
    const safeStats = stats || {};

    // 🔥 Card Data Mapping
    const cardData = [
        {
            title: "Total Revenue",
            value: `₹${safeStats.totalRevenue || 0}`,
            icon: "currency-inr",
            color: "#10B981", // Green
        },
        {
            title: "Total Bookings",
            value: safeStats.totalBookings || 0,
            icon: "calendar-check",
            color: "#3B82F6", // Blue
        },
        {
            title: "Completed",
            value: safeStats.completedSessions || 0,
            subtext: "Sessions Done",
            icon: "check-decagram",
            color: "#8B5CF6", // Purple
        },
        {
            title: "Total Duration",
            value: `${safeStats.totalDurationHours || 0}h`,
            subtext: `${safeStats.totalDurationMinutes || 0} mins`,
            icon: "clock-outline",
            color: "#F59E0B", // Orange/Yellow
        },
        {
            title: "Available Slots",
            value: safeStats.availableSlots || 0,
            subtext: `Out of ${safeStats.totalSlots || 0}`,
            icon: "clock-check-outline",
            color: "#06B6D4", // Cyan
        },
        {
            title: "Booked Slots",
            value: safeStats.bookedSlots || 0,
            icon: "calendar-account",
            color: "#EF4444", // Red
        }
    ];

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#F27A21"]} />
            }
        >
            <View style={styles.header}>
                <Text style={styles.greeting}>Overview</Text>
                <Text style={styles.subGreeting}>Here is what's happening with your sessions.</Text>
            </View>

            {/* Responsive Flexbox Grid */}
            <View style={styles.gridContainer}>
                {cardData.map((item, index) => (
                    <StatCard
                        key={index}
                        title={item.title}
                        value={item.value}
                        subtext={item.subtext}
                        icon={item.icon}
                        color={item.color}
                        fadeAnim={fadeAnims[index]}
                        translateYAnim={translateYAnims[index]}
                    />
                ))}
            </View>
            
            {/* You can add charts or recent lists below this grid */}
            
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB', // Light gray background for contrast
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 30,
        paddingBottom: 50,
    },
    loaderCenter: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    loaderText: {
        marginTop: 12,
        fontSize: 15,
        color: '#6B7280',
        fontWeight: '500'
    },
    header: {
        marginBottom: 24,
    },
    greeting: {
        fontSize: 26,
        fontWeight: '800',
        color: '#111827',
        letterSpacing: -0.5,
    },
    subGreeting: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
        fontWeight: '500',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between', // Maintains gap between columns
    },
    
    // --- Card Styles ---
    cardContainer: {
        width: '48%', // Flexbox percentage based width for responsiveness
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16, // Gap between rows
        borderWidth: 1,
        borderColor: '#F3F4F6',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardContent: {
        justifyContent: 'flex-end',
    },
    cardValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    cardTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
    },
    cardSubtext: {
        fontSize: 11,
        color: '#9CA3AF',
        marginTop: 2,
        fontWeight: '500',
    }
});