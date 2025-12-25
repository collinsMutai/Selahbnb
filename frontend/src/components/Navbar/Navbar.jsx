import { toast } from "react-toastify"; // Import toast for notifications
import React, { useState, useEffect, useCallback, useRef } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { login, logout, setUser } from "../../redux/userSlice";
import { setModalOpen } from "../../redux/modalSlice";
import "./Navbar.css";
import Selah_Logo from "../../images/Selah_Logo.png"; // Import the logo image

// Fetch the API URL from environment variable
const apiUrl = process.env.REACT_APP_API_URL; // Fallback to localhost if not set

const Navbar = () => {
  const dispatch = useDispatch();
  const paypalButtonContainerRef = useRef(null);
  const [paymentAmount, setPaymentAmount] = useState("1.00");
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
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
        `${apiUrl}/users/refresh-token`,
        {}, // Empty body
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

  // Open the PayPal Modal
  const handlePayNow = () => {
    setIsPayModalOpen(true); // Open the modal when "Pay Now" is clicked
  };

  // Close the PayPal Modal
  const closePayModal = () => {
    setIsPayModalOpen(false); // Close the modal after payment is done or canceled
  };

  // Function to initialize the PayPal Button inside the Modal
  // Handle changes to the payment amount
  const handleAmountChange = (e) => {
    setPaymentAmount(e.target.value);
  };

  // Function to initialize the PayPal Button inside the Modal
  useEffect(() => {
    // Check if PayPal SDK is loaded and modal is open
    if (window.paypal && isPayModalOpen && paypalButtonContainerRef.current) {
      // Clear the previous PayPal button if it exists (check null first)
      if (paypalButtonContainerRef.current) {
        paypalButtonContainerRef.current.innerHTML = "";
        console.log("Clearing previous PayPal button");
      }

      // Render PayPal button inside the container
      const paypalButtons = window.paypal.Buttons({
        createOrder: (data, actions) => {
          console.log("Creating Order with amount:", paymentAmount);
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: paymentAmount,
                },
              },
            ],
          });
        },
        onApprove: async (data, actions) => {
          try {
            const details = await actions.order.capture();
            console.log("Payment successful:", details);
            const transactionData = {
              orderId: details.id,
              payerEmail: details.payer.email_address,
              payerName: details.payer.name.given_name,
              amount: paymentAmount,
              approvalLink:
                details.links.find((link) => link.rel === "approve")?.href ||
                "No approval link available",
              status: details.status, // Payment status
            };

            // Send the transaction data to your backend API
            const response = await axios.post(
              `${apiUrl}/paypal/transactions`,
              transactionData
            );
            console.log("Transaction saved and emails sent:", response.data);
            closePayModal(); // Close modal after successful payment
          } catch (error) {
            console.error("Error completing payment:", error);
          }
        },
        onError: (err) => {
          console.error("Error with PayPal payment:", err);
        },
      });

      // Only render the button if the container exists and modal is open
      if (paypalButtonContainerRef.current) {
        paypalButtons.render(paypalButtonContainerRef.current);
      }

      // Cleanup when the component is unmounted or modal is closed
      return () => {
        // If the container is still there, clear its content
        if (paypalButtonContainerRef.current) {
          paypalButtonContainerRef.current.innerHTML = "";
          console.log("Cleanup: Clearing PayPal button");
        }

        // Also destroy PayPal buttons if necessary (optional)
        if (paypalButtons) {
          paypalButtons.close(); // Close PayPal button component (optional)
        }
      };
    } else {
      console.error("PayPal container is not available or modal is not open.");
    }
  }, [isPayModalOpen, paymentAmount]);

  // Google login success handler
  const handleGoogleLoginSuccess = async (response) => {
    const { credential } = response;
    try {
      // Immediately close the modal on success
      dispatch(setModalOpen(false));

      // Proceed with the login API call
      const res = await fetch(`${apiUrl}/users/google-login`, {
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
    localStorage.removeItem("toastShown");
    localStorage.removeItem("paymentProcessed");
    localStorage.removeItem("bookingDetails");
    dispatch(logout());
    dispatch(setModalOpen(false));
    navigate("/");
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

    // If we are already on the home page, scroll to the "home" section
    if (location.pathname === "/") {
      const heroSection = document.getElementById("home");
      if (heroSection) {
        const navbarHeight =
          document.querySelector(".selahnavbar").offsetHeight;
        window.scrollTo({
          top: heroSection.offsetTop - navbarHeight,
          behavior: "smooth",
        });
      }
    } else {
      // If on another route, navigate to the homepage and scroll to the top
      navigate("/", { replace: true });
      setTimeout(() => {
        window.scrollTo({
          top: 0, // Scroll to top of the page
          behavior: "smooth",
        });
      }, 100); // Add a short delay to make sure the page loads before scrolling
    }

    setIsMenuOpen(false); // Close mobile menu after navigation
  };

  const handleOverviewClick = (e) => {
    e.preventDefault();

    if (location.pathname === "/") {
      const overviewSection = document.getElementById("overview");

      if (overviewSection) {
        const navbarHeight =
          document.querySelector(".selahnavbar").offsetHeight;

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
          const navbarHeight =
            document.querySelector(".selahnavbar").offsetHeight;
          window.scrollTo({
            top: overviewSection.offsetTop - navbarHeight,
            behavior: "smooth",
          });
        }
      }, 100);
    }

    setIsMenuOpen(false);
  };

  // Updated function for Places link
  const handlePlacesClick = (e) => {
    e.preventDefault();
    navigate("/places");
    setIsMenuOpen(false); // Close menu after clicking
    window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to top after navigating
  };

  // Updated function for Contact link
  const handleContactClick = (e) => {
    e.preventDefault();
    navigate("/contact");
    setIsMenuOpen(false); // Close menu after clicking
    window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to top after navigating
  };

  const handleAdminRedirect = () => {
    // Close the modal
    dispatch(setModalOpen(false));

    // Redirect to the Admin dashboard
    navigate("/admin");
  };

  return (
    <div className="selahnavbar" id="selahnavbar">
      <div className="selahnavbar-container">
        {/* <div className="logo">
          <span className="selahnavbar-logo">Selah</span>
        </div> */}
        <div className="logo">
          <img src={Selah_Logo} alt="Selah Logo" className="selahnavbar-logo" />
        </div>

        <div className="selah-hamburger" onClick={toggleMenu}>
          {isMenuOpen ? (
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
              className="icon icon-tabler icons-tabler-outline icon-tabler-x"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M18 6l-12 12" />
              <path d="M6 6l12 12" />
            </svg>
          ) : (
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
              className="icon icon-tabler icons-tabler-outline icon-tabler-menu-2"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M4 6l16 0" />
              <path d="M4 12l16 0" />
              <path d="M4 18l16 0" />
            </svg>
          )}
        </div>

        <ul className={`selahnavbar-links ${isMenuOpen ? "active" : ""}`}>
          <li>
            <NavLink
              to="/"
              className="selahnavbar-link"
              end
              onClick={handleHomeClick}
            >
              Home
            </NavLink>
          </li>
          <li>
            <a
              href="#overview"
              className="selahnavbar-link"
              onClick={handleOverviewClick}
            >
              Overview
            </a>
          </li>
          <li>
            <a
              href="/places"
              className="selahnavbar-link"
              onClick={handlePlacesClick}
            >
              Places
            </a>
          </li>
          <li>
            <a
              href="/contact"
              className="selahnavbar-link"
              onClick={handleContactClick}
            >
              Contact
            </a>
          </li>
        </ul>

        <div className="selahnavbar-right">
          <div className="selah-user-icon" onClick={toggleModal}>
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
            <span>+17194920042</span>
          </div>
          <div className="phone-number pay-now" onClick={handlePayNow}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="icon icon-tabler icons-tabler-outline icon-tabler-brand-paypal"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M10 13l2.5 0c2.5 0 5 -2.5 5 -5c0 -3 -1.9 -5 -5 -5h-5.5c-.5 0 -1 .5 -1 1l-2 14c0 .5 .5 1 1 1h2.8l1.2 -5c.1 -.6 .4 -1 1 -1zm7.5 -5.8c1.7 1 2.5 2.8 2.5 4.8c0 2.5 -2.5 4.5 -5 4.5h-2.6l-.6 3.6a1 1 0 0 1 -1 .8l-2.7 0a.5 .5 0 0 1 -.5 -.6l.2 -1.4" />
            </svg>
            <span>Pay Now</span>
          </div>
          {isPayModalOpen && (
            <div className="paypal-modal-overlay" onClick={closePayModal}>
              <div
                className="paypal-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="paypal-modal-overlay" onClick={closePayModal}>
                  <div
                    className="paypal-modal"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="paypal-modal-content">
                      <h2>Complete Your Payment</h2>

                      {/* Label and Input for Payment Amount */}
                      <label htmlFor="paymentAmount">Enter Amount:</label>
                      <input
                        id="paymentAmount"
                        type="number"
                        value={paymentAmount}
                        onChange={handleAmountChange}
                        min="0.01"
                        step="0.01"
                      />

                      {/* PayPal Button container */}
                      <div ref={paypalButtonContainerRef}></div>

                      <button
                        className="close-modal-btn"
                        onClick={closePayModal}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="book-now">
            <button onClick={handleHomeClick} className="book-now-btn">
              Book Now
            </button>
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
          <div className="selah-modal-content">
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
                {user && (
                  <div className="role-links">
                    {/* ✅ Admin → Dashboard */}
                    {user.role === "admin" && (
                      <button
                        onClick={handleAdminRedirect}
                        className="admin-link"
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
                          style={{ marginRight: "8px" }}
                        >
                          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                          <path d="M5 12l-2 0l9 -9l9 9l-2 0" />
                          <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" />
                          <path d="M10 12h4v4h-4z" />
                        </svg>
                        Dashboard
                      </button>
                    )}

                    {/* ✅ Normal Users → Bookings */}
                    {user.role !== "admin" && (
                      <button
                        onClick={() => {
                          dispatch(setModalOpen(false));
                          navigate("/bookings");
                        }}
                        className="admin-link"
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
                          style={{ marginRight: "8px" }}
                        >
                          <rect x="4" y="4" width="16" height="16" rx="2" />
                          <path d="M4 10h16" />
                        </svg>
                        Bookings
                      </button>
                    )}
                  </div>
                )}

                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
