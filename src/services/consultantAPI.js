import { Axios } from "../constants/MainContent";


export const LoginConsultant = async (payload) => {
    try {
        const res = await Axios.post("/consultant/login", payload);
        return { success: true, data: res.data, token: res.data.token }
    } catch (err) {
        console.log("API ERR", err);
        const errorMsg = err.response?.data?.message || err.message || "Login failed";
        return { success: false, message: errorMsg };
    }
}

export const getConsultantProfile = async () => {
  try {
    const response = await Axios.get("/consultant/profile");
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || error.message || "Failed to fetch user profile"
    );
  }
};

export const UpdateConsultantProfile = async (payload) => {
    try {
        const res = await Axios.put("/consultant/update-profile", payload);
        return { success: true, data: res.data }
    } catch (err) {
        console.log("API ERR", err);
        const errorMsg = err.response?.data?.message || err.message || "update failed";
        return { success: false, message: errorMsg };
    }
}

export const updateConsultantProfilePicture = async (payload) => {
    try {
        const res = await Axios.put("/consultant/update-profile-picture", payload);
        return { success: true, data: res.data }
    } catch (err) {
        console.log("API ERR", err);
        const errorMsg = err.response?.data?.message || err.message || "update failed";
        return { success: false, message: errorMsg };
    }
}


export const myBooking = async (payload) => {
    try {
        // ✅ Fix 1: Added 'const' and used '{ params: payload }' for GET requests
        const res = await Axios.get("/consultant/my-bookings", { params: payload });
        return { success: true, data: res.data };
    } catch (err) {
        // ✅ Fix 2: Changed 'console' to 'console.error'
        console.error("API err", err); 
        const errmsg = err.response?.data?.message || err.message || "Failed to Load";
        
        // ✅ Fix 3: Returned the error object so the UI knows it failed
        return { success: false, message: errmsg }; 
    }
}

export const ConsultantchatHistory = async(consultationId) => {
  try{
    // ✅ Backticks (`) aur ${} ka use karein
    const res = await Axios.get(`/consultant/chat/${consultationId}`); 
    return res.data;
  }catch(err){
    throw err.res?.data|| err.message||"Failed to Load";
  }
}



export const CreateKYC = async(payload) => {
    try {
        const res = await Axios.post("/consultant/create-kyc", payload);
        return { success: true, data: res.data };
    } catch (err) {
        console.error("API ERR", err);
        const errorMsg = err.response?.data?.message || err.message || "KYC creation failed";
        return { success: false, message: errorMsg };
    }
}

export const UpdatedKYC = async(payload) => {
    try {
        const res = await Axios.put("/consultant/update-kyc", payload);
        return { success: true, data: res.data };
    } catch (err) {
        console.error("API ERR", err);
        const errorMsg = err.response?.data?.message || err.message || "KYC update failed";
        return { success: false, message: errorMsg };
    }
}

export const getMyKYC = async () => {
    try {
        const res = await Axios.get("/consultant/get-kyc");
        return { success: true, data: res.data };
    } catch (err) {
        console.error("API ERR", err);
        const errorMsg = err.response?.data?.message || err.message || "Failed to fetch KYC";
        return { success: false, message: errorMsg };
    }
}



