import { Axios } from "../constants/MainContent"


export const createBooking = async (bookingData) =>{
    try{
        const res = await Axios.post("/user/create-booking",bookingData);
        return res.data;
    }catch(err){
        throw err.res?.data || err.message || "Failed to create booking";
    }
}


export const verifyBookingPayment = async (paymentData) =>{
    try{
        const res = await Axios.post("/user/verify-booking-payment",paymentData);
        return res.data;
    }catch(err){
        throw err.res?.data || err.message || "Failed to verifying";
    }
}
