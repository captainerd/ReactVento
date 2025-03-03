import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    entries: {}, // Initial state for language entries
};
const languageSlice = createSlice({
    name: 'language', // This must match the key in your store configuration
    initialState,
    reducers: {
        setUpCollection: (state, action) => {

            state.entries = action.payload;
        }
    },
});

export const { setUpCollection } = languageSlice.actions;
export default languageSlice.reducer;
export const selectLanguage = () => (state) => state.language.entries;