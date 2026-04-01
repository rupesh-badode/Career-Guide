import React, { useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CustomHeader from "../../../../src/components/common/CustomHeader";
import ConsultantList from "./ConsultantList";
import FilterBottomSheet from "../chat/FilterBottomSheet";
// 👇 Apna bottom sheet yahan import karna na bhulein

export default function AppointmentScreen() {
    const insets = useSafeAreaInsets();
    
    // 🔥 Search aur Filter ke liye States add kiye
    const [searchQuery, setSearchQuery] = useState("");
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [activeFilters, setActiveFilters] = useState(null);

    const HEADER_HEIGHT = insets.top + 55; 

    const scrollY = useRef(new Animated.Value(0)).current;
    const scrollYClamped = Animated.diffClamp(scrollY, 0, HEADER_HEIGHT);

    const headerOpacity = scrollYClamped.interpolate({
        inputRange: [0, HEADER_HEIGHT],
        outputRange: [1, 0], 
    });

    return (
        <View style={styles.container}>
            
            {/* 🔥 VIRTUALIZATION FIX + SEARCH PROPS PASS KIYE */}
            <ConsultantList 
                contentPaddingTop={HEADER_HEIGHT}
                // 👇 ConsultantList ko ye naye variables pass kar rahe hain taaki wo data filter kar sake
                searchQuery={searchQuery}
                activeFilters={activeFilters}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
            />

            {/* Absolute positioned fade-out Header */}
            <Animated.View style={[
                styles.headerContainer, 
                { 
                    height: HEADER_HEIGHT, 
                    opacity: headerOpacity 
                }
            ]}>
                <CustomHeader 
                    routeName="Appointment" 
                    // 👇 Header ke action events ko in states ke sath connect kiya
                    onSearchChange={(text) => setSearchQuery(text)}
                    onFilterPress={() => setIsFilterVisible(true)}
                /> 
            </Animated.View>

            {/* 👇 Filter Modal UI */}
            <FilterBottomSheet 
              visible={isFilterVisible} 
              onClose={() => setIsFilterVisible(false)}
              onApply={(selectedFilters) => {
                 console.log("Applied Filters in Appointments:", selectedFilters);
                 setActiveFilters(selectedFilters); 
              }}
            />
        </View>
    );
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
    }
});