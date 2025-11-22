// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import modalReducer from './modalSlice'

const store = configureStore({
  reducer: {
    user: userReducer,
    modal:modalReducer
  },
});

export default store;
