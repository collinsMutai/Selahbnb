import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { TailSpin } from "react-loader-spinner";
import api from "../api/axiosInstance"; // Your interceptor-enabled instance

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
    const orderId = params.get("token"); // PayPal Order ID from URL

    if (!bookingId) {
      console.error("❌ No bookingId found in URL redirect");
      navigate("/bookings");
      return;
    }

    const checkBookingStatus = async () => {
      try {
        // --- STEP 1: INITIAL SYNC (Run once) ---
        // Path is relative to baseURL: http://localhost:5000/api
        if (pollCount.current === 0 && orderId) {
          try {
            // Path becomes: http://localhost:5000/api/paypal/capture
            await api.post("/paypal/capture", { orderId });
            console.log("📡 Sync triggered for Order:", orderId);
          } catch (e) {
            console.log("ℹ️ Sync already handled by Webhook or previously triggered.");
          }
        }

        // --- STEP 2: POLL FOR BOOKING STATUS ---
        // Path becomes: http://localhost:5000/api/bookings/:id
        const { data } = await api.get(`/bookings/${bookingId}`);

        if (data.status === "Confirmed") {
          console.log("✅ Booking confirmed via polling!");
          setStatus("confirmed");
          timeoutRef.current = setTimeout(() => navigate("/bookings"), 4000);
        } else {
          console.log(`⏳ Status: ${data.status}. Polling attempt ${pollCount.current + 1}...`);
          
          if (pollCount.current < maxPolls) {
            pollCount.current += 1;
            timeoutRef.current = setTimeout(checkBookingStatus, 3000);
          } else {
            setStatus("error");
          }
        }
      } catch (err) {
        // If it's a 401, the interceptor handles it. 
        // If it's something else (404/500), we show the error state.
        console.error("❌ Sync/Poll Error:", err.response?.data?.message || err.message);
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
              Your booking is confirmed. Redirecting you to your bookings...
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
