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


export const UpdateMentorProfilePic = async (payload) => {
    try {
        const response = await Axios.put("/mentor/update-profile-picture", payload, {
            headers: {
                'Content-Type': 'multipart/form-data', // THIS IS MANDATORY FOR FILES
            },
        })
        return { success: response.ok, data: response.data }
    } catch (err) {
        console.log("Fetch Network Error:", err);
        return { success: false, message: err.message };
    }
}


export const getMentorBookings = async () =>{
    try{
        const res  = await Axios.get("/mentor/get-mentor-bookings");
        return {success:true,data:res.data}
    }catch(err){
        console.log("API ERR",err);
        const errorMsg = err.response?.data?.message || err.message || "failed";
        return { success: false, message: errorMsg};

    }
}

export const getBanner = async () =>{
    try{
        const res  = await Axios.get("/mentor/all-banners");
        return {success:true,data:res.data}
    }catch(err){
        console.log("API ERR",err);
        const errorMsg = err.response?.data?.message || err.message || "failed to load banners";
        return { success: false, message: errorMsg};

    }
}

export const getBlogs = async () =>{
    try{
        const res  = await Axios.get("/mentor/get-blogs");
        return {success:true,data:res.data}
    }catch(err){
        console.log("API ERR",err);
        const errorMsg = err.response?.data?.message || err.message || "failed to load Blogs";
        return { success: false, message: errorMsg};

    }
}

export const getMentorLegal = async () =>{
    try{
        const res  = await Axios.get("/mentor/active-legals");
        return {success:true,data:res.data}
    }catch(err){
        console.log("API ERR",err);
        const errorMsg = err.response?.data?.message || err.message || "failed to load Legals";
        return { success: false, message: errorMsg};

    }
}


export const CreateAvailability = async (payload) => {
    try {
        const res = await Axios.post("/mentor/create-availability", payload);
        return { success: true, data: res.data };
    } catch (err) {
        console.error("API ERR", err);
        const errorMsg = err.response?.data?.message || err.message || "Availability creation failed";
        return { success: false, message: errorMsg };
    }
}

export const getMyAvailblity = async () => {
    try{
        const res = await Axios.get("/mentor/my-availability");
        return { success: true, data: res.data };
    }catch(err){
        console.error("API ERR", err);
        const errorMsg = err.response?.data?.message || err.message || "Failed to fetch availability";
        return { success: false, message: errorMsg };
    }
}

export const UpdateAvailability = async (id, payload) => {
    try {
        // 👉 FIX: Axios.put mein doosra argument payload (body) hota hai
        const res = await Axios.put(`/mentor/update-availability/${id}`, payload);
        return { success: true, data: res.data };
    } catch (err) {
        console.error("API ERR", err);
        const errorMsg = err.response?.data?.message || err.message || "Availability update failed";
        return { success: false, message: errorMsg };
    }
}

export const DeleteDate = async (id) => {
    try {
        const res = await Axios.delete(`/mentor/delete-availability/${id}`);
        return { success: true, data: res.data };
    } catch (err) {
        console.error("API ERR", err);
        const errorMsg = err.response?.data?.message || err.message || "Availability deletion failed";
        return { success: false, message: errorMsg };
    }
}

export const DeleteSlot = async (payload) => {
    try {
        // 👉 FIX: Yahan dhyan se dekho, maine Axios.delete likha hai aur payload ko 'data' ke andar bheja hai.
        // (GET request me body nahi jaati, isiliye 404 aa raha tha)
        const res = await Axios.delete("/mentor/delete-particular-slot", {
            data: payload
        });
        
        return { success: true, data: res.data };
    } catch (err) {
        console.error("API ERR", err);
        const errorMsg = err.response?.data?.message || err.message || "Failed to delete slot";
        return { success: false, message: errorMsg };
    }
}

export const getDashboardStats = async () => {
    try {
        const res = await Axios.get("/mentor/dashboard-stats");
        return { success: true, data: res.data };
    } catch (err) {
        console.error("API ERR", err);
        const errorMsg = err.response?.data?.message || err.message || "Failed to fetch dashboard stats";
        return { success: false, message: errorMsg };
    }
}   

export const getSlots = async (payload) => {
  try {
    // payload me ab sirf { consultantId: "..." } aayega
    const res = await Axios.get(`/mentor/get-slots`, { params: payload });
    return res.data;
  } catch(err) {
    throw err.response?.data || err.message || "failed to load";
  }
}


