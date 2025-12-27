import React, { useEffect, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import "./App.css";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Places from "./components/Places/Places";
import ContactPage from "./pages/Contact";
import PaypalPaymentSuccess from "./pages/PaypalPaymentSuccess";
import AdminDashboard from "./pages/Admin";
import Bookings from "./components/Bookings/Bookings";

// Extra imports for auth logic
import { jwtDecode } from "jwt-decode";
import axios from "axios";

// Import ToastContainer for global toasts
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Redux imports
import { useDispatch, useSelector } from "react-redux";
import { setUser, login, logout } from "./redux/userSlice";

// Set your API URL
const apiUrl = process.env.REACT_APP_API_URL;

function App() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);

  // --- 1. Logout Helper ---
  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    dispatch(logout());
  }, [dispatch]);

  // --- 2. Refresh Logic (Handles the 7-day Cookie) ---
  const refreshSession = useCallback(async () => {
    try {
      const response = await axios.post(
        `${apiUrl}/users/refresh-token`,
        {},
        { withCredentials: true } // CRITICAL: Sends the 7-day httpOnly cookie
      );
      
      const { accessToken } = response.data;
      const storedUser = JSON.parse(localStorage.getItem("user"));
      
      localStorage.setItem("token", accessToken);
      dispatch(login({ user: storedUser, token: accessToken }));
      console.log("Session refreshed successfully");
      return accessToken;
    } catch (error) {
      console.error("7-day refresh token expired or invalid");
      handleLogout();
      return null;
    }
  }, [dispatch, handleLogout]);

  // --- 3. Auth Watcher (Boot check + Expiry Timer) ---
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (token && storedUser) {
        try {
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000;

          // If token is already expired (or expires in < 1 minute)
          if (decoded.exp < currentTime + 60) {
            await refreshSession();
          } else {
            // Token is still valid, sync with Redux
            const parsedUser = JSON.parse(storedUser);
            dispatch(setUser(parsedUser));
            dispatch(login({ user: parsedUser, token }));

            // Set a timer to auto-refresh 5 minutes before the 1-hour token dies
            const timeLeft = (decoded.exp - currentTime - 300) * 1000;
            const timer = setTimeout(() => {
              refreshSession();
            }, Math.max(timeLeft, 0));

            return () => clearTimeout(timer);
          }
        } catch (err) {
          handleLogout();
        }
      }
    };

    initializeAuth();
  }, [dispatch, refreshSession, handleLogout]);

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/places" element={<Places />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/paypalpayment/success" element={<PaypalPaymentSuccess />} />

        <Route
          path="/bookings"
          element={user?.role === "admin" ? <Navigate to="/admin" /> : <Bookings />}
        />

        <Route
          path="/admin"
          element={user?.role === "admin" ? <AdminDashboard /> : <Navigate to="/" />}
        />
      </Routes>
      <Footer />
      
      <ToastContainer
        position="top-right"
        autoClose={5000}
        toastContainerClassName="toast-container"
      />
    </Router>
  );
}

export default App;