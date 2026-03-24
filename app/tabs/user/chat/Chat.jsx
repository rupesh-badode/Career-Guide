import React, { useEffect, useMemo, useState, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import ChatListCard from "../../../../src/components/common/ChatListCard";
import { MyBookings } from "../../../../src/services/user";
import CustomHeader from "../../../../src/components/common/CustomHeader";
import FilterBottomSheet from "./FilterBottomSheet";

export default function Chat() {
    const [userData, setUserData] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState("");
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [activeFilters, setActiveFilters] = useState(null);

    // 🔥 ANIMATION LOGIC START
    const insets = useSafeAreaInsets();
    const HEADER_HEIGHT = insets.top + 60; // Space adjust karne ke liye 60 ko 45-50 kar sakte hain

    const scrollY = useRef(new Animated.Value(0)).current;
    const scrollYClamped = Animated.diffClamp(scrollY, 0, HEADER_HEIGHT);

    const headerOpacity = scrollYClamped.interpolate({
        inputRange: [0, HEADER_HEIGHT],
        outputRange: [1, 0], 
    });
    // 🔥 ANIMATION LOGIC END

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await MyBookings();
            const bookingsList = res?.data || [];
            setUserData(bookingsList);
            console.log("Bookings List Loaded: ", bookingsList.length);
        } catch (err) {
            console.log("Error fetching bookings:", err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    const filteredData = useMemo(() => {
        let result = userData;

        if (searchQuery) {
            result = result.filter((item) => {
                const name = item?.consultantId?.name || item?.userId?.name || ""; 
                return name.toLowerCase().includes(searchQuery.toLowerCase());
            });
        }

        if (activeFilters) {
           if (activeFilters.instituteType.length > 0) {
               result = result.filter(item => activeFilters.instituteType.includes(item.instituteType))
           }
        }

        return result;
    }, [userData, searchQuery, activeFilters]);

    return (
        <View style={styles.container}>
            
            {/* 🔥 VIRTUALIZATION FIX: List direct render hogi aur header ke theek niche se start hone ke liye padding legi */}
            <ChatListCard
                data={filteredData}
                isLoading={loading}
                // Niche wale 2 props animation ke liye naye add kiye hain
                contentPaddingTop={HEADER_HEIGHT} 
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                onCardPress={(item) => {
                    navigation.navigate('CounselorProfile', {
                        counselorId: item?.consultantId?._id,
                        counselorName: item?.consultantId?.name,
                        counselorAvatar: item?.consultantId?.profilePicture 
                    });
                }}
                onChatPress={(item) => {
                    navigation.navigate('ChatScreen', {
                        counselorId: item?.consultantId?._id,
                        counselorName: item?.consultantId?.name,
                        counselorAvatar: item?.consultantId?.profilePicture,
                        consultationId: item?._id
                    });
                }}
                onActionPress={(item) => {
                    navigation.navigate('ChatScreen', {
                        receiverId: item?.consultantId?._id,
                        receiverName: item?.consultantId?.name,
                        receiverAvatar: item?.consultantId?.profilePicture,
                        consultationId: item?._id 
                    });
                }}
            />

            {/* 🔥 HEADER KO ABSOLUTE BANAYA */}
            <Animated.View style={[
                styles.headerContainer, 
                { 
                    height: HEADER_HEIGHT, 
                    opacity: headerOpacity 
                }
            ]}>
                <CustomHeader 
                    routeName="Chat" 
                    onFilterPress={() => setIsFilterVisible(true)}  
                    onSearchChange={(text)=>setSearchQuery(text)} 
                />
            </Animated.View>

            <FilterBottomSheet 
              visible={isFilterVisible} 
              onClose={() => setIsFilterVisible(false)}
              onApply={(selectedFilters) => {
                 console.log("Applied Filters:", selectedFilters);
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
    }
});