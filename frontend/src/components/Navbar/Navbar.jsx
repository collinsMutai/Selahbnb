import React, { useState, useEffect, useCallback } from "react";
import { NavLink } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode"; 
import axios from "axios"; 
import { useDispatch, useSelector } from "react-redux"; 
import { login, logout, setUser } from "../../redux/userSlice"; 
import { setModalOpen } from "../../redux/modalSlice"; // Import setModalOpen from modalSlice
import "./Navbar.css";

const Navbar = () => {
  const dispatch = useDispatch();
  const { isLoggedIn, user } = useSelector((state) => state.user);
  const { isModalOpen } = useSelector((state) => state.modal); // Access modal state from Redux
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const refreshToken = useCallback(async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/users/refresh-token", {}, { withCredentials: true });
      const newAccessToken = response.data.accessToken;
      localStorage.setItem("token", newAccessToken);
      const decoded = jwtDecode(newAccessToken);
      dispatch(login({ user: decoded, token: newAccessToken }));
    } catch (error) {
      console.error("Error refreshing token:", error);
      handleLogout();
    }
  }, [dispatch]);

  const getToken = useCallback(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.error("Invalid token format");
        handleLogout();
        return null;
      }
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          refreshToken();
          return null;
        }
        return token;
      } catch (error) {
        console.error("Error decoding token:", error);
        handleLogout();
        return null;
      }
    }
    return null;
  }, [refreshToken]);

  const handleGoogleLoginSuccess = async (response) => {
    const { credential } = response;
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
        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.user));
        dispatch(login({ user: data.user, token: data.accessToken }));
        dispatch(setModalOpen(false));  // Close modal on successful login
      } else {
        console.error("Authentication failed:", data.message);
      }
    } catch (error) {
      console.error("Error sending Google login token to backend:", error);
    }
  };

  const handleGoogleLoginFailure = (error) => {
    console.log("Google login failed:", error);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    dispatch(logout());
    dispatch(setModalOpen(false));  // Close modal on logout
  };

  useEffect(() => {
    const token = getToken();
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      dispatch(setUser(JSON.parse(storedUser)));
    } else if (!token) {
      console.log("No token found, skipping refresh.");
    } else {
      console.log("Token is expired or invalid, refreshing...");
      refreshToken();
    }
  }, [getToken, refreshToken, dispatch]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  const toggleModal = () => {
    dispatch(setModalOpen(!isModalOpen));  // Dispatch the action to toggle modal visibility
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="logo">
          <span className="navbar-logo">Selah</span>
        </div>

        <div className={`hamburger ${isMenuOpen ? "active" : ""}`} onClick={toggleMenu}>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </div>

        <ul className={`navbar-links ${isMenuOpen ? "active" : ""}`}>
          <li><NavLink to="/" className="navbar-link" end onClick={handleLinkClick}>Home</NavLink></li>
          <li><a href="#overview" className="navbar-link" onClick={handleLinkClick}>Overview</a></li>
          <li><NavLink to="/places" className="navbar-link" onClick={handleLinkClick}>Places</NavLink></li>
          <li><NavLink to="/contact" className="navbar-link" onClick={handleLinkClick}>Contact</NavLink></li>
        </ul>

        <div className="navbar-right">
          <div className="user-icon" onClick={toggleModal}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-user-circle">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
              <path d="M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
              <path d="M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855" />
            </svg>
          </div>
          <div className="phone-number">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="phone-icon">
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

      {/* Modal */}
      {isModalOpen && (
        <div
          className={`google-login-modal ${isLoggedIn ? "logged-in" : ""}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              dispatch(setModalOpen(false)); // Close modal if clicked outside
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
                  onClick={() => dispatch(setModalOpen(false))}
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
