import { Axios } from "../constants/MainContent"


export const registerApi = async (payload) => {
    try {
        const res = await Axios.post("/user/register", payload);
        return { success: true, data: res.data, token: res.data.token }
    } catch (err) {
        console.log("API ERR", err);
        const errorMsg = err.response?.data?.message || err.message || "Login failed";
        return { success: false, message: errorMsg };
    }
}

export const loginApi = async (payload) => {
    try {
        const res = await Axios.post("/user/login", payload);
        return { success: true, data: res.data, token: res.data.token }
    } catch (err) {
        console.log("API ERR", err);
        const errorMsg = err.response?.data?.message || err.message || "Login failed";
        return { success: false, message: errorMsg };
    }
}

export const otpVerify = async (payload) => {
    try {
        const res = await Axios.post("/user/verify-otp", payload);
        return { success: true, data: res.data, token: res.data.token }
    } catch (err) {
        console.log("API ERR", err);
        const errorMsg = err.response?.data?.message || err.message || "OTP Verification failed";
        return { success: false, message: errorMsg };
    }
}

export const resendOtpApi = async (payload) => {
    try {
        const res = await Axios.post("/user/resend-otp", payload);
        return { success: true, data: res.data }
    } catch (err) {
        console.log("API ERR", err);
        const errorMsg = err.response?.data?.message || err.message || "Resend OTP failed";
        return { success: false, message: errorMsg };
    }
}

export const forgotPasswordApi = async (payload) => {
    try {
        const res = await Axios.post("/user/forgot-password", payload);
        return { success: true, data: res.data }
    } catch (err) {
        console.log("API ERR", err);
        const errorMsg = err.response?.data?.message || err.message || "Forgot Password failed";
        return { success: false, message: errorMsg };
    }
}
export const resetPasswordApi = async (payload) => {
    try {
        const res = await Axios.post("/user/reset-password", payload);
        return { success: true, data: res.data }
    } catch (err) {
        console.log("API ERR", err);
        const errorMsg = err.response?.data?.message || err.message || "Reset Password failed";
        return { success: false, message: errorMsg };
    }
}

export const getUserProfile = async () => {
    try {
        const response = await Axios.get("/user/profile");
        return response.data;
    } catch (error) {
        throw (
            error.response?.data || error.message || "Failed to fetch user profile"
        );
    }
};


export const UpdateProfile = async (payload) => {
    try {
        const res = await Axios.put("/user/update-profile", payload);
        return { success: true, data: res.data }
    } catch (err) {
        console.log("API ERR", err);
        const errorMsg = err.response?.data?.message || err.message || "update failed";
        return { success: false, message: errorMsg };
    }
}


export const ChangePassword = async (payload) => {
    try {
        const res = await Axios.post("/user/change-password", payload);
        return { success: true, data: res.data }
    } catch (err) {
        console.log("API ERR", err);
        const errorMsg = err.response?.data?.message || err.message || "update failed";
        return { success: false, message: errorMsg };
    }
}