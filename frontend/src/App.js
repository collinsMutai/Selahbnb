import React, { useEffect } from "react";
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

// Import ToastContainer for global toasts
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Don't forget the styles!

// Redux imports
import { useDispatch, useSelector } from "react-redux";
import { setUser, login } from "./redux/userSlice";

function App() {
  const dispatch = useDispatch();
  const { isLoggedIn, user } = useSelector((state) => state.user);

  // Handle the logic when the app loads to fetch the user info (e.g., from localStorage or API)
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      const user = JSON.parse(storedUser);
      dispatch(setUser(user)); // Update the redux store with the user
      dispatch(login({ user, token })); // Update the login state
    }
  }, [dispatch]);

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/places" element={<Places />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/paypalpayment/success" element={<PaypalPaymentSuccess />} />

        {/* This route checks for admin and redirects accordingly */}
        <Route
          path="/bookings"
          element={user?.role === "admin" ? <Navigate to="/admin" /> : <Bookings />}
        />

        {/* Protect the admin route */}
        <Route
          path="/admin"
          element={user?.role === "admin" ? <AdminDashboard /> : <Navigate to="/" />}
        />
      </Routes>
      <Footer />
      
      {/* ToastContainer for global toasts */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        toastContainerClassName="toast-container"
      />
    </Router>
  );
}

export default App;
