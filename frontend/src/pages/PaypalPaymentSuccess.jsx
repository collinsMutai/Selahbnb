import React, { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const apiUrl = process.env.REACT_APP_API_URL || "https://63919269e920.ngrok-free.app/api";

const PaypalPaymentSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const payerID = params.get("PayerID");

    if (token && payerID) {
      const capturePayment = async () => {
        try {
          const response = await axios.post(`${apiUrl}/paypal/capture`, {
            orderId: token,
            payerId: payerID,
          });

          if (response.status === 200) {
            // Payment captured successfully, redirect to home
            navigate("/");  // Redirect to home page or wherever the user should go
          }
        } catch (error) {
          console.error("Error capturing payment:", error);
          navigate("/payment/cancel");  // Redirect on error
        }
      };

      capturePayment();
    }
  }, [navigate]);

  return (
    <div>
      <h1>Processing your payment...</h1>
      <p>Please wait while we confirm your payment.</p>
    </div>
  );
};

export default PaypalPaymentSuccess;
