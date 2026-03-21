import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  role: null, 
  isAuthenticated: false,
  userData: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Role change karne ka function (Login se pehle toggle ke liye)
    changeRole: (state, action) => {
      state.role = action.payload;
    },
    
    // User login function
    login: (state, action) => {
      state.isAuthenticated = true;
      state.userData = action.payload;
      
      // 👉 FIX 1: Payload (userData) ke andar jo role hai, usko bhi state me set karna zaroori hai!
      if (action.payload && action.payload.role) {
        state.role = action.payload.role;
      }
    },

    // User logout function
    logout: (state) => {
      state.isAuthenticated = false;
      state.role = null; 
      state.userData = null;
    },
  },
});

export const { changeRole, login, logout } = authSlice.actions;
export default authSlice.reducer;