
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
import land from "../../../../assets/user/Hospital_doctor.webp";

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

    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(slideUpAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            })
        ]).start(() => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(floatAnim, {
                        toValue: -12,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(floatAnim, {
                        toValue: 0,
                        duration: 2000,
                        useNativeDriver: true,
                    })
                ])
            ).start();

            Animated.loop(
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 20000,
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
                    duration: 12000,
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

    return (
        <View style={styles.container}>

            {/* Header Title */}
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] }}>
                <Text style={styles.brandTitle}>AASTRONEET</Text>
            </Animated.View>

            {/* Animated Graphic Section */}
            <Animated.View style={[
                styles.imageContainer,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: floatAnim }]
                }
            ]}>
                <Animated.View style={[styles.revolvingIconsContainer, { transform: [{ rotate: spin }] }]}>
                    <MaterialCommunityIcons name="stethoscope" size={26} color="rgba(79, 70, 229, 0.35)" style={[styles.bgIcon, { top: '10%', left: '15%' }]} />
                    <MaterialCommunityIcons name="book-open-variant" size={26} color="rgba(79, 70, 229, 0.35)" style={[styles.bgIcon, { bottom: '10%', right: '15%' }]} />
                    <MaterialCommunityIcons name="medical-bag" size={26} color="rgba(79, 70, 229, 0.35)" style={[styles.bgIcon, { top: '10%', right: '15%' }]} />
                    <MaterialCommunityIcons name="star" size={26} color="rgba(79, 70, 229, 0.35)" style={[styles.bgIcon, { bottom: '10%', left: '15%' }]} />
                </Animated.View>

                <Image
                    source={land}
                    style={styles.graphicImage}
                    resizeMode="contain"
                />
            </Animated.View>

            {/* Marquee Banner Section (FADE EFFECT APPLIED) */}
            <Animated.View style={[styles.marqueeWrapper, { opacity: fadeAnim }]}>

                {/* Scrolling Text Layer */}
                <Animated.View style={{
                    flexDirection: 'row',
                    width: 9999, // 👉 FIX 1: Infinite space taaki text dab kar niche na aaye
                    transform: [{ translateX: marqueeScroll }]
                }}>
                    <Text
                        numberOfLines={1} // 👉 FIX 2: Text ko ek hi line mein force karega
                        onLayout={(e) => setTextWidth(e.nativeEvent.layout.width)}
                        style={[styles.marqueeText, { paddingRight: 50 }]} // Thoda gap pehle aur dusre text ke beech
                    >
                        {MARQUEE_TEXT}
                    </Text>

                    <Text
                        numberOfLines={1}
                        style={[styles.marqueeText, { paddingRight: 50 }]}
                    >
                        {MARQUEE_TEXT}
                    </Text>
                </Animated.View>

                {/* LEFT FADE GRADIENT */}
                <LinearGradient
                    colors={['#E0E7FF', 'rgba(224, 231, 255, 0)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.fadeLeft}
                    pointerEvents="none"
                />

                {/* RIGHT FADE GRADIENT */}
                <LinearGradient
                    colors={['rgba(224, 231, 255, 0)', '#E0E7FF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.fadeRight}
                    pointerEvents="none"
                />

            </Animated.View>

            {/* Text Content */}
            <Animated.View style={[styles.textContainer, { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] }]}>
                <Text style={styles.mainHeading}>COUNSELLING WITH</Text>
                <Text style={styles.mainHeading}>CONFIDENCE</Text>

                <Text style={styles.description}>
                    Find clarity and assurance at{'\n'}every step of your journey.
                </Text>
            </Animated.View>

            {/* Bottom Controls (Pagination & Button) */}
            <Animated.View style={[styles.bottomContainer, { opacity: fadeAnim }]}>


                {/* <TouchableOpacity style={styles.button} activeOpacity={0.8}>
                    <Text style={styles.buttonText}>GET STARTED</Text>
                </TouchableOpacity> */}
            </Animated.View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 50,
    },
    brandTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#4F46E5',
        letterSpacing: 2,
        textShadowColor: 'rgba(79, 70, 229, 0.25)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 8,
        marginTop: 20,
    },
    imageContainer: {
        width: width * 0.85,
        height: width * 0.85,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    revolvingIconsContainer: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bgIcon: {
        position: 'absolute',
    },
    graphicImage: {
        width: '100%',
        height: '100%',
        zIndex: 10,
    },

    // 🔥 UPDATED MARQUEE STYLES 
    marqueeWrapper: {
        width: '100%',
        backgroundColor: '#E0E7FF',
        paddingVertical: 10, // Thoda extra padding diya premium look ke liye
        overflow: 'hidden',
        position: 'relative', // 👈 Zaroori hai LinearGradient ke absolute position ke liye
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#C7D2FE',
        marginBottom: 10,
    },
    marqueeText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#3730A3',
        letterSpacing: 0.8,
        paddingHorizontal: 20, // 👈 Padhne me clear lage
    },
    fadeLeft: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 40,
        zIndex: 2,
    },
    fadeRight: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: 40,
        zIndex: 2,
    },

    textContainer: {
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    mainHeading: {
        fontSize: 22,
        fontWeight: '800',
        color: '#312E81',
        letterSpacing: 1,
        textAlign: 'center',
    },
    description: {
        fontSize: 15,
        color: '#475569',
        textAlign: 'center',
        marginTop: 10,
        lineHeight: 22,
        fontWeight: '500',
    },
    bottomContainer: {
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 40,
        marginBottom: 20,
    },
    pagination: {
        flexDirection: 'row',
        marginBottom: 0,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#C7D2FE',
        marginHorizontal: 5,
    },
    activeDot: {
        backgroundColor: '#4F46E5',
        width: 20,
        height: 8,
        borderRadius: 4,
    },
    button: {
        backgroundColor: '#4F46E5',
        width: '100%',
        paddingVertical: 16,
        marginTop: 20,
        borderRadius: 30,
        alignItems: 'center',
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1.5,
    }
});