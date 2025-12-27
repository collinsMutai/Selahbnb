import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { TailSpin } from "react-loader-spinner"; // Using the spinner from earlier

const apiUrl = process.env.REACT_APP_API_URL;

const PaypalPaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState("verifying");
  const pollCount = useRef(0);
  const maxPolls = 15;
  const timeoutRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const bookingId = params.get("bookingId");

    if (!bookingId) {
      console.error("❌ No bookingId found in URL redirect");
      navigate("/bookings");
      return;
    }

    const checkBookingStatus = async () => {
      try {
        // 1. Get the raw string directly from localStorage
        let token = localStorage.getItem("token");

        if (!token) {
          console.error("❌ No token found in localStorage");
          setStatus("error");
          return;
        }

        // Clean the token (removes extra quotes if they exist)
        token = token.replace(/^"|"$/g, '');

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        // 2. Request the current status
        const { data } = await axios.get(
          `${apiUrl}/bookings/${bookingId}`,
          config
        );

        if (data.status === "Confirmed") {
          console.log("✅ Booking confirmed! Redirecting...");
          setStatus("confirmed");
          timeoutRef.current = setTimeout(() => navigate("/bookings"), 3000);
        } else {
          // If still "Hold", wait 3 seconds and try again
          console.log(`⏳ Current status: ${data.status}. Polling...`);
          if (pollCount.current < maxPolls) {
            pollCount.current += 1;
            timeoutRef.current = setTimeout(checkBookingStatus, 3000);
          } else {
            setStatus("error");
          }
        }
      } catch (err) {
        console.error("❌ Polling Error:", err.response?.data?.message || err.message);
        setStatus("error");
      }
    };

    checkBookingStatus();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [location, navigate]);

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        {status === "verifying" && (
          <>
            <h2 style={styles.title}>Finalizing your reservation...</h2>
            <p style={styles.text}>
              We're waiting for payment confirmation from PayPal.
            </p>
            {/* The Loading Spinner from earlier */}
            <div style={styles.loaderWrapper}>
              <TailSpin
                height="80"
                width="80"
                color="#148992"
                ariaLabel="loading"
              />
            </div>
          </>
        )}

        {status === "confirmed" && (
          <>
            <h2 style={{ ...styles.title, color: "#28a745" }}>
              Payment Successful! 🎉
            </h2>
            <p style={styles.text}>
              Your booking is confirmed. Redirecting you to your trips...
            </p>
            <div style={styles.successCheck}>✓</div>
          </>
        )}

        {status === "error" && (
          <>
            <h2 style={{ ...styles.title, color: "#dc3545" }}>
              Almost there...
            </h2>
            <p style={styles.text}>
              PayPal is still processing. Your booking will update to
              "Confirmed" automatically shortly.
            </p>
            <button style={styles.button} onClick={() => navigate("/bookings")}>
              Go to My Bookings
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    width: "100vw",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f7f7f7",
    padding: "20px",
  },
  box: {
    textAlign: "center",
    background: "white",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    maxWidth: "400px",
    width: "100%",
  },
  loaderWrapper: {
    display: "flex",
    justifyContent: "center",
    margin: "20px 0",
  },
  title: {
    marginBottom: "10px",
    fontSize: "22px",
    fontWeight: "600",
  },
  text: {
    color: "#666",
    marginBottom: "20px",
    fontSize: "14px",
    lineHeight: "1.5",
  },
  successCheck: {
    fontSize: "60px",
    color: "#28a745",
  },
  button: {
    padding: "10px 20px",
    background: "#148992",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "600",
  },
};

export default PaypalPaymentSuccess;
