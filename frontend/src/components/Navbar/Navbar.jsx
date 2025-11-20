import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google"; // Import GoogleLogin from @react-oauth/google
import "./Navbar.css";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State to toggle mobile menu
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen); // Toggle the state to show/hide the mobile menu
  };

  // Close menu after navigating to a link
  const handleLinkClick = () => {
    setIsMenuOpen(false); // Close the menu when a link is clicked
  };

  // Handle Google login success
  const handleGoogleLoginSuccess = async (response) => {
    console.log("Google login response:", response);
    const { credential } = response; // Extract the credential token from the response

    // Send the token to the backend for verification and user authentication
    try {
      const res = await fetch("http://localhost:5000/api/users/google-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: credential }), // Send the token to backend
      });

      const data = await res.json();
      if (res.ok) {
        // Handle the response (e.g., store the JWT token and user data)
        console.log("User authenticated:", data);
        localStorage.setItem("token", data.token); // Store the token
        setIsModalOpen(false); // Close the modal after successful login
      } else {
        console.error("Authentication failed:", data.message);
      }
    } catch (error) {
      console.error("Error sending Google login token to backend:", error);
    }
  };

  // Handle Google login failure
  const handleGoogleLoginFailure = (error) => {
    console.log("Google login failed:", error);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="logo">
          <span className="navbar-logo">Selah</span>
        </div>

        {/* Hamburger Icon for mobile menu */}
        <div
          className={`hamburger ${isMenuOpen ? "active" : ""}`}
          onClick={toggleMenu}
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </div>

        {/* Menu Links (Left-aligned) */}
        <ul className={`navbar-links ${isMenuOpen ? "active" : ""}`}>
          <li>
            <NavLink
              to="/"
              className="navbar-link"
              end
              onClick={handleLinkClick}
              activeClassName="active"
            >
              Home
            </NavLink>
          </li>
          <li>
            <a
              href="#overview"
              className="navbar-link"
              onClick={handleLinkClick}
            >
              Overview
            </a>
          </li>
          <li>
            <NavLink
              to="/places"
              className="navbar-link"
              onClick={handleLinkClick}
              activeClassName="active"
            >
              Places
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/contact"
              className="navbar-link"
              onClick={handleLinkClick}
              activeClassName="active"
            >
              Contact
            </NavLink>
          </li>
        </ul>

        {/* Right-aligned section */}
        <div className="navbar-right">
          <div className="user-icon" onClick={() => setIsModalOpen(true)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="icon icon-tabler icons-tabler-outline icon-tabler-user-circle"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
              <path d="M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
              <path d="M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855" />
            </svg>
          </div>
          <div className="phone-number">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="phone-icon"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2" />
            </svg>
            <span>+1 234 567 890</span>
          </div>

          <div className="book-now">
            <button className="book-now-btn">Book Now</button>
          </div>
        </div>
      </div>

      {/* Google Login Modal */}
      {isModalOpen && (
        <div className="google-login-modal">
          <div className="modal-content">
            <h2>Continue with Google</h2>
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onFailure={handleGoogleLoginFailure}
              useOneTap // Optional: One-tap login
              clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID} // Use your Google client ID here
              buttonText="Continue with Google"
              cookiePolicy="single_host_origin"
            />
            <button onClick={() => setIsModalOpen(false)} className="close-modal-btn">
              Close
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
