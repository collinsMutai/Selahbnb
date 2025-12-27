// src/api/axiosInstance.js
import axios from 'axios';
import { logout } from '../redux/userSlice';
import store from '../redux/store'; // Access your Redux store directly

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true, // Crucial for sending the 7-day cookie
});

// --- STEP A: ATTACH TOKEN TO EVERY REQUEST ---
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- STEP B: HANDLE EXPIRED TOKENS (401) ---
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 1. Call your backend refresh endpoint
        const { data } = await axios.post(
          `${process.env.REACT_APP_API_URL}/users/refresh-token`,
          {},
          { withCredentials: true }
        );

        // 2. Save the new 1-hour token
        localStorage.setItem("token", data.accessToken);

        // 3. Update the failed request with the new token and retry it
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest); 
        
      } catch (refreshError) {
        // 4. If the 7-day cookie is ALSO expired, log out the user
        store.dispatch(logout());
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;