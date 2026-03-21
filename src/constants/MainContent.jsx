import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DeviceEventEmitter } from "react-native";

export const backendConfig = {

  // base: "http://192.168.29.89:8089/api",
  // origin: "http://192.168.29.89:8089",

  base: "http://192.168.29.234:8089/api",
  origin: "http://192.168.29.234:8089",

  

  // base:"https://wjrr9w10-8089.inc1.devtunnels.ms/api",
  // origin:"https://wjrr9w10-8089.inc1.devtunnels.ms",

};

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