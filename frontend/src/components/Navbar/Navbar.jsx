import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google"; // Import GoogleLogin from @react-oauth/google
import jwt_decode from "jwt-decode"; // Decode JWT tokens (if you need to extract user info from token)
import "./Navbar.css";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State to toggle mobile menu
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Check if user is logged in
  const [user, setUser] = useState(null); // Store the user data

  // Check if the user is logged in when the component mounts
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      setIsLoggedIn(true); // User is logged in
      setUser(JSON.parse(storedUser)); // Set user data
    }
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen); // Toggle the state to show/hide the mobile menu
  };

  // Close menu after navigating to a link
  const handleLinkClick = () => {
    setIsMenuOpen(false); // Close the menu when a link is clicked
  };

  // Handle Google login success
  const handleGoogleLoginSuccess = async (response) => {
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
        // Store tokens and user info in localStorage
        localStorage.setItem("token", data.token); // Store the access token
        localStorage.setItem("user", JSON.stringify(data.user)); // Store user data

        setIsLoggedIn(true); // User is logged in
        setUser(data.user); // Set user data
        setIsModalOpen(false); // Close the login modal
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

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false); // Set login state to false
    setUser(null); // Clear user data
    setIsModalOpen(false); // Close the modal
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
            <a href="#overview" className="navbar-link" onClick={handleLinkClick}>
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
          <div
            className="user-icon"
            onClick={() => setIsModalOpen(true)}
          >
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

      {/* Modal based on login state */}
      {isModalOpen && (
        <div className="google-login-modal">
          <div className="modal-content">
            {!isLoggedIn ? (
              <>
                <h2>Continue with Google</h2>
                <GoogleLogin
                  onSuccess={handleGoogleLoginSuccess}
                  onFailure={handleGoogleLoginFailure}
                  clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
                  buttonText="Continue with Google"
                  cookiePolicy="single_host_origin"
                />
                <button onClick={() => setIsModalOpen(false)} className="close-modal-btn">
                  Close
                </button>
              </>
            ) : (
              <>
                <h2>Welcome, {user?.name || "User"}</h2>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
