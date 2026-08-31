import { configureStore } from '@reduxjs/toolkit';
import chatReducer from './ChatSlice.js';

export const store = configureStore({
    reducer: {
        chat: chatReducer
    }
});

export default store;