import React, { useState, useEffect, useCallback } from "react";
import { NavLink } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode"; // Decode JWT tokens
import axios from "axios"; // Axios for API calls
import "./Navbar.css";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Function to get and decode the token, checking for expiration
  const getToken = useCallback(() => {
    const token = localStorage.getItem("token");

    if (token) {
      // Check if the token is correctly formatted
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.error("Invalid token format");
        handleLogout();
        return null;
      }

      try {
        const decoded = jwtDecode(token); // Decode the token
        const currentTime = Date.now() / 1000; // Current time in seconds
        if (decoded.exp < currentTime) {
          // If the token is expired, refresh it
          refreshToken();
          return null; // Return null to trigger token refresh
        }
        return token; // If the token is still valid, return it
      } catch (error) {
        console.error("Error decoding token:", error);
        handleLogout(); // If decoding the token fails, log out the user
        return null;
      }
    }

    return null; // If no token exists
  }, []);

  // Refresh the token using the refresh token (from cookies)
  const refreshToken = useCallback(async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/refresh-token", {}, { withCredentials: true });
      const newAccessToken = response.data.accessToken; // Get the new access token from the response

      // Save the new access token in localStorage
      localStorage.setItem("token", newAccessToken);

      // Decode and set user info from the new token
      const decoded = jwtDecode(newAccessToken);
      setIsLoggedIn(true);
      setUser(decoded);
    } catch (error) {
      console.error("Error refreshing token:", error);
      handleLogout(); // If refreshing the token fails, log out the user
    }
  }, []);

  // Handle Google login success
  const handleGoogleLoginSuccess = async (response) => {
    const { credential } = response; // Extract the credential token

    try {
      const res = await fetch("http://localhost:5000/api/users/google-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: credential }),
      });

      const data = await res.json();
      if (res.ok) {
        // Save the new access token in localStorage
        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.user)); // Save user data

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

  // Check if the user is logged in and if the token is valid when the component mounts
  useEffect(() => {
    const token = getToken(); // Get token from localStorage or refresh it
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      setIsLoggedIn(true); // User is logged in
      setUser(JSON.parse(storedUser)); // Set user data
    } else {
      console.log("Token is expired or not found, refreshing...");
      refreshToken(); // Trigger token refresh if needed
    }
  }, [getToken, refreshToken]); // Trigger the effect whenever getToken or refreshToken changes

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen); // Toggle the state to show/hide the mobile menu
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false); // Close the menu when a link is clicked
  };

  // Toggle modal visibility
  const toggleModal = () => {
    setIsModalOpen((prevState) => !prevState);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
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
            >
              Places
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/contact"
              className="navbar-link"
              onClick={handleLinkClick}
            >
              Contact
            </NavLink>
          </li>
        </ul>

        {/* Right-aligned section */}
        <div className="navbar-right">
          <div
            className="user-icon"
            onClick={toggleModal}
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
        <div
          className={`google-login-modal ${isLoggedIn ? "logged-in" : ""}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsModalOpen(false);
            }
          }}
        >
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
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="close-modal-btn"
                >
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
