// src/redux/modalSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isModalOpen: false,  // This will control whether the modal is open
};

const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    setModalOpen: (state, action) => {
      state.isModalOpen = action.payload; // True/False to open/close modal
    },
  },
});

export const { setModalOpen } = modalSlice.actions;
export default modalSlice.reducer;
