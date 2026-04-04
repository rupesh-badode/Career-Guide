import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// App open hone par bhi notification dikhane ka setup
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});


const triggerLocalNotification = async (bookingDate, bookingTime) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🎉 New Booking Confirmed!",
      body: `You have a new session scheduled on ${bookingDate} at ${bookingTime}.`,
      data: { route: 'BookingDetails' }, // Notification pe click karne pe kahan jana hai
    },
    trigger: null, // null matlab turant bhejo
  });
};

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#10B981', // Tumhara Emerald Green theme
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }

    try {
      // Expo project ID extract karna (app.json se)
      const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log("Expo Push Token:", token);
    } catch (e) {
      console.log("Token Fetch Error:", e);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}


export const scheduleMeetingReminder = async (bookingData) => {
  try {
    // 1. Notification Permission Check karna
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Notification permission denied!');
      return;
    }

    // 2. Exact Meeting ka Time nikalna
    const meetingDate = getMeetingDateTime(bookingData.date, bookingData.time);
    
    // 3. Meeting se 10 minute (10 * 60 * 1000 ms) pehle ka time calculate karna
    const reminderTime = new Date(meetingDate.getTime() - 10 * 60 * 1000);

    // 4. Check karna ki ye reminder time past mein toh nahi chala gaya
    if (reminderTime > new Date()) {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "⏳ Meeting Starting in 10 Minutes!",
          body: `Be ready! Your consultation is scheduled at ${bookingData.time}. Tap to open meeting link.`,
          data: { meetingLink: bookingData.meetingLink }, // User tap karega toh ye link app me mil jayega
        },
        trigger: {
          date: reminderTime, // Notification is exact time par aayega
        },
      });
      console.log("✅ Reminder set successfully for:", reminderTime, "Notification ID:", id);
    } else {
      console.log("⚠️ Meeting time is too close, cannot set 10 min reminder.");
    }
  } catch (error) {
    console.log("❌ Error scheduling notification:", error);
  }
};