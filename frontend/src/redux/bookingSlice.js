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
    resetBookingData: () => initialState, // Reset form data
  },
});

export const { setBookingData, resetBookingData } = bookingSlice.actions;
export default bookingSlice.reducer;
