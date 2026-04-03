import React, { useRef, useState, useEffect } from "react";
import {
    Animated, StyleSheet, View, ScrollView,
    TouchableOpacity, Text, Dimensions, FlatList,
    Platform,
    Pressable
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';

import CustomHeader from "../../../../src/components/common/CustomHeader";
import ConsultantList from "./ConsultantList";
import FilterBottomSheet from "../chat/FilterBottomSheet";

const { width } = Dimensions.get('window');

// 👉 Spelling theek ki gayi hai taaki filter theek se kaam kare
const CATEGORIES = ["All", "Mentor", "Consultant"];

const MOTIVATIONS = [
    { id: '1', quote: "Your white coat is waiting for you! Keep pushing.", author: "Aastroneet" },
    { id: '2', quote: "A drop year is a prep year. You will bounce back stronger!", author: "Aastroneet" },
    { id: '3', quote: "NEET is a marathon, not a sprint. Consistency is the key.", author: "Aastroneet" },
];

export default function AppointmentScreen() {
    const insets = useSafeAreaInsets();

    const [searchQuery, setSearchQuery] = useState("");
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [activeFilters, setActiveFilters] = useState(null);
    const [activeCategory, setActiveCategory] = useState("All");

    const HEADER_BAR_HEIGHT = 55;
    const CAROUSEL_HEIGHT = 130;
    const CATEGORY_BAR_HEIGHT = 50;

    const TOTAL_TOP_SPACE = insets.top + HEADER_BAR_HEIGHT + CAROUSEL_HEIGHT + CATEGORY_BAR_HEIGHT;

    const scrollY = useRef(new Animated.Value(0)).current;
    const scrollYClamped = Animated.diffClamp(scrollY, 0, TOTAL_TOP_SPACE);

    const headerOpacity = scrollYClamped.interpolate({
        inputRange: [0, TOTAL_TOP_SPACE],
        outputRange: [1, 0],
    });

    const renderMotivationCard = ({ item }) => (
        <View style={styles.carouselCard}>
            <View style={styles.quoteIconCircle}>
                <Ionicons name="sparkles" size={16} color="#F27A21" />
            </View>
            <Text style={styles.quoteText}>"{item.quote}"</Text>
            <Text style={styles.authorText}>- {item.author}</Text>
        </View>
    );

    return (
        <View style={styles.container}>

            {/* 👉 Yahan activeCategory pass ho rahi hai perfectly */}
            <ConsultantList
                contentPaddingTop={TOTAL_TOP_SPACE}
                searchQuery={searchQuery}
                activeFilters={activeFilters}
                activeCategory={activeCategory}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
            />

            <Animated.View style={[
                styles.headerContainer,
                { height: TOTAL_TOP_SPACE, opacity: headerOpacity }
            ]}>

                <CustomHeader
                    routeName="Appointment"
                    onSearchChange={setSearchQuery}
                    onFilterPress={() => setIsFilterVisible(true)}
                />

                <View style={styles.carouselWrapper}>
                    <FlatList
                        horizontal
                        data={MOTIVATIONS}
                        keyExtractor={item => item.id}
                        renderItem={renderMotivationCard}
                        showsHorizontalScrollIndicator={false}
                        pagingEnabled
                        snapToAlignment="center"
                        decelerationRate="fast"
                    />
                </View>

                <View style={styles.categoryWrapper}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.categoryScrollContent}
                        bounces={true} // iOS par smooth bounce effect ke liye
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
                                        pressed && styles.categoryBtnPressed // Click karne par halka animation
                                    ]}
                                >
                                    <Text style={[
                                        styles.categoryText,
                                        isActive && styles.categoryTextActive
                                    ]}>
                                        {category}
                                    </Text>

                                    {/* 🔥 Ek chhota sa dot indicator jo active tab ko aur sundar banata hai */}
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
    );
}

// ... styles un-changed (they look perfect already)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    headerContainer: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: '#fff', zIndex: 100, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 3 },
    carouselWrapper: { height: 130, justifyContent: 'center', backgroundColor: '#fff' },
    carouselCard: { width: width - 30, marginHorizontal: 15, marginVertical: 10, backgroundColor: '#FFF5EB', borderRadius: 16, padding: 18, justifyContent: 'center', borderWidth: 1, borderColor: '#FDE0CB' },
    quoteIconCircle: { position: 'absolute', top: 10, right: 15, backgroundColor: '#FFF', padding: 6, borderRadius: 15 },
    quoteText: { fontSize: 15, color: '#111827', fontWeight: '600', fontStyle: 'italic', lineHeight: 22, marginBottom: 8, paddingRight: 20 },
    authorText: { fontSize: 12, color: '#F27A21', fontWeight: 'bold' },
    categoryWrapper: { height: 50, justifyContent: 'center', borderTopWidth: 1, borderTopColor: '#F3F4F6' },
    categoryScrollContent: { paddingHorizontal: 15, alignItems: 'center' },
    categoryBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', marginRight: 10, borderWidth: 1, borderColor: 'transparent' },
    categoryBtnActive: { backgroundColor: '#FFF0E6', borderColor: '#F27A21' },
    categoryText: { fontSize: 14, color: '#4B5563', fontWeight: '500' },
    categoryTextActive: { color: '#F27A21', fontWeight: 'bold' },
    categoryWrapper: {
        height: 60, // Thoda extra space taaki shadow cut na ho
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    categoryScrollContent: {
        paddingHorizontal: 16,
        alignItems: 'center',
        paddingVertical: 5, // Shadow ke liye vertical padding zaroori hai
    },
    categoryBtn: {
        flexDirection: 'row', // Text aur Dot ko align karne ke liye
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25, // Perfect rounded pill shape
        backgroundColor: '#F3F4F6',
        marginRight: 12,
        borderWidth: 1.5,
        borderColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryBtnActive: {
        backgroundColor: '#FFF5EB', // Halka orange background
        borderColor: '#F27A21',
        ...Platform.select({
            ios: {
                shadowColor: '#F27A21',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 5
            },
            android: {
                elevation: 4,
                shadowColor: '#F27A21' // Android 28+ supports colored shadows
            }
        })
    },
    categoryBtnPressed: {
        transform: [{ scale: 0.95 }], // Click pe daba hua feel dega
        opacity: 0.8,
    },
    categoryText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '600',
        letterSpacing: 0.3, // Text thoda sa khula hua achha lagta hai
    },
    categoryTextActive: {
        color: '#F27A21',
        fontWeight: '800' // Bold ki jagah Extra Bold (800) use kiya
    },
    activeIndicatorDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#F27A21',
        marginLeft: 6, // Text ke baad thoda gap
    }
});