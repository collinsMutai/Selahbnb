import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home"; // This page should have the #overview section
import "./App.css";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Places from "./components/Places/Places";
import ContactPage from "./pages/Contact";
import PaypalPaymentSuccess from "./pages/PaypalPaymentSuccess";
import AdminDashboard from "./pages/Admin";

function App() {
  return (
    <Router>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/places" element={<Places />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/paypalpayment/success" element={<PaypalPaymentSuccess />} /> {/* New route for PayPal success */}
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>

      <Footer />
    </Router>
  );
}

export default App;
