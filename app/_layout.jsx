import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform, Animated, ImageComponent } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

// --- REDUX IMPORTS ---
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store, persistor } from '../src/redux/store';

// --- SCREEN IMPORTS ---
import ProfileScreen from '../src/components/common/ProfileScreen';
import CustomHeader from '../src/components/common/CustomHeader';
import Index from './tabs/user/home/Home';
import Chat from './tabs/user/chat/Chat';
import CounselorProfile from '../src/components/common/CounselorProfile';
import AppointmentSreen  from './tabs/user/appointment/AppointmentScreen';

import CounselorDashboard from './tabs/counsellor/dashboard/CounselorDashboard';
import ManageAppointments from './tabs/counsellor/manageappoinment/ManageAppointments';
import CounselorChat from './tabs/counsellor/chat/CounselorChat';
import RegisterScreen from './auth/SignUp';
import SplashScreen from './SplashScreen';
import OtpVerification from './auth/OtpVerification';
import LoginScreen from './auth/Login';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login } from '../src/redux/authSlice';
import ForgotPassword from './auth/ForgotPassword';
import ResetPassword from './auth/ResetPassword';
import ProfileDetailsList from './tabs/user/profile.jsx/ProfileDetailsList';
import EditProfileScreen from '../src/components/common/EditProfileScreen';
import { getConsultantProfile } from '../src/services/consultantAPI';
import ConsultProfileDetails from './tabs/counsellor/profile/ContsultProfileDetails';
import { PersistGate } from 'redux-persist/integration/react';
import BookingScreen from './tabs/user/razor pay/BookingScreen';
import BookingSuccess from './tabs/user/razor pay/BookingSuccess';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import KycScreen from './tabs/counsellor/profile/KycScreen';
import KycDetailsScreen from './tabs/counsellor/profile/KycDetails';

import NewsScreen from './tabs/user/news/NewsScreen';
import BlogScreen from './tabs/user/blog/BlogScreen';
import ChatScreen from '../src/components/common/ChatScreen';
import StudentProfile from './tabs/counsellor/chat/StudentProfile';
import LegalScreen from './tabs/user/profile.jsx/LegalScreen';
import VideoCallScreen from '../src/components/common/VideoCallScreen';
import MyBooksList from './tabs/user/home/MyBooksList';
import SingleBookScreen from './tabs/user/home/SingleBookScreen';
import CartScreen from './tabs/user/profile.jsx/CartScreen';

// 👉 YAHAN APNI REGISTER/LOGIN SCREEN IMPORT KAREIN

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();



// ==============================
// 2. TABS NAVIGATOR COMPONENT (Same as before)
// ==============================
function TabNavigatorGroup() {
    const { role, userData } = useSelector((state) => state.auth);
    const currentName = userData?.name || "name";
    const currentEmail = userData?.email || "";
    const insets = useSafeAreaInsets();


    return (
        <Tab.Navigator
            screenListeners={{
                tabPress: () => {
                    if (Platform.OS !== "android") {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                }
            }}
            screenOptions={({ route, navigation }) => ({
                header: () => (
                    <CustomHeader
                        role={role}
                        userName={currentName}
                        notificationCount={3}
                        routeName={route.name}
                        onBackPress={() => navigation.goBack()}
                        onProfilePress={() => navigation.navigate('Profile')}
                    />
                ),
                tabBarIcon: ({ color, size, focused }) => {
                    let iconName;
                    const routeName = route.name;

                    if (routeName === 'Home' || routeName === 'Dashboard') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (routeName === "Chat") {
                        iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
                    } else if (routeName === "News") {
                        iconName = focused ? 'newspaper' : 'newspaper-outline';
                    } else if (routeName === "Blogs") {
                        iconName = focused ? 'reader' : 'reader-outline';
                    } else if (routeName === 'Appointments' || routeName === 'Requests') {
                        iconName = focused ? 'calendar' : 'calendar-outline';
                    } else if (routeName === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    // Size adjustment for a "pop" effect on focused icon
                    return <Ionicons name={iconName || "ellipse"} size={focused ? size + 2 : size} color={color} />;
                },
                tabBarActiveTintColor: role === 'Consultant' ? '#10B981' : '#4F46E5',
                tabBarInactiveTintColor: '#4f4f51',
                tabBarStyle: {
                    position: 'absolute', bottom: 0, left: 0, right: 0, elevation: 0, borderTopWidth: 0,
                    backgroundColor: 'transparent', height: Platform.OS === 'ios' ? 85 : 70,
                    paddingBottom: Platform.OS === 'ios' ? 10 : 10,
                },
                tabBarLabelStyle: { fontSize: 11, fontWeight: '500', marginBottom: insets.bottom > 0 ? 0 : 0 },
                tabBarBackground: () => (
                    <View style={StyleSheet.absoluteFill}>
                        <BlurView
                            tint="light"
                            intensity={80}
                            style={[StyleSheet.absoluteFill, { backgroundColor: "white" }]}
                        />
                    </View>
                ),
            })}
        >
            {role === 'User' ? (
                <>
                    <Tab.Screen name="Home" component={Index} />
                    <Tab.Screen name="Chat" component={Chat} />
                    <Tab.Screen name='News' component={NewsScreen} />
                    <Tab.Screen name='Blogs' component={BlogScreen} />
                    <Tab.Screen name="Appointments" component={AppointmentSreen} />
                </>
            ) : (
                <>
                    <Tab.Screen name="Dashboard" component={CounselorDashboard} />
                    <Tab.Screen name='Chat' component={CounselorChat} />
                    <Tab.Screen name="Requests" component={ManageAppointments} />
                </>
            )}
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

// ==============================
// 3. MAIN APP NAVIGATOR (With Splash & Auth Guard)
// ==============================
function AppNavigator() {
    // REDUX STATES
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

    // LOCAL SPLASH STATE
    const [isSplashReady, setIsSplashReady] = useState(true);
    const dispatch = useDispatch();
    // AppNavigator ke andar ka useEffect
    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                const userDataString = await AsyncStorage.getItem("userData"); // Yahan await lagana mat bhulna!

                if (token && userDataString) {
                    const parsedUserData = JSON.parse(userDataString); // String ko wapas Object banaya

                    // Yeh parsedUserData me role = "User" ya "Consultant" exact aayega
                    dispatch(login(parsedUserData));
                }
            } catch (error) {
                console.log("Error restoring session:", error);
            } finally {
                setTimeout(() => {
                    setIsSplashReady(false);
                }, 2000);
            }
        };

        checkLoginStatus();
    }, [dispatch]);


    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>

                {/* Condition 1: Agar splash screen ka time chal raha hai */}
                {isSplashReady ? (
                    <Stack.Screen name="Splash" component={SplashScreen} />
                ) :

                    /* Condition 2: Agar user Login NAHI hai */
                    !isAuthenticated ? (
                        <>
                            <Stack.Screen name='Login' component={LoginScreen} />
                            <Stack.Screen name="Register" component={RegisterScreen} />
                            <Stack.Screen name='OtpVerification' component={OtpVerification} />
                            <Stack.Screen name='ForgetPassword' component={ForgotPassword} />
                            <Stack.Screen name='ResetPassword' component={ResetPassword} />

                            {/* Aap yahan Login screen bhi add kar sakte hain */}
                        </>
                    ) :
                        /* Condition 3: Agar user Login HAI */
                        (
                            <>
                                <Stack.Screen name="MainTabs" component={TabNavigatorGroup} />
                                <Stack.Screen name="CounselorProfile" component={CounselorProfile} />
                                <Stack.Screen name='ChatScreen' component={ChatScreen} />
                                <Stack.Screen name='EditProfile' component={EditProfileScreen} />
                                <Stack.Screen name="ProfileDetail" component={ProfileDetailsList} />
                                <Stack.Screen name='ConsultProfileDetails' component={ConsultProfileDetails} />
                                <Stack.Screen name='StudentProfile' component={StudentProfile} />
                                <Stack.Screen name='BookingScreen' component={BookingScreen} />
                                <Stack.Screen name="BookingSuccess" component={BookingSuccess} header={{ headerShown: false }} />
                                <Stack.Screen name='VideoCall' component={VideoCallScreen} />
                                <Stack.Screen name='KycScreen' component={KycScreen} />
                                <Stack.Screen name='KycDetails' component={KycDetailsScreen} />
                                <Stack.Screen name='LegalScreen' component={LegalScreen} />
                                <Stack.Screen name='AllBooks' component={MyBooksList} />
                                <Stack.Screen name='SingleBook' component={SingleBookScreen} />
                                <Stack.Screen name='CartScreen' component={CartScreen} />
                            </>
                        )}

            </Stack.Navigator>
        </NavigationContainer>
    );
}

// ==============================
// 4. WRAP WITH REDUX PROVIDER
// ==============================
export default function MainLayout() {
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor} >
                <AppNavigator />
            </PersistGate>
        </Provider>
    );
}

// ==============================
// STYLES FOR SPLASH SCREEN
// ==============================
const styles = StyleSheet.create({
    splashContainer: {
        flex: 1,
        backgroundColor: '#3B82F6', // Blue background
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    splashTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: 1,
    },
    splashSubtitle: {
        fontSize: 14,
        color: '#E0E7FF',
        marginTop: 8,
        fontWeight: '500',
    }
});