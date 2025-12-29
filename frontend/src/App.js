import React, { useEffect, useCallback, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
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
        } catch {
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
          <Route path="/" element={<Home />} />
          <Route path="/places" element={<Places />} />
          <Route path="/contact" element={<ContactPage />} />

          <Route
            path="/paypalpayment/success"
            element={
              <ProtectedRoute>
                <PaypalPaymentSuccess />
              </ProtectedRoute>
            }
          />

          {/* Redirect users to admin dashboard if logged in as admin */}
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                {user?.role === "admin" ? (
                  <Navigate to="/admin" />
                ) : (
                  <Bookings />
                )}
              </ProtectedRoute>
            }
          />

          {/* Admin Dashboard Route */}
          <Route
            path="/admin"
            element={
              user?.role === "admin" ? <AdminDashboard /> : <Navigate to="/" />
            }
          >
            <Route path="bookings" element={<Bookings />} />
            <Route path="users" element={<Users />} />
            <Route path="settings" element={<h2>Settings (Coming Soon)</h2>} />
          </Route>

          {/* User Route */}
          <Route path="/users" element={<Users />} />
        </Routes>
      </Layout>

      <ToastContainer position="top-right" autoClose={5000} />
    </Router>
  );
}

export default App;
