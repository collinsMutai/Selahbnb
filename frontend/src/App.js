import React, { useEffect, useCallback, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { setUser, login, logout } from "./redux/userSlice";

// Page Imports
import Home from "./pages/Home";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Places from "./components/Places/Places";
import ContactPage from "./pages/Contact";
import PaypalPaymentSuccess from "./pages/PaypalPaymentSuccess";
import AdminDashboard from "./pages/Admin";
import Bookings from "./components/Bookings/Bookings";

const apiUrl = process.env.REACT_APP_API_URL;

// --- PROTECTED ROUTE COMPONENT ---
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useSelector((state) => state.user);
  return isLoggedIn ? children : <Navigate to="/" />;
};

function App() {
  const dispatch = useDispatch();
  const { user, isLoggedIn } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(true); // Prevent flash of unauth state

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    dispatch(logout());
  }, [dispatch]);

  const refreshSession = useCallback(async () => {
    try {
      const response = await axios.post(
        `${apiUrl}/users/refresh-token`,
        {},
        { withCredentials: true }
      );
      
      const { accessToken } = response.data;
      const storedUser = JSON.parse(localStorage.getItem("user"));
      
      localStorage.setItem("token", accessToken);
      dispatch(login({ user: storedUser, token: accessToken }));
      return accessToken;
    } catch (error) {
      handleLogout();
      return null;
    }
  }, [dispatch, handleLogout]);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (token && storedUser) {
        try {
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000;

          if (decoded.exp < currentTime + 60) {
            await refreshSession();
          } else {
            const parsedUser = JSON.parse(storedUser);
            dispatch(login({ user: parsedUser, token }));

            const timeLeft = (decoded.exp - currentTime - 300) * 1000;
            const timer = setTimeout(() => refreshSession(), Math.max(timeLeft, 0));
            setLoading(false);
            return () => clearTimeout(timer);
          }
        } catch (err) {
          handleLogout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [dispatch, refreshSession, handleLogout]);

  if (loading) return null; // Or a full-screen spinner

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/places" element={<Places />} />
        <Route path="/contact" element={<ContactPage />} />
        
        {/* Protected Routes */}
        <Route 
          path="/paypalpayment/success" 
          element={<ProtectedRoute><PaypalPaymentSuccess /></ProtectedRoute>} 
        />
        
        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              {user?.role === "admin" ? <Navigate to="/admin" /> : <Bookings />}
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={user?.role === "admin" ? <AdminDashboard /> : <Navigate to="/" />}
        />
      </Routes>
      <Footer />
      <ToastContainer position="top-right" autoClose={5000} />
    </Router>
  );
}

export default App;