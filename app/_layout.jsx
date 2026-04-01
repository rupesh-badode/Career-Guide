import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// --- REDUX IMPORTS ---
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store, persistor } from '../src/redux/store';
import { login } from '../src/redux/authSlice';
import { PersistGate } from 'redux-persist/integration/react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- NOTIFICATION & SOCKET IMPORTS ---
import * as Notifications from 'expo-notifications';
import io from 'socket.io-client';
import { backendConfig } from '../src/constants/MainContent';

// --- SCREEN IMPORTS ---
import CounselorProfile from '../src/components/common/CounselorProfile';
import RegisterScreen from './auth/SignUp';
import SplashScreen from './SplashScreen';
import OtpVerification from './auth/OtpVerification';
import LoginScreen from './auth/Login';
import ForgotPassword from './auth/ForgotPassword';
import ResetPassword from './auth/ResetPassword';
import ProfileDetailsList from './tabs/user/profile.jsx/ProfileDetailsList';
import EditProfileScreen from '../src/components/common/EditProfileScreen';
import ConsultProfileDetails from './tabs/counsellor/profile/ContsultProfileDetails';
import BookingScreen from './tabs/user/razor pay/BookingScreen';
import BookingSuccess from './tabs/user/razor pay/BookingSuccess';
import KycScreen from './tabs/counsellor/profile/KycScreen';
import KycDetailsScreen from './tabs/counsellor/profile/KycDetails';
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
import BlogDetails from './tabs/user/blog/BlogDetails';
import MentorBlog from './tabs/mentor/blog/AnimatedBlogCard';
import WelcomeScreen from './WelcomeScreen';
import ChangePasswordScreen from './auth/ChangePasswordScreen';
import AudioCallScreen from '../src/components/common/AudioCallScreen';
import CheckoutButton from './tabs/user/profile.jsx/CheckoutButton';
import IncomingCallModal from '../src/components/common/IncomingCallModal';
import MentorProfileDetails from './tabs/mentor/profile/MentorProfileDetails';
import NewsScreen from './tabs/user/news/NewsList';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const SOCKET_URL = backendConfig.origin;
let globalSocket; 

// 👉 1. GLOBAL NAVIGATION REF BANAYI HAI
export const navigationRef = createNavigationContainerRef();

// ==============================
// 3. MAIN APP NAVIGATOR
// ==============================
function AppNavigator() {
  const dispatch = useDispatch();
  
  const [incomingCall, setIncomingCall] = useState(null);
  const authState = useSelector((state) => state.auth);
  const isAuthenticated = authState.isAuthenticated;
  const myUserId = authState?.userData?._id || authState?.consultantData?._id || authState?._id; 

  const [isSplashReady, setIsSplashReady] = useState(true);

  // ⚡ CHECK LOGIN SESSION
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const userDataString = await AsyncStorage.getItem("userData");

        if (token && userDataString) {
          const parsedUserData = JSON.parse(userDataString);
          dispatch(login(parsedUserData));
        }
      } catch (error) {
        console.log("Error restoring session:", error);
      } finally {
        setTimeout(() => setIsSplashReady(false), 2000);
      }
    };
    checkLoginStatus();
  }, [dispatch]);

  // ⚡ GLOBAL SOCKET CONNECTION FOR NOTIFICATIONS & CALLS
  useEffect(() => {
    if (!myUserId) return; 

    globalSocket = io(SOCKET_URL, { transports: ['websocket'] });

    globalSocket.on('connect', () => {
      console.log("🌍 Global Socket Connected!");
      globalSocket.emit('joinUserRoom', myUserId); 
    });

    globalSocket.on('new_booking_received', (bookingData) => {
      if (bookingData.status === 'confirmed') {
        Notifications.scheduleNotificationAsync({
          content: {
            title: "Session Confirmed! ✅",
            body: "You have a new scheduled session.",
            sound: true,
          },
          trigger: null,
        });
      }
    });

    globalSocket.on('new_message_received', (messageData) => {
      Notifications.scheduleNotificationAsync({
        content: {
          title: "New Message 📩",
          body: messageData?.message || "You received a new message.",
          sound: true,
        },
        trigger: null,
      });
    });

    // 🔥 INCOMING CALL LISTENER
    globalSocket.on("incoming-call", (data) => {
      setIncomingCall({
        visible: true,
        callerName: data.callerName,
        callerAvatar: data.avatar,
        callType: data.type,
        roomName: data.roomName
      });
    });

    return () => {
      if (globalSocket) {
        globalSocket.disconnect();
      }
    };
  }, [myUserId]);

  // 👉 2. HANDLERS KO USEEFFECT SE BAHAR NIKALA
  const handleAcceptCall = () => {
    const callData = { ...incomingCall };
    setIncomingCall(null);

    // Global navigation ref se navigate karenge
    if (navigationRef.isReady()) {
      navigationRef.navigate(callData.callType === 'audio' ? 'AudioCall' : 'VideoCall', { 
        roomName: callData.roomName 
      });
    }
  };

  const handleRejectCall = () => {
    setIncomingCall(null);
    if (globalSocket) {
      globalSocket.emit("reject-call", { roomName: incomingCall?.roomName });
    }
  };

  // ==============================
  // UI RENDER
  // ==============================
  return (
    <>
      {/* 👉 NavigationContainer me ref pass kiya */}
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isSplashReady ? (
            <Stack.Screen name="Splash" component={SplashScreen} />
          ) : !isAuthenticated ? (
            <>
              <Stack.Screen name='WelcomeScreen' component={WelcomeScreen} />
              <Stack.Screen name='Login' component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name='OtpVerification' component={OtpVerification} />
              <Stack.Screen name='ForgetPassword' component={ForgotPassword} />
              <Stack.Screen name='ResetPassword' component={ResetPassword} />
            </>
          ) : (
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
              <Stack.Screen name='AudioCall' component={AudioCallScreen} />
              <Stack.Screen name='KycScreen' component={KycScreen} />
              <Stack.Screen name='KycDetails' component={KycDetailsScreen} />
              <Stack.Screen name='LegalScreen' component={LegalScreen} />
              <Stack.Screen name='AllBooks' component={MyBooksList} />
              <Stack.Screen name='SingleBook' component={SingleBookScreen} />
              <Stack.Screen name='CartScreen' component={CartScreen} />
              <Stack.Screen name='AddAddress' component={AddAddress} />
              <Stack.Screen name='AllMentor' component={AllMentorsScreen} />
              <Stack.Screen name='MentorChatList' component={MentorChatList} />
              <Stack.Screen name="Blogs" component={BlogScreen} />
              <Stack.Screen name='BlogDetails' component={BlogDetails} />
              <Stack.Screen name='MentorBlog' component={MentorBlog} />
              <Stack.Screen name='ChangePassword' component={ChangePasswordScreen} />
              <Stack.Screen name='CheckoutButton' component={CheckoutButton} />
              <Stack.Screen name='MentorProfileDetails' component={MentorProfileDetails} />
              <Stack.Screen name='News' component={NewsScreen} />

            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>

      {/* 👉 3. MODAL KO APP NAVIGATOR KE ANDAR RAKHA */}
      {incomingCall && (
        <IncomingCallModal
          visible={incomingCall.visible}
          callerName={incomingCall.callerName}
          callerAvatar={incomingCall.callerAvatar}
          callType={incomingCall.callType}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
        />
      )}
    </>
  );
}

// ==============================
// 4. MAIN LAYOUT WRAPPER
// ==============================
export default function MainLayout() {
  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text>Loading App...</Text>
          </View>
        }
        persistor={persistor}
      >
        <AppNavigator />
      </PersistGate>
    </Provider>
  );
}