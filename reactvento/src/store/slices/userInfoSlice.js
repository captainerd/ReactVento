// features/userInfo/userInfoSlice.js

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    loggedIn: false,
    userData: null,
};

const userInfoSlice = createSlice({
    name: 'userInfo',
    initialState,
    reducers: {
        setUserInfo(state, action) {
            state.loggedIn = action.payload.loggedIn;
            state.userData = action.payload.userData || null;
        },
        clearUserInfo(state) {
            state.loggedIn = false;
            state.userData = null;
        },
    },
});

// Export actions
export const { setUserInfo, clearUserInfo } = userInfoSlice.actions;

// Export the reducer
export default userInfoSlice.reducer;
export const selectUserData = (state) => state.userInfo;