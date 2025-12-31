import React, { useEffect, useCallback, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
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

const apiUrl = process.env.REACT_APP_API_URL;

// ---------- Protected Route ----------
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useSelector((state) => state.user);
  return isLoggedIn ? children : <Navigate to="/" />;
};

// ---------- Layout Wrapper ----------
const Layout = ({ children }) => {
  const location = useLocation();

  // Hide navbar/footer on admin paths
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

  // Refresh the token by sending the refresh token to the backend
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
      return null; // In case of an error, log out the user
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
            // Token is about to expire, refresh it
            await refreshSession();
          } else {
            // Token is still valid, continue
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

  if (loading) return null; // Render nothing while checking auth state

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

          {/* Admin Route with redirection */}
          <Route
            path="/admin"
            element={
              user?.role === "admin" ? <AdminDashboard /> : <Navigate to="/" />
            }
          >
            {/* Nested admin routes */}
            <Route index element={<Navigate to="bookings" replace />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="users" element={<Users />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<h2>Settings (Coming Soon)</h2>} />
          </Route>

          {/* Non-admin Routes */}
          <Route path="/users" element={<Users />} />
        </Routes>
      </Layout>

      <ToastContainer position="top-right" autoClose={5000} />
    </Router>
  );
}

export default App;
