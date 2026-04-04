import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DeviceEventEmitter } from "react-native";

export const backendConfig = {

  // base: "https://api.astroneet.com/api",
  // origin: "https://api.astroneet.com/",

  base: "http://192.168.29.89:8089/api",
  origin: "http://192.168.29.89:8089",

  // base: "http://172.20.10.3:8089/api",`
  // origin: "http://172.20.10.3:8089",

  // base:"https://wjrr9w10-8089.inc1.devtunnels.ms/api",
  // origin:"https://wjrr9w10-8089.inc1.devtunnels.ms/",
};

export const key_id = "rzp_test_SKHLTVEeuNLZs3"; 

export const Axios = axios.create({
  baseURL: backendConfig.base,
  withCredentials: true,
});


Axios.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("userToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ cache disable
    config.headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
    config.headers["Pragma"] = "no-cache";
    config.headers["Expires"] = "0";

    return config;
  },
  (error) => Promise.reject(error)
);


Axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized: Token expired. Logout user here...");
      if (Platform.OS !== 'web') {
          DeviceEventEmitter.emit('auth_logout'); 
      } else {
          // Web ke liye simple alert ya window redirect
          alert("Session Expired. Please reload.");
          // window.location.reload(); // Optional for web
      }
    }
    return Promise.reject(error);
  }
);