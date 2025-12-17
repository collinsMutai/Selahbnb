import React, { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { TailSpin } from "react-loader-spinner";

const apiUrl = process.env.REACT_APP_API_URL;

const PaypalPaymentSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const payerID = params.get("PayerID");

    const capture = async () => {
      try {
        if (token && payerID) {
          const key = `capture_done_${token}`;

          // ✅ Prevent duplicate capture on refresh
          if (!localStorage.getItem(key)) {
            await axios.post(`${apiUrl}/paypal/capture`, {
              orderId: token,
              payerId: payerID,
            });

            localStorage.setItem(key, "true");
          }
        }

        // ✅ Redirect after capture
        navigate("/bookings");
      } catch (err) {
        console.error("Capture failed:", err);
        navigate("/bookings");
      }
    };

    capture();
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h2 style={{ marginBottom: 20 }}>Finalizing your payment...</h2>

        <TailSpin
          height="80"
          width="80"
          color="#148992"
          ariaLabel="tail-spin-loading"
        />
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
  },
  box: {
    textAlign: "center",
  },
};

export default PaypalPaymentSuccess;