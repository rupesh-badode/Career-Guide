import React, { useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CounselorList from "./CounselorList";
import ImageCarousel from "./ImageCarousel";
import NewsSection from "./NewsSection";
import Blog from "./Blog";
import FeaturedBooks from "./FeaturedBooks";
import CustomHeader from "../../../../src/components/common/CustomHeader";
import OnboardingScreen from "./OnboardingScreen";
import WhyLoveAastroneet from "./WhyLoveAastroneet";
import SmartTools from "./SmartTools";
import TopMentorsOverview from "./TopMentorsOverview";
import { useNavigation } from "@react-navigation/native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
// import { logout } from "../../../../src/redux/authSlice";

export default function Index() {
    const insets = useSafeAreaInsets();
    const HEADER_HEIGHT = insets.top + 60; // Apne header ke hisaab se adjust karein
    const navigation = useNavigation();

    const dispatch = useDispatch();

    const scrollY = useRef(new Animated.Value(0)).current;
    const scrollYClamped = Animated.diffClamp(scrollY, 0, HEADER_HEIGHT);

    // 🔥 Sirf Opacity animate kar rahe hain (Header wahin gayab hoga)
    const headerOpacity = scrollYClamped.interpolate({
        inputRange: [0, HEADER_HEIGHT],
        outputRange: [1, 0], // 1 = Pura dikhega, 0 = Wahin par gayab ho jayega
    });

    


    return (
        <View style={styles.container}>
            {/* 1. ScrollView ko pehle rakha taaki ye Header ke peeche (niche) rahe */}
            <Animated.ScrollView 
                contentContainerStyle={{ 
                    paddingTop: HEADER_HEIGHT, // Taaki shuru me content header ke theek niche se start ho, koi extra space nahi
                    paddingBottom: 80 
                }} 
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
            >
                <OnboardingScreen />
                <ImageCarousel />
                <CounselorList />
                <WhyLoveAastroneet/>
                <TopMentorsOverview/>
                {/* <SmartTools/> */}
                <Blog />
                <FeaturedBooks />
                <NewsSection />
            </Animated.ScrollView>

            {/* 2. Header ko absolute rakha aur opacity lagayi */}
            <Animated.View style={[
                styles.headerContainer, 
                { 
                    height: HEADER_HEIGHT, 
                    opacity: headerOpacity // Upar scroll nahi hoga, bas transparent hoga
                }
            ]}>
                {/* ⚠️ Ensure karein ki ab CustomHeader me koi old translateY prop na ja raha ho */}
                <CustomHeader routeName="Home" onProfilePress={()=>navigation.navigate("Profile")}/>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff', 
    },
    headerContainer: {
        position: 'absolute', // Ye space ko completely khatam kar dega
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff', // White background zaruri hai taaki fade hote time clean effect aaye
    }
});