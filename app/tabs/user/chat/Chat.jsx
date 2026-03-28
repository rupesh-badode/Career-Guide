import React, { useEffect, useMemo, useState, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import ChatListCard from "../../../../src/components/common/ChatListCard";
import { MyBookings } from "../../../../src/services/user";
import CustomHeader from "../../../../src/components/common/CustomHeader";
import FilterBottomSheet from "./FilterBottomSheet";

export default function Chat() {
    const [userData, setUserData] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // 👉 NAYA STATE: Refreshing ke liye
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState("");
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [activeFilters, setActiveFilters] = useState(null);

    const insets = useSafeAreaInsets();
    const HEADER_HEIGHT = insets.top + 80; 

    const scrollY = useRef(new Animated.Value(0)).current;
    const scrollYClamped = Animated.diffClamp(scrollY, 0, HEADER_HEIGHT);

    const headerOpacity = scrollYClamped.interpolate({
        inputRange: [0, HEADER_HEIGHT],
        outputRange: [1, 0],
    });

    // 👉 UPDATE: fetchData ab batayega ki ye normal load hai ya refresh load
    const fetchData = async (isRefresh = false) => {
        if (!isRefresh) setLoading(true); // Agar refresh nahi hai, tabhi main loader dikhao
        try {
            const res = await MyBookings();
            const bookingsList = res?.data || [];
            setUserData(bookingsList);
            console.log("Bookings List Loaded: ", bookingsList.length);
        } catch (err) {
            console.log("Error fetching bookings:", err);
        } finally {
            if (!isRefresh) setLoading(false);
        }
    }

    useEffect(() => {
        fetchData(false); // Initial load
    }, []);

    // 👉 NAYA FUNCTION: Pull-to-refresh hone par ye chalega
    const onRefresh = async () => {
        setIsRefreshing(true);
        await fetchData(true); // Pass true taaki skeleton dubara load na ho
        setIsRefreshing(false);
    };

    const filteredData = useMemo(() => {
        let result = userData;

        if (searchQuery) {
            result = result.filter((item) => {
                const name = item?.consultantId?.name || item?.userId?.name || "";
                return name.toLowerCase().includes(searchQuery.toLowerCase());
            });
        }

        if (activeFilters) {
            if (activeFilters.specialization?.length > 0) {
                result = result.filter(item => 
                    activeFilters.specialization.includes(item?.consultantId?.specialization)
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
            if (activeFilters.duration?.length > 0) {
                result = result.filter(item => {
                    const dur = item?.duration;
                    return activeFilters.duration.some(filter => filter.includes(dur?.toString()));
                });
            }
            if (activeFilters.experience?.length > 0) {
                result = result.filter(item => {
                    const exp = parseInt(item?.consultantId?.experience) || 0;
                    return activeFilters.experience.some(filter => {
                        if (filter === '0-2 Years') return exp >= 0 && exp <= 2;
                        if (filter === '3-5 Years') return exp >= 3 && exp <= 5;
                        if (filter === '6-10 Years') return exp >= 6 && exp <= 10;
                        if (filter === '10+ Years') return exp >= 10;
                        return false;
                    });
                });
            }
            if (activeFilters.rating?.length > 0) {
                result = result.filter(item => {
                    const rating = item?.consultantId?.averageRating || 0;
                    return activeFilters.rating.some(filter => {
                        if (filter === '4.5 & Above') return rating >= 4.5;
                        if (filter === '4.0 & Above') return rating >= 4.0;
                        if (filter === '3.0 & Above') return rating >= 3.0;
                        if (filter === 'Top Rated Only') return rating >= 4.5;
                        return false;
                    });
                });
            }
        }
        return result;
    }, [userData, searchQuery, activeFilters]);

    return (
        <View style={styles.container}>
            <ChatListCard
                data={filteredData}
                isLoading={loading}
                // 👉 UPDATE: Ye 2 naye props pass kiye hain ChatListCard ko
                isRefreshing={isRefreshing}
                onRefresh={onRefresh}
                
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
                    const safeReceiverId = item?.consultantId?._id ? item?.consultantId?._id : item?.consultantId;
                    navigation.navigate('ChatScreen', {
                        counselorId: safeReceiverId,
                        counselorName: item?.consultantId?.name,
                        counselorAvatar: item?.consultantId?.profilePicture,
                        consultationId: item?._id
                    });
                }}
                onActionPress={(item) => {
                    const safeReceiverId = item?.consultantId?._id ? item?.consultantId?._id : item?.consultantId;
                    navigation.navigate('ChatScreen', {
                        receiverId: safeReceiverId,
                        receiverName: item?.consultantId?.name,
                        receiverAvatar: item?.consultantId?.profilePicture,
                        consultationId: item?._id
                    });
                }}
            />

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
                    onSearchChange={(text) => setSearchQuery(text)}
                />
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
    }
});