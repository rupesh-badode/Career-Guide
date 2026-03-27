import React, { useRef } from "react";
import { Animated, StyleSheet, View, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomHeader from "../../../../src/components/common/CustomHeader";
import Dashboard from "./Dashboard";

export default function CounselorDashboard() {
    const insets = useSafeAreaInsets();
    
    // 1. Header height definition (Top Inset + Content Height)
    const HEADER_HEIGHT = insets.top + 60; 

    // 2. Scroll tracking value
    const scrollY = useRef(new Animated.Value(0)).current;

    // 3. Opacity Animation Logic
    // Jaise hi user scroll karega, opacity 1 (dikhega) se 0 (gayab) hogi.
    const headerOpacity = scrollY.interpolate({
        inputRange: [0, HEADER_HEIGHT], 
        outputRange: [1, 0], 
        extrapolate: 'clamp',
    });

    return (
        <View style={styles.container}>
            {/* Main Scrollable Content */}
            <Animated.ScrollView 
                contentContainerStyle={{ 
                    // SPACE FIX: Utni hi padding jitni header ki height hai
                    paddingTop: HEADER_HEIGHT, 
                    paddingBottom: 20 
                }} 
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
            >
                {/* DASHBOARD SPACE CHECK: 
                   Agar gap zyada lag raha ho, toh Dashboard component ke andar ka 
                   paddingTop ya SafeAreaView remove kar dein.
                */}

                <Dashboard />

                
            </Animated.ScrollView>

            {/* Fixed Header: Sirf opacity animate hogi, position nahi */}
            <Animated.View 
                style={[
                    styles.headerContainer, 
                    { 
                        height: HEADER_HEIGHT, 
                        opacity: headerOpacity, // Sirf fade effect
                    }
                ]}
                // PointerEvents handle karta hai ki gayab hone ke baad header 
                // niche ke clicks ko block na kare.
                pointerEvents="box-none" 
            >
                <CustomHeader routeName="Dashboard" />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff', // Pure white background
    },
    headerContainer: {
        position: 'absolute', // Header ko top par fix karne ke liye
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff', // White background for the header
        zIndex: 10,
        // Shadow for premium look
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    }
});