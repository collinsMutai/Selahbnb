import React, { useState, useEffect, useCallback } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { login, logout, setUser } from "../../redux/userSlice";
import { setModalOpen } from "../../redux/modalSlice";
import "./Navbar.css";

const Navbar = () => {
  const dispatch = useDispatch();
  const { isLoggedIn, user } = useSelector((state) => state.user);
  const { isModalOpen } = useSelector((state) => state.modal);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state
  const navigate = useNavigate();
  const location = useLocation();

  // Function to handle the refresh token
  const refreshToken = useCallback(async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/users/refresh-token",
        {},
        { withCredentials: true }
      );
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
      const tokenParts = token.split(".");
      if (tokenParts.length !== 3) {
        console.error("Invalid token format");
        handleLogout();
        return null;
      }
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000; // Current time in seconds
        if (decoded.exp < currentTime) {
          refreshToken(); // Refresh the token if expired
          return null;
        }
        return token; // If token is valid, return it
      } catch (error) {
        console.error("Error decoding token:", error);
        handleLogout();
        return null;
      }
    }

    return null; // If no token exists
  }, [refreshToken]);

  // Google login success handler
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
        // Save token and user data in localStorage
        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Dispatch login action to Redux store
        dispatch(login({ user: data.user, token: data.accessToken }));

        // Close modal on successful login
        dispatch(setModalOpen(false));
      } else {
        console.error(
          "Authentication failed:",
          data.message || "Unknown error"
        );
      }
    } catch (error) {
      console.error("Error sending Google login token to backend:", error);
    }
  };

  const handleGoogleLoginFailure = (error) => {
    console.log("Google login failed:", error);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    dispatch(logout());
    dispatch(setModalOpen(false));
  };
  useEffect(() => {
    console.log("User data in Navbar:", user); // Log user to verify its state
  }, [user]);

  useEffect(() => {
    const token = getToken();
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      const user = JSON.parse(storedUser);
      dispatch(setUser(user)); // Update Redux state with user data
      dispatch(login({ user, token })); // Ensure login action is dispatched with user and token
      setLoading(false); // Set loading to false after the user data is fetched
    } else if (!token) {
      console.log("No token found, skipping refresh.");
      setLoading(false); // Set loading to false if no token
    } else {
      console.log("Token is expired or invalid, refreshing...");
      refreshToken();
      setLoading(false); // Set loading to false after token refresh attempt
    }
  }, [getToken, refreshToken, dispatch]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  const toggleModal = () => {
    dispatch(setModalOpen(!isModalOpen)); // Dispatch the action to toggle modal visibility
  };

  // Function to handle "Home" link (scroll to #hero if already on the homepage)
  const handleHomeClick = (e) => {
    e.preventDefault(); // Prevent default anchor behavior

    if (location.pathname === "/") {
      const heroSection = document.getElementById("home");
      if (heroSection) {
        const navbarHeight = document.querySelector(".navbar").offsetHeight;
        window.scrollTo({
          top: heroSection.offsetTop - navbarHeight,
          behavior: "smooth",
        });
      }
    } else {
      navigate("/", { replace: true });
    }

    setIsMenuOpen(false); // Close mobile menu after navigation
  };

  const handleOverviewClick = (e) => {
    e.preventDefault();

    if (location.pathname === "/") {
      const overviewSection = document.getElementById("overview");

      if (overviewSection) {
        const navbarHeight = document.querySelector(".navbar").offsetHeight;

        setTimeout(() => {
          window.scrollTo({
            top: overviewSection.offsetTop - navbarHeight,
            behavior: "smooth",
          });
        }, 100);
      }
    } else {
      navigate("/", { replace: true });

      setTimeout(() => {
        const overviewSection = document.getElementById("overview");

        if (overviewSection) {
          const navbarHeight = document.querySelector(".navbar").offsetHeight;
          window.scrollTo({
            top: overviewSection.offsetTop - navbarHeight,
            behavior: "smooth",
          });
        }
      }, 100);
    }

    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar" id="navbar">
      <div className="navbar-container">
        <div className="logo">
          <span className="navbar-logo">Selah</span>
        </div>

        <div
          className={`hamburger ${isMenuOpen ? "active" : ""}`}
          onClick={toggleMenu}
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </div>

        <ul className={`navbar-links ${isMenuOpen ? "active" : ""}`}>
          <li>
            <NavLink
              to="/"
              className="navbar-link"
              end
              onClick={handleHomeClick}
            >
              Home
            </NavLink>
          </li>
          <li>
            <a
              href="#overview"
              className="navbar-link"
              onClick={handleOverviewClick}
            >
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

        <div className="navbar-right">
          <div className="user-icon" onClick={toggleModal}>
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
            {loading ? ( // Show loading state while user data is being fetched
              <div>Loading...</div>
            ) : !isLoggedIn ? (
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
