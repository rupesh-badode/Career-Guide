
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import Index from "./user/home/Home";
import Chat from "./user/chat/Chat";
import NewsScreen from "./user/news/NewsList";
import BlogScreen from "./user/blog/BlogScreen";
import AppointmentSreen from "./user/appointment/AppointmentScreen";
import CounselorDashboard from "./counsellor/dashboard/CounselorDashboard";
import CounselorChat from "./counsellor/chat/CounselorChat";
import ManageAppointments from "./counsellor/manageappoinment/ManageAppointments";
import ProfileScreen from "../../src/components/common/ProfileScreen";
import { Platform, StyleSheet, View } from "react-native";
import CustomHeader from "../../src/components/common/CustomHeader";
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';


// ==============================
export default  function TabNavigatorGroup() {
    const Tab = createBottomTabNavigator();
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


