import { createSlice } from '@reduxjs/toolkit';

// Safely parse the user from localStorage for initial state
const getInitialUser = () => {
  try {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  } catch (err) {
    return null;
  }
};

const initialState = {
  isLoggedIn: !!localStorage.getItem("token"), // If there's a token, assume logged in
  user: getInitialUser(),
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action) => {
      state.isLoggedIn = true;
      // App.js sends: { user: ..., token: ... }
      state.user = action.payload.user; 
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.user = null;
      // Clean storage here too as a fallback
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
});

export const { login, logout, setUser } = userSlice.actions;
export default userSlice.reducer;