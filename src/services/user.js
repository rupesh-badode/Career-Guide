import axios from "axios";
import { Axios } from "../constants/MainContent";



export const AllConsultant = async () =>{
  try{
    // 👉 Add 'await' right before Axios.get
    const response = await Axios.get("/user/all-consultant");
    
    // Now 'response' is the actual data, not a pending Promise!
    return response.data; 
  } catch(error){
    throw error.response?.data || error.message || "failed to load";
  }
}



export const MyBookings = async () =>{
  try{
    // 👉 Add 'await' right before Axios.get
    const response = await Axios.get("/user/my-bookings");
    
    // Now 'response' is the actual data, not a pending Promise!
    return response.data; 
  } catch(error){
    throw error.response?.data || error.message || "failed to load";
  }
}


export const chatHistory = async(consultationId) => {
  try{
    // ✅ Backticks (`) aur ${} ka use karein
    const res = await Axios.get(`/user/chat/${consultationId}`); 
    return res.data;
  }catch(err){
    throw err.res?.data|| err.message||"Failed to Load";
  }
}

export const getWHONews = async()=>{
  try{
    const res  = await Axios.get(`/user/who-news`);
    return res.data;
  }catch(err){
    throw err.res?.data|| err.message||"Failed to Load";
  }
}

export const getBanners = async()=>{
  try{
    const res  = await Axios.get(`/user/all-banners`);
    return res.data;
  }catch(err){
    throw err.res?.data|| err.message||"Failed to Load";
  }
}

export const getBlogs = async()=>{
  try{
    const res  = await Axios.get(`/user/get-blogs`);
    return res.data;
  }catch(err){
    throw err.res?.data|| err.message||"Failed to Load";
  }
}


export const getLegal = async()=>{
  try{
    const res  = await Axios.get(`/user/active-legals`);
    return res.data;
  }catch(err){
    throw err.res?.data|| err.message||"Failed to Load";
  }
}


export const getCart = async()=>{
  try{
    const res  = await Axios.get(`/user/get-cart`);
    return res.data;
  }catch(err){
    throw err.res?.data|| err.message||"Failed to Load";
  }
}


export const AddtoCart = async (payload) => {
  try {
    const res = await Axios.post(`/user/cart/add`, payload);
    return res.data;
  } catch (err) {
    // FIX: err.res ki jagah err.response hoga
    throw err.response?.data || err.message || "Failed to add to cart";
  }
}


