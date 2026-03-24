import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform, Animated, ImageComponent } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


// --- REDUX IMPORTS ---
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store, persistor } from '../src/redux/store';

// --- SCREEN IMPORTS ---
import ProfileScreen from '../src/components/common/ProfileScreen';
import CustomHeader from '../src/components/common/CustomHeader';
import Index from './tabs/user/home/Home';
import Chat from './tabs/user/chat/Chat';
import CounselorProfile from '../src/components/common/CounselorProfile';
import AppointmentSreen from './tabs/user/appointment/AppointmentScreen';

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
import TabNavigatorGroup from './tabs/_layout';
import AddAddress from './tabs/user/profile.jsx/AddAddress';
import AllMentorsScreen from './tabs/user/mentor/AllMentorsScreen';
import MentorChatList from './tabs/user/mentor/MentorsChatList';

// 👉 YAHAN APNI REGISTER/LOGIN SCREEN IMPORT KAREIN

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();




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
                                <Stack.Screen name='AddAddress' component={AddAddress} />
                                <Stack.Screen name='AllMentor' component={AllMentorsScreen} />
                                <Stack.Screen name='MentorChatList' component={MentorChatList} />
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
            <PersistGate
                loading={
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                        <Text>Loading...</Text>
                    </View>
                }
                persistor={persistor}
            >
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