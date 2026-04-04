import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
    Dimensions,
    Easing
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
// Import tumhara waisa hi rahega
import land from "../../../../assets/user/baba.png";
import { useFonts as useUpdock, Updock_400Regular } from '@expo-google-fonts/updock';
import { useFonts as useStalemate, Stalemate_400Regular } from '@expo-google-fonts/stalemate';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const STATS = [
    "🌟 10+ Yrs Experience",
    "🎓 1L+ Students Registered",
    "🚀 10k+ NEET Aspirants Reached",
    "💡 5L+ Queries Answered"
];
const MARQUEE_TEXT = STATS.join("   •   ") + "   •   ";

export default function OnboardingScreen() {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideUpAnim = useRef(new Animated.Value(40)).current;
    const floatAnim = useRef(new Animated.Value(0)).current;

    const [textWidth, setTextWidth] = useState(0);
    const marqueeScroll = useRef(new Animated.Value(0)).current;

    const navigation = useNavigation();

    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Initial Entry Animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1200, // Thoda slow kiya smooth entry ke liye
                useNativeDriver: true,
            }),
            Animated.spring(slideUpAnim, { // Spring use kiya bounce ke liye
                toValue: 0,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            })
        ]).start(() => {
            // Floating Animation
            Animated.loop(
                Animated.sequence([
                    Animated.timing(floatAnim, {
                        toValue: -15, // Thoda zyada float
                        duration: 2500, // Smooth duration
                        easing: Easing.inOut(Easing.ease), // Smooth easing
                        useNativeDriver: true,
                    }),
                    Animated.timing(floatAnim, {
                        toValue: 0,
                        duration: 2500,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    })
                ])
            ).start();

            // Rotating Icons Animation
            Animated.loop(
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 25000, // Thoda slow aur elegant rotation
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            ).start();
        });
    }, []);

    useEffect(() => {
        if (textWidth > 0) {
            Animated.loop(
                Animated.timing(marqueeScroll, {
                    toValue: -textWidth,
                    duration: 15000, // Thoda slow scrolling better readability ke liye
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            ).start();
        }
    }, [textWidth]);

    

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    let [updockLoaded] = useUpdock({ Updock_400Regular });
    let [stalemateLoaded] = useStalemate({ Stalemate_400Regular });

    if (!updockLoaded || !stalemateLoaded) {
        return null; // Jab tak fonts load na hon
    }

    return (
        <View style={styles.container}>
            {/* Soft Background Gradient (Optional but highly recommended for premium feel) */}
            <LinearGradient
                colors={['#FFFFFF', '#EEF2FF']}
                style={StyleSheet.absoluteFillObject}
            />

            {/* Header Title */}
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideUpAnim }], alignItems: 'center' }}>
                {/* Baseline maintain karne ke liye flexDirection row ka use kiya hai */}
                <View style={styles.logoRow}>
                    <Text style={styles.firstLetterA}>A</Text>
                    <Text style={styles.specialLetterA}>a</Text>
                    <Text style={styles.restOfText}>stroneet</Text>
                </View>

            </Animated.View>

            {/* Animated Graphic Section */}
            <Animated.View style={[
                styles.imageWrapper, // Naya wrapper shadow ke liye
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: floatAnim }]
                }
            ]}>
                <Animated.Text
                    style={[
                        styles.tathastu,
                        { opacity: fadeAnim }
                    ]}
                >
                    ✨
                </Animated.Text>
                <View style={styles.imageContainer}>
                    <Animated.View style={[styles.revolvingIconsContainer, { transform: [{ rotate: spin }] }]}>
                        <MaterialCommunityIcons name="stethoscope" size={28} color="#F27A21" style={[styles.bgIcon, { top: '5%', left: '10%', opacity: 0.4 }]} />
                        <MaterialCommunityIcons name="book-open-variant" size={28} color="#F27A21" style={[styles.bgIcon, { bottom: '5%', right: '10%', opacity: 0.4 }]} />
                        <MaterialCommunityIcons name="medical-bag" size={28} color="#F27A21" style={[styles.bgIcon, { top: '5%', right: '10%', opacity: 0.4 }]} />
                        <MaterialCommunityIcons name="star" size={28} color="#F27A21" style={[styles.bgIcon, { bottom: '5%', left: '10%', opacity: 0.4 }]} />
                    </Animated.View>

                    <View style={styles.stars}>
                        <Text style={styles.star}>✨</Text>
                        <Text style={[styles.star, { top: 20, left: 30 }]}>⭐</Text>
                        <Text style={[styles.star, { bottom: 40, right: 20 }]}>✨</Text>
                        <Text style={[styles.star, { top: 80, right: 10 }]}>⭐</Text>
                    </View>

                    <Image
                        source={land}
                        style={styles.graphicImage}
                        resizeMode="contain"
                    />
                </View>
            </Animated.View>

            <View style={styles.ctaRow}>
                <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate("AllMentor")}>
                    <Text style={styles.primaryBtnText}>Talk to Mentor</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate("Appointments")}>
                    <Text style={styles.secondaryBtnText}>Book Session</Text>
                </TouchableOpacity>
            </View>

            {/* Marquee Banner Section */}
            <Animated.View style={[styles.marqueeWrapper, { opacity: fadeAnim }]}>
                {/* Subtle background for Marquee */}
                <LinearGradient
                    colors={['rgba(224, 231, 255, 0.4)', 'rgba(199, 210, 254, 0.4)']}
                    style={StyleSheet.absoluteFillObject}
                />

                <Animated.View style={{
                    flexDirection: 'row',
                    width: 9999,
                    transform: [{ translateX: marqueeScroll }]
                }}>
                    <Text
                        numberOfLines={1}
                        onLayout={(e) => setTextWidth(e.nativeEvent.layout.width)}
                        style={[styles.marqueeText, { paddingRight: 40 }]}
                    >
                        {MARQUEE_TEXT}
                    </Text>

                    <Text
                        numberOfLines={1}
                        style={[styles.marqueeText, { paddingRight: 40 }]}
                    >
                        {MARQUEE_TEXT}
                    </Text>
                </Animated.View>

                {/* Left/Right Fades - Adjusted colors to match the subtle background */}
                <LinearGradient
                    colors={['#EEF2FF', 'rgba(238, 242, 255, 0)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.fadeLeft}
                    pointerEvents="none"
                />
                <LinearGradient
                    colors={['rgba(238, 242, 255, 0)', '#EEF2FF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.fadeRight}
                    pointerEvents="none"
                />
            </Animated.View>

            <Text style={styles.heroTagline}>
                Bhavishya ko samjho. Sahi faisla lo.
            </Text>

            <Text style={styles.heroSubtext}>
                Trusted mentors & consultants se turant guidance
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#eeffee',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 6, // Thoda extra top padding
        paddingBottom: 40,
    },

    // --- Image Section Updates ---
    imageWrapper: {
        // Wrapper added to apply shadow correctly to the floating element
        shadowColor: '#F27A21',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    imageContainer: {
        width: width * 0.85,
        height: width * 0.85,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        backgroundColor: '#FFFFFF', // White bg for the image container makes it pop
        borderRadius: (width * 0.85) / 2, // Perfect circle
    },
    revolvingIconsContainer: {
        position: 'absolute',
        width: '115%', // Slightly larger than container so icons float outside
        height: '115%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bgIcon: {
        position: 'absolute',
    },
    graphicImage: {
        width: '100%', // Scaled down slightly to fit inside the circle better
        height: '100%',
        zIndex: 10,
    },
    brandTitleBase: {
        fontSize: 40,
        fontWeight: '800',
        color: '#1E293B', // Premium Dark Slate Color
        letterSpacing: 1,
    },

    // Dusra 'a' - Unique, Golden aur Stylish
    brandTitleSpecialA: {
        fontSize: 68, // Thoda bada size distinct look ke liye
        fontWeight: 'semibold',
        fontStyle: 'italic', // Isse 'a' thoda flowy aur design wala lagega
        color: '#D4AF37', // Luxury Metallic Gold
        // Gold text par halka sa glow (shadow) premium feel deta hai
        textShadowColor: 'rgba(212, 175, 55, 0.4)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },

    // Baaki ka 'stroneet' text - Thoda patla (medium) taaki 'Aa' highlight ho
    restOfText: {
        fontSize: 36,
        fontWeight: '500',
        color: '#334155', // Thoda lighter grey shade contrast ke liye
        letterSpacing: 1.5,
    },

    // Tagline - Luxury brands mein aisi spaced-out taglines achhi lagti hain
    tagline: {
        fontSize: 10,
        fontWeight: '600',
        color: '#94A3B8',
        letterSpacing: 5, // Extra space for premium look
        marginTop: -4,    // Title ke thoda paas laane ke liye
    },

    // --- Marquee Updates ---
    marqueeWrapper: {
        width: '100%',
        paddingVertical: 12,
        overflow: 'hidden',
        position: 'relative',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: 'rgba(242, 122, 33, 0.1)', // Very subtle border
        marginBottom: 10,
        marginTop: 10,
    },
    marqueeText: {
        fontSize: 14,
        fontWeight: '600', // Thoda less bold, premium lagta hai
        color: '#F27A21', // Brand Orange
        letterSpacing: 0.5,
    },
    fadeLeft: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 60, // Wider fade for smoother transition
        zIndex: 2,
    },
    fadeRight: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: 60,
        zIndex: 2,
    },

    // --- Text Content Updates ---
    textContainer: {
        paddingHorizontal: 30,
    },
    mainHeading: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1E1B4B', // Very dark indigo
        letterSpacing: 1,
        textAlign: 'center',
    },
    mainHeadingHighlight: {
        fontSize: 26,
        fontWeight: '900',
        color: '#F27A21', // Indigo highlight
        letterSpacing: 1.5,
        textAlign: 'center',
        marginTop: 2,
    },
    description: {
        fontSize: 16,
        color: '#64748B', // Slate gray
        textAlign: 'center',
        marginTop: 12,
        lineHeight: 24,
        fontWeight: '500',
    },

    // --- Bottom Container & Controls ---
    bottomContainer: {
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 40,
        marginBottom: 10,
    },
    pagination: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#C7D2FE',
        marginHorizontal: 5,
    },
    activeDot: {
        backgroundColor: '#F27A21', // Active dot brand orange color me
        width: 24, // Thoda aur wide active dot
        height: 8,
        borderRadius: 4,
        marginHorizontal: 5,
    },
    button: {
        backgroundColor: '#F27A21', // Brand Orange
        width: '100%',
        paddingVertical: 18, // Thoda taller button
        borderRadius: 16, // Modern slight curve instead of full pill
        alignItems: 'center',
        shadowColor: '#F27A21',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 1,
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'baseline', // Isse alag-alag fonts ek hi line mein align rahenge
    },

    // Pehla 'A' - Updock (Elegant aur readable)
    firstLetterA: {
        fontSize: 55,
        // fontFamily: 'Updock_400Regular',
        color: '#0F172A', // Extra Dark Slate/Navy Blue
    },

    // Dusra 'a' - Stalemate (Dramatic, sweeping curves ke sath)
    specialLetterA: {
        fontSize: 105, // Isko sabse bada rakha hai taaki signature look aaye
        fontFamily: 'Stalemate_400Regular',
        color: '#EAB308', // Vibrant Premium Gold
        // Mystical glowing shadow
        textShadowColor: 'rgba(234, 179, 8, 0.4)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
        marginLeft: -4, // 'A' aur 'a' ko thoda jodne ke liye
        marginRight: -2,
    },

    // Baaki 'stroneet' - Updock (Flow ko continue karne ke liye)
    restOfText: {
        fontSize: 55,
        fontFamily: 'Lobster_400Regular', // Thoda playful aur unique font
        color: '#000000',
        fontStyle: 'italic', // Isse thoda dynamic aur design wala lagega    
        marginLeft: -4,
        marginRight: -2,
        letterSpacing: 1.5,
        // Mystical glowing shadow
        textShadowColor: 'rgba(15, 23, 42, 0.4)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
        fontWeight: 'bold',
    },

    // Minimalist Tagline
    tagline: {
        fontSize: 10,
        fontWeight: '700',
        color: '#64748B', // Muted Blue-Grey
        letterSpacing: 8, // Extra spacing for high-end brand look
        marginTop: -12, // Cursive fonts ki height zyada hoti hai, isliye minus margin
    },
    heroTagline: {
        fontSize: 18,
        fontWeight: "700",
        color: "#0F172A",
        marginTop: 6,
        textAlign: "center"
    },

    heroSubtext: {
        fontSize: 13,
        color: "#64748B",
        marginTop: 4,
        textAlign: "center"
    },

    ctaRow: {
        flexDirection: "row",
        gap: 12,
        marginTop: 20
    },

    primaryBtn: {
        backgroundColor: "#F27A21",
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 12,
        shadowColor: "#F27A21",
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 5
    },

    primaryBtnText: {
        color: "#fff",
        fontWeight: "700"
    },

    secondaryBtn: {
        borderWidth: 1,
        borderColor: "#F27A21",
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 12
    },

    secondaryBtnText: {
        color: "#F27A21",
        fontWeight: "700"
    },

    stars: {
        position: "absolute",
        width: "100%",
        height: "100%"
    },

    star: {
        position: "absolute",
        fontSize: 16,
        opacity: 0.7
    },

    ctaRow: {
        flexDirection: "row",
        gap: 12,
        marginTop: 15
    },

    primaryBtn: {
        backgroundColor: "#F27A21",
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 12,
        shadowColor: "#F27A21",
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 6
    },

    primaryBtnText: {
        color: "#fff",
        fontWeight: "700"
    },

    secondaryBtn: {
        borderWidth: 1,
        borderColor: "#F27A21",
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 12
    },

    secondaryBtnText: {
        color: "#F27A21",
        fontWeight: "700"
    }
});