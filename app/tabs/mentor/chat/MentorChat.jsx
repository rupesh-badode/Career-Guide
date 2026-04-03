import React, { useRef, useState } from "react";
import { Animated, StyleSheet, View, Platform, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomHeader from "../../../../src/components/common/CustomHeader";
import MentorBookingsScreen from "./MentorBookingsScreen";
import AvailableModal from "../appoinment/AvailableModal";

export default function MentorChat() {
    const insets = useSafeAreaInsets();

    // 👉 Search query state
    const [searchQuery, setSearchQuery] = useState("");

    // 👉 Scroll tracking value
    const scrollY = useRef(new Animated.Value(0)).current;

    // 👉 Header height definition (Top Inset + Header + Title space)
    const HEADER_HEIGHT = insets.top + 80;

    // 👉 Opacity Animation Logic
    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 50], // 50px scroll hote hi fade out ho jayega
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    // 👉 Scroll Handler jo child ko pass hoga
    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: true }
    );

    return (
        <View style={styles.container}>

            {/* Main Content (Child Component) */}
            <View style={styles.contentWrapper}>
                <MentorBookingsScreen
                    searchQuery={searchQuery}
                    // 👉 Props pass kiye taaki FlatList animation handle kar sake
                    onScroll={handleScroll}
                    contentPaddingTop={HEADER_HEIGHT}
                />
            </View>
            

            {/* Fixed & Animated Header */}
            <Animated.View
                style={[
                    styles.headerContainer,
                    {
                        height: HEADER_HEIGHT,
                        opacity: headerOpacity,
                    }
                ]}
                pointerEvents="box-none" // Taaki hide hone pe neeche ke clicks block na hon
            >
                <CustomHeader
                    routeName="MentorChat"
                    onActionPress={() => setIsAvailabilityModalVisible(true)}
                    onSearchChange={(text) => setSearchQuery(text)}
                />
           
            </Animated.View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    contentWrapper: {
        flex: 1,
    },
    headerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        zIndex: 10,
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
    },
    // 👉 Missing Styles Add kiye hain
    titleWrapper: {
        paddingHorizontal: 20,
        paddingBottom: 15,
        paddingTop: 5,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#111827',
    },
    chatHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    chatHeaderTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
});