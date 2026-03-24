import AsyncStorage from "@react-native-async-storage/async-storage";
import { Axios } from "../constants/MainContent";


export const loginMentor = async (payload) => {
    try {
        const res = await Axios.post("/mentor/login", payload);
        return { success: true, data: res.data, token: res.data.token }
    } catch (err) {
        console.log("API ERR", err);
        const errorMsg = err.response?.data?.message || err.message || "Register failed";
        return { success: false, message: errorMsg };
    }
}

export const getMentorProfile = async () => {
    try {
        const response = await Axios.get("/mentor/profile");
        return response.data;
    } catch (error) {
        throw (
            error.response?.data || error.message || "Failed to fetch mentor profile"
        );
    }
};

export const UpdateMentorProfile = async (payload) => {
    try {
        const res = await Axios.put("/mentor/update-profile", payload);
        return { success: true, data: res.data }
    } catch (err) {
        console.log("API ERR", err);
        const errorMsg = err.response?.data?.message || err.message || "update failed";
        return { success: false, message: errorMsg};
    }
}
// Make sure to import your config/baseURL if you have one!


export const UpdateMentorProfilePic = async (payload) => {
    try {
        const res = await Axios.put("/mentor/update-profile-picture", payload);
        return { success: true, data: res.data }
    } catch (err) {
        console.log("API ERR", err);
        const errorMsg = err.response?.data?.message || err.message || "update profile pic failed";
        return { success: false, message: errorMsg};
    }
}


export const getMentorBookings = async () =>{
    try{
        const res  = await Axios.get("/mentor/get-mentor-bookings");
        return {success:true,data:res.data}
    }catch(err){
        console.log("API ERR",err);
        const errorMsg = err.response?.data?.message || err.message || "update profile pic failed";
        return { success: false, message: errorMsg};

    }
}

export const getBanner = async () =>{
    try{
        const res  = await Axios.get("/mentor/all-banners");
        return {success:true,data:res.data}
    }catch(err){
        console.log("API ERR",err);
        const errorMsg = err.response?.data?.message || err.message || "update profile pic failed";
        return { success: false, message: errorMsg};

    }
}
