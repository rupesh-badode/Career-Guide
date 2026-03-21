import { Axios } from "../constants/MainContent";

export const getBooks = async()=>{
  try{
    const res  = await Axios.get(`/user/get-books`);
    return res.data;
  }catch(err){
    throw err.res?.data|| err.message||"Failed to Load";
  }
}

export const getSinglebook = async(payload)=>{
  try{
    const res  = await Axios.get(`/user/get-book/${payload}`);
    return res.data;
  }catch(err){
    throw err.res?.data|| err.message||"Failed to Load";
  }
}


