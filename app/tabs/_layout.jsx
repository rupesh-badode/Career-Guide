import React, { useRef, useEffect } from 'react';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import {
    Platform, StyleSheet, View, TouchableOpacity,
    Animated, Dimensions
} from "react-native";
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// 👉 USER SCREENS
import Index from "./user/home/Home";
import Chat from "./user/chat/Chat";
import NewsScreen from "./user/news/NewsList";
import AppointmentSreen from "./user/appointment/AppointmentScreen";

// 👉 COUNSELOR SCREENS
import CounselorDashboard from "./counsellor/dashboard/CounselorDashboard";
import CounselorChat from "./counsellor/chat/CounselorChat";
import Request from "./counsellor/manageappoinment/Request";

// 👉 COMMON SCREENS
import ProfileScreen from "../../src/components/common/ProfileScreen";

// 👉 MENTOR SCREENS
import MentorChat from './mentor/chat/MentorChat';
import MentorDashbaord from './mentor/dashboard/MentorDashboard';

const { width } = Dimensions.get('window');
const TAB_BAR_MARGIN = 20; // Side margins
const TAB_BAR_WIDTH = width - TAB_BAR_MARGIN * 2; // Total width of the floating pill

// ==========================================
// 🚀 CUSTOM ANIMATED TAB BAR COMPONENT
// ==========================================
const CustomTabBar = ({ state, descriptors, navigation, activeColor }) => {
    const tabWidth = TAB_BAR_WIDTH / state.routes.length;
    const slideAnim = useRef(new Animated.Value(0)).current;

    const insets = useSafeAreaInsets();

    // Slide indicator when tab changes
    useEffect(() => {
        Animated.spring(slideAnim, {
            toValue: state.index * tabWidth,
            friction: 6,
            tension: 40,
            useNativeDriver: true,
        }).start();
    }, [state.index, tabWidth]);

    return (
        <View
            // ✅ Sahi tareeqa (Array brackets [] added)
            style={[styles.floatingContainer, { bottom: insets.bottom > 0 ? insets.bottom + 10 : 20 }]}>
            {/* Glassmorphism Background */}
            <BlurView tint="light" intensity={80} style={styles.blurBackground} />

            {/* Sliding Active Bubble */}
            <Animated.View
                style={[
                    styles.slidingBubble,
                    {
                        width: tabWidth,
                        transform: [{ translateX: slideAnim }]
                    }
                ]}
            >
                <View style={[styles.bubbleCircle, { backgroundColor: activeColor + '15' }]} />
            </Animated.View>

            {/* Tab Icons */}
            <View style={styles.tabsRow}>
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const isFocused = state.index === index;

                    const onPress = () => {
                        if (Platform.OS !== "android") {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    // Define Icons
                    let iconName;
                    const routeName = route.name;
                    if (routeName === 'Home' || routeName === 'Dashboard') iconName = isFocused ? 'home' : 'home-outline';
                    else if (routeName === "Chat") iconName = isFocused ? 'chatbubbles' : 'chatbubbles-outline';
                    else if (routeName === "News") iconName = isFocused ? 'newspaper' : 'newspaper-outline';
                    else if (routeName === 'Appointments' || routeName === 'Requests') iconName = isFocused ? 'calendar' : 'calendar-outline';
                    else if (routeName === 'Profile') iconName = isFocused ? 'person' : 'person-outline';

                    return (
                        <TouchableOpacity
                            key={route.key}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            onPress={onPress}
                            style={styles.tabButton}
                            activeOpacity={0.8}
                        >
                            <Animated.View style={{
                                transform: [{
                                    translateY: isFocused ? -5 : 0 // Active icon pops up slightly
                                }]
                            }}>
                                <Ionicons
                                    name={iconName || "ellipse"}
                                    size={isFocused ? 26 : 24}
                                    color={isFocused ? activeColor : '#6B7280'}
                                />
                            </Animated.View>

                            {/* Tiny dot indicator under active tab */}
                            {/* {isFocused && (
                                <View style={[styles.activeDot, { backgroundColor: activeColor }]} />
                            )} */}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

// ==========================================
// 🚀 MAIN NAVIGATOR
// ==========================================
export default function TabNavigatorGroup() {
    const Tab = createBottomTabNavigator();
    const { role } = useSelector((state) => state.auth);
    const insets = useSafeAreaInsets();

    // 👉 Dynamic Theme Colors
    let activeTabColor = '#3B82F6'; // User (Blue)
    if (role === 'Consultant') activeTabColor = '#10B981'; // Counselor (Green)
    if (role === 'Mentor') activeTabColor = '#8B5CF6'; // Mentor (Purple)

    return (
        <Tab.Navigator
            tabBar={(props) => <CustomTabBar {...props} activeColor={activeTabColor} />}
            screenOptions={{ headerShown: false }}
        >
            {/* 👉 ROLE BASED SCREENS */}
            {role === 'User' && (
                <>
                    <Tab.Screen name="Home" component={Index} />
                    <Tab.Screen name="Appointments" component={AppointmentSreen} />
                    <Tab.Screen name="Chat" component={Chat} />
                    <Tab.Screen name='News' component={NewsScreen} />
                </>
            )}

            {role === 'Consultant' && (
                <>
                    <Tab.Screen name="Dashboard" component={CounselorDashboard} />
                    <Tab.Screen name='Chat' component={CounselorChat} />
                    <Tab.Screen name="Requests" component={Request} />
                </>
            )}

            {role === 'Mentor' && (
                <>
                    <Tab.Screen name="Dashboard" component={MentorDashbaord} />
                    <Tab.Screen name="Chat" component={MentorChat} />
                </>
            )}

            {/* Common Tab */}
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

// ==========================================
// 🚀 STYLES
// ==========================================
const styles = StyleSheet.create({
    floatingContainer: {
        position: 'absolute',
        // bottom: Platform.OS === 'ios' ? 30 : 20, // Thoda upar float karega
        left: TAB_BAR_MARGIN,
        right: TAB_BAR_MARGIN,
        height: 70,
        borderRadius: 35, // Premium Pill Shape (Circle edges)
        backgroundColor: 'rgba(255, 255, 255, 0.6)', // Glassmorphism base
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.1,
                shadowRadius: 20,
            },
            android: {
                elevation: 10,
            }
        })
    },
    blurBackground: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.4)', // Frosty look
    },
    tabsRow: {
        flexDirection: 'row',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        zIndex: 2,
    },
    slidingBubble: {
        position: 'absolute',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    bubbleCircle: {
        width: 50,
        height: 50,
        borderRadius: 25, // Perfect circle behind the icon
    },
    activeDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        position: 'absolute',
        bottom: 12, // Sits exactly under the floating icon
    }
});