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

export const UpdateCart = async (payload) => {
  try {
    const res = await Axios.put(`/user/update-cart/update`, payload);
    return res.data;
  } catch (err) {
    // FIX: err.res ki jagah err.response hoga
    throw err.response?.data || err.message || "Failed to Update";
  }
}

// ✅ Corrected Service
export const DeleteCart = async (bookId, type) => {
  try {
    // URL: /user/remove-cart/remove/12345
    // Body: { type: "hardcover" }
    const res = await Axios.delete(`/user/remove-cart/remove/${bookId}`, {
      data: { type } 
    });
    return res.data;
  } catch (err) {
    throw err.response?.data || err.message || "Failed to Delete";
  }
}



export const addAdress = async (payload) => {
  try {
    const res = await Axios.post(`/user/add-address/add`, payload);
    return res.data;
  } catch (err) {
    // FIX: err.res ki jagah err.response hoga
    throw err.response?.data || err.message || "Failed to add adress";
  }
}

export const getAddress = async () => {
  try {
    const res = await Axios.get(`/user/get-address`);
    return res.data;
  } catch (err) {
    // FIX: err.res ki jagah err.response hoga
    throw err.response?.data || err.message || "Failed to get Address";
  }
}


export const defaultAddress = async (id) => {
  try {
    const res = await Axios.put(`/user/address/default/${id}`);
    return res.data;
  } catch (err) {
    // FIX: err.res ki jagah err.response hoga
    throw err.response?.data || err.message || "Failed to load";
  }
}



export const allMentor = async () =>{
  try{
    // 👉 Add 'await' right before Axios.get
    const response = await Axios.get("/user/all-mentors");
    // Now 'response' is the actual data, not a pending Promise!
    return response.data; 
  } catch(error){
    throw error.response?.data || error.message || "failed to load";
  }
}


export const BookMentor = async (payload) =>{
  try{
    // 👉 Add 'await' right before Axios.get
    const response = await Axios.post("/user/book-mentor",payload);
    // Now 'response' is the actual data, not a pending Promise!
    return response.data; 
  } catch(error){
    throw error.response?.data || error.message || "failed to load";
  }
}


export const verifyMentorbooking = async (payload) =>{
  try{
    // 👉 Add 'await' right before Axios.get
    const response = await Axios.post("/user/verify-mentor-booking",payload);
    // Now 'response' is the actual data, not a pending Promise!
    return response.data; 
  } catch(error){
    throw error.response?.data || error.message || "failed to load";
  }
}


export const getMentorBooking = async () =>{
  try{
    // 👉 Add 'await' right before Axios.get
    const response = await Axios.get("/user/get-mentor-bookings");
    // Now 'response' is the actual data, not a pending Promise!
    return response.data; 
  } catch(error){
    throw error.response?.data || error.message || "failed to load";
  }
}






