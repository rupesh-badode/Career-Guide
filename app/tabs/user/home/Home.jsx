import { useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CounselorList from "./CounselorList";
import ImageCarousel from "./ImageCarousel";
import NewsSection from "./NewsSection";
import FeaturedBooks from "./FeaturedBooks";
import CustomHeader from "../../../../src/components/common/CustomHeader";
import OnboardingScreen from "./OnboardingScreen";
import WhyLoveAastroneet from "./WhyLoveAastroneet";
import { useNavigation } from "@react-navigation/native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
// import { logout } from "../../../../src/redux/authSlice";
import { BlurView } from "expo-blur";
import ServicesSection from "./ServicesSection";
import PromoBanner from "./PromoBanner";
import Ad from "./Ad";
import FloatingAI from "../../../../src/components/flot/FloatingAI";

export default function Index() {
    const insets = useSafeAreaInsets();
    const HEADER_HEIGHT = insets.top + 70; // Apne header ke hisaab se adjust karein
    const navigation = useNavigation();
    const STATUS_BAR_HEIGHT = insets.top;

    const dispatch = useDispatch();

    const scrollY = useRef(new Animated.Value(0)).current;
    const scrollYClamped = Animated.diffClamp(scrollY, 0, HEADER_HEIGHT);

    // 🔥 Sirf Opacity animate kar rahe hain (Header wahin gayab hoga)
    const headerOpacity = scrollYClamped.interpolate({
        inputRange: [0, HEADER_HEIGHT],
        outputRange: [1, 0], // 1 = Pura dikhega, 0 = Wahin par gayab ho jayega
    });

    const blurOpacity = scrollY.interpolate({
        inputRange: [0, 50],
        outputRange: [0, 1], // Shuru me hidden, scroll pe visible
        extrapolate: 'clamp',
    });


    const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);


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
                {/* <OnboardingScreen /> */}
                <ServicesSection/>
                <ImageCarousel />
                <CounselorList />
                {/* <TopMentorsOverview/> */}
                {/* <SmartTools/> */}
                {/* <Blog /> */}
                <Ad/>
                <PromoBanner/>
                <FeaturedBooks />
                {/* <WhyLoveAastroneet/> */}
                <NewsSection />
                {/* <FloatingAI/> */}
                {/* <AIChat /> */}
            </Animated.ScrollView>


            {/* 🔥 BLUR EFFECT FOR STATUS BAR */}
            <AnimatedBlurView
                intensity={80} // Blur ki takat
                tint="light"   // Ya "dark" agar app dark mode hai
                style={[
                    styles.statusBarBlur, 
                    { height: STATUS_BAR_HEIGHT, opacity: blurOpacity }
                ]}
            />

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