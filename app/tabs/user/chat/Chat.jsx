import React, { useEffect, useMemo, useState, useRef } from "react";
import { View, StyleSheet, Animated, ScrollView, Text, Pressable, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import ChatListCard from "../../../../src/components/common/ChatListCard";

// 👉 IMPORT BOTH APIs
import { MyBookings, getMentorBooking } from "../../../../src/services/user";
import CustomHeader from "../../../../src/components/common/CustomHeader";
import FilterBottomSheet from "./FilterBottomSheet";

const CATEGORIES = ["All", "Mentor", "Consultant"];

export default function Chat() {
    const [userData, setUserData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState("");
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [activeFilters, setActiveFilters] = useState(null);
    const [activeCategory, setActiveCategory] = useState("All"); // 👉 State for Categories

    const insets = useSafeAreaInsets();
    
    // 👉 HEADER HEIGHT UPDATE: CustomHeader (80) + Categories (60)
    const CATEGORY_BAR_HEIGHT = 60;
    const HEADER_HEIGHT = insets.top + 80 + CATEGORY_BAR_HEIGHT; 

    const scrollY = useRef(new Animated.Value(0)).current;
    const scrollYClamped = Animated.diffClamp(scrollY, 0, HEADER_HEIGHT);

    const headerOpacity = scrollYClamped.interpolate({
        inputRange: [0, HEADER_HEIGHT],
        outputRange: [1, 0],
    });
    const onRefresh = async () => {
        setIsRefreshing(true);
        await fetchData(true);
        setIsRefreshing(false);
    };

    // 👉 FETCH BOTH APIS PARALLELY
    const fetchData = async (isRefresh = false) => {
        if (!isRefresh) setLoading(true);
        try {
            const [consultantRes, mentorRes] = await Promise.all([
                MyBookings().catch(() => ({ data: [] })),
                getMentorBooking().catch(() => ({ bookings: [] })) // Fallback updated
            ]);

            let consultantBookings = consultantRes?.data || [];
            
            // 🔥 FIX: Aapke naye JSON ke hisab se 'bookings' key use ki hai
            let mentorBookings = mentorRes?.bookings || mentorRes?.data || [];

            // 👉 SMART NORMALIZATION: 
            // Hum Mentor ke data ko Consultant ke data jaisa structure de rahe hain
            // Taaki ChatListCard ko pata bhi na chale aur wo smoothly dono ko render kar de!
            
            consultantBookings = consultantBookings.map(b => ({ 
                ...b, 
                roleType: 'Consultant',
                expert: b.consultantId || {} // Common key
            }));

            mentorBookings = mentorBookings.map(b => ({ 
                ...b, 
                roleType: 'Mentor',
                expert: b.mentor || {}, // 🔥 JSON ka 'mentor' object idhar map kiya
                
                // ChatListCard ko dhoka dene ke liye same key copy kar di
                consultantId: b.mentor 
            }));

            const combinedBookings = [...consultantBookings, ...mentorBookings];
            
            // Optional: Sort by date (Latest first)
            combinedBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setUserData(combinedBookings);
            console.log("Total Combined Bookings Loaded: ", combinedBookings.length);
        } catch (err) {
            console.log("Error fetching bookings:", err);
        } finally {
            if (!isRefresh) setLoading(false);
        }
    }

    // 👉 2. FILTER DATA (Updated to use the normalized 'expert' key)
    const filteredData = useMemo(() => {
        let result = userData;

        // 🔥 1. CATEGORY FILTER (All, Mentor, Consultant)
        if (activeCategory !== "All") {
            result = result.filter(item => item.roleType === activeCategory);
        }

        // 🔥 2. SMART SEARCH
        if (searchQuery) {
            result = result.filter((item) => {
                const name = item.expert?.name || "";
                return name.toLowerCase().includes(searchQuery.toLowerCase());
            });
        }

        // 🔥 3. ADVANCED FILTERS
        if (activeFilters) {
            if (activeFilters.specialization?.length > 0) {
                result = result.filter(item => 
                    activeFilters.specialization.includes(item.expert?.specialization || item.expert?.subject)
                );
            }
            if (activeFilters.status?.length > 0) {
                result = result.filter(item => 
                    activeFilters.status.some(s => s.toLowerCase() === item?.status?.toLowerCase())
                );
            }
            if (activeFilters.paymentStatus?.length > 0) {
                result = result.filter(item => 
                    activeFilters.paymentStatus.some(s => s.toLowerCase() === item?.paymentStatus?.toLowerCase())
                );
            }
            if (activeFilters.amount?.length > 0) {
                result = result.filter(item => {
                    const price = item?.amount || 0;
                    return activeFilters.amount.some(filter => {
                        if (filter === 'Free') return price === 0;
                        if (filter === 'Under ₹500') return price > 0 && price < 500;
                        if (filter === '₹500 - ₹1000') return price >= 500 && price <= 1000;
                        if (filter === 'Above ₹1000') return price > 1000;
                        return false;
                    });
                });
            }
        }
        return result;
    }, [userData, searchQuery, activeFilters, activeCategory]);


    useEffect(() => {
        fetchData();
    }, []);

    return (
        <View style={styles.container}>
            <ChatListCard
                data={filteredData}
                isLoading={loading}
                isRefreshing={isRefreshing}
                onRefresh={onRefresh}
                contentPaddingTop={HEADER_HEIGHT}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                onCardPress={(item) => {
                    // 👉 DIRECT USE: Kyunki humne mapping me pehle hi 'expert' key set kar di thi
                    const expert = item.expert || {};
                    navigation.navigate('CounselorProfile', {
                        counselorId: expert._id,
                        counselorName: expert.name,
                        counselorAvatar: expert.profilePicture,
                        counselorRole: item.roleType
                    });
                }}
                onChatPress={(item) => {
                    const expert = item.expert || {};
                    navigation.navigate('ChatScreen', {
                        counselorId: expert._id,
                        counselorName: expert.name,
                        counselorAvatar: expert.profilePicture,
                        consultationId: item._id
                    });
                }}
                onActionPress={(item) => {
                    const expert = item.expert || {};
                    navigation.navigate('ChatScreen', {
                        receiverId: expert._id,
                        receiverName: expert.name,
                        receiverAvatar: expert.profilePicture,
                        consultationId: item._id
                    });
                }}
            />
            <Animated.View style={[
                styles.headerContainer,
                { height: HEADER_HEIGHT, opacity: headerOpacity }
            ]}>
                <CustomHeader
                    routeName="Chat"
                    onFilterPress={() => setIsFilterVisible(true)}
                    onSearchChange={(text) => setSearchQuery(text)}
                />
                
                {/* 🔥 PREMIUM CATEGORY TABS */}
                <View style={styles.categoryWrapper}>
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.categoryScrollContent}
                        bounces={true}
                    >
                        {CATEGORIES.map((category, index) => {
                            const isActive = activeCategory === category;
                            return (
                                <Pressable 
                                    key={index} 
                                    onPress={() => setActiveCategory(category)}
                                    style={({ pressed }) => [
                                        styles.categoryBtn, 
                                        isActive && styles.categoryBtnActive,
                                        pressed && styles.categoryBtnPressed 
                                    ]}
                                >
                                    <Text style={[
                                        styles.categoryText,
                                        isActive && styles.categoryTextActive
                                    ]}>
                                        {category}
                                    </Text>
                                    {isActive && <View style={styles.activeIndicatorDot} />}
                                </Pressable>
                            );
                        })}
                    </ScrollView>
                </View>
            </Animated.View>

            <FilterBottomSheet
                visible={isFilterVisible}
                onClose={() => setIsFilterVisible(false)}
                onApply={(selectedFilters) => {
                    setActiveFilters(selectedFilters);
                }}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    headerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        zIndex: 100,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3 },
            android: { elevation: 3 },
        })
    },
    
    // --- Premium Category Styles ---
    categoryWrapper: {
        height: 60, 
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    categoryScrollContent: { 
        paddingHorizontal: 16, 
        alignItems: 'center',
        paddingVertical: 5, 
    },
    categoryBtn: {
        flexDirection: 'row', 
        paddingHorizontal: 20, 
        paddingVertical: 10,
        borderRadius: 25, 
        backgroundColor: '#F3F4F6',
        marginRight: 12, 
        borderWidth: 1.5, 
        borderColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryBtnActive: { 
        backgroundColor: '#FFF5EB', 
        borderColor: '#F27A21', 
        ...Platform.select({
            ios: { shadowColor: '#F27A21', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5 },
            android: { elevation: 4, shadowColor: '#F27A21' }
        })
    },
    categoryBtnPressed: {
        transform: [{ scale: 0.95 }], 
        opacity: 0.8,
    },
    categoryText: { 
        fontSize: 14, 
        color: '#6B7280', 
        fontWeight: '600',
        letterSpacing: 0.3, 
    },
    categoryTextActive: { 
        color: '#F27A21', 
        fontWeight: '800' 
    },
    activeIndicatorDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#F27A21',
        marginLeft: 6, 
    }
});