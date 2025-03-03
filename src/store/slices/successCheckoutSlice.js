// src/store/slices/successCheckoutSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    showDialog: false,
    dialogMessage: {
        title: '',
        text_message: ''
    }
};

const successSlice = createSlice({
    name: 'success',
    initialState,
    reducers: {
        openDialog: (state, action) => {
            state.showDialog = true;
            state.dialogMessage = action.payload;
        },
        closeDialog: (state) => {
            state.showDialog = false;
            state.dialogMessage = {
                title: '',
                text_message: ''
            };
        }
    }
});

export const { openDialog, closeDialog } = successSlice.actions;
export const selectSuccess = (state) => state.successSlice;
export default successSlice.reducer;
