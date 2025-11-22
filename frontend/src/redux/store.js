// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import modalReducer from './modalSlice';
import bookingReducer from './bookingSlice'; // Import the new booking reducer

const store = configureStore({
  reducer: {
    user: userReducer,
    modal: modalReducer,
    booking: bookingReducer, // Add the booking reducer to the store
  },
});

export default store;
