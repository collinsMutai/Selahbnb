import React, { useEffect, useCallback, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode"; // ✅ Keep as you requested
import axios from "axios";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { login, logout } from "./redux/userSlice";

// Pages & Components
import Home from "./pages/Home";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Places from "./components/Places/Places";
import ContactPage from "./pages/Contact";
import PaypalPaymentSuccess from "./pages/PaypalPaymentSuccess";
import AdminDashboard from "./pages/Admin";
import Bookings from "./components/Bookings/Bookings";
import Users from "./components/Users/Users";
import Analytics from "./components/Analytics/Analytics";
import ListingChatbot from "./components/ListingChatbot/ListingChatbot";
import AdminCalendar from "./components/AdminCalendar/AdminCalendar"; // ✅ Import calendar

const apiUrl = process.env.REACT_APP_API_URL;
const GLOBAL_LISTING_ID = "695025737ee434d532c393eb";

// ---------- Protected Route ----------
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useSelector((state) => state.user);
  return isLoggedIn ? children : <Navigate to="/" />;
};

// ---------- Layout Wrapper ----------
const Layout = ({ children }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdminRoute && <Navbar />}
      {children}
      {!isAdminRoute && <Footer />}
    </>
  );
};

function App() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(true);

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
            dispatch(login({ user: JSON.parse(storedUser), token }));
          }
        } catch (err) {
          console.error("Error decoding token:", err);
          handleLogout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [dispatch, refreshSession, handleLogout]);

  if (loading) return null;

  return (
    <Router>
      <Layout>
        <Routes>
          {/* Main Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/places" element={<Places />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Protected Routes */}
          <Route
            path="/paypalpayment/success"
            element={
              <ProtectedRoute>
                <PaypalPaymentSuccess />
              </ProtectedRoute>
            }
          />

          {/* Admin Route with nested routes */}
          <Route
            path="/admin"
            element={
              user?.role === "admin" ? <AdminDashboard /> : <Navigate to="/" />
            }
          >
            <Route index element={<Navigate to="bookings" replace />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="users" element={<Users />} />
            <Route path="analytics" element={<Analytics />} />
            <Route
              path="calendar"
              element={<AdminCalendar listingId={GLOBAL_LISTING_ID} />}
            /> {/* ✅ Calendar route */}
            <Route path="settings" element={<h2>Settings (Coming Soon)</h2>} />
          </Route>

          {/* Non-admin fallback */}
          <Route path="/users" element={<Users />} />
        </Routes>

        {/* Global Chatbot */}
        <ListingChatbot listingId={GLOBAL_LISTING_ID} />
      </Layout>

      <ToastContainer position="top-right" autoClose={5000} />
    </Router>
  );
}

export default App;
