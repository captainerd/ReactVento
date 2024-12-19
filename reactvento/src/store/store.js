// src/store/store.js
import { configureStore } from '@reduxjs/toolkit';

import userInfoReducer from './slices/userInfoSlice';
import cartReducer from './slices/cartSlice';
import languageReducer from './slices/languageSlice';
import successReducer from './slices/successCheckoutSlice';


const store = configureStore({
    reducer: {
        cart: cartReducer,
        language: languageReducer,
        successSlice: successReducer,
        userInfo: userInfoReducer,
    },
});

export default store;
