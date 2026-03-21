import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistReducer, persistStore } from 'redux-persist'; // 👉 Import fix kiya

// 👉 FIX 2: Root Reducer banana zaroori hai agar aap whitelist me 'auth' use kar rahe ho
const rootReducer = combineReducers({
  auth: authReducer,
  // Future me agar cart ya chat reducer aaye, toh yahan aayega
});

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ['auth'], // Ab ye perfectly 'auth' slice ko target karega
};

// 👉 Ab hum directly authReducer ki jagah rootReducer ko persist karenge
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer, // 👉 Yahan direct persistedReducer daal diya
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);