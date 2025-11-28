// src/redux/bookingSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  name: "",
  phone: "",
  checkIn: null,
  checkOut: null,
  adults: 0,
  children: 0,
  infants: 0,
  pets: 0,
  totalPrice: 0,
  status: "",
  paymentStatus: "",
  paymentProcessed: false, // New property to track payment status
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setBookingData: (state, action) => {
      // This will update the form data in Redux
      state = { ...state, ...action.payload };
      return state;
    },
    setPaymentProcessed: (state, action) => {
      // This will update the paymentProcessed flag
      state.paymentProcessed = action.payload;
    },
    resetBookingData: () => initialState, // Reset form data and paymentProcessed
  },
});

export const { setBookingData, setPaymentProcessed, resetBookingData } = bookingSlice.actions;
export default bookingSlice.reducer;
