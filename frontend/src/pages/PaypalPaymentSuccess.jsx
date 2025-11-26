import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // useNavigate instead of useHistory
import axios from "axios";

const PaypalPaymentSuccess = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Initialize the useNavigate hook

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const payerID = params.get("PayerID");

    if (token && payerID) {
      // Call the backend to capture the payment
      const capturePayment = async () => {
        try {
          const response = await axios.post("http://localhost:5000/api/paypal/capture", {
            orderId: token,
            payerId: payerID,
          });

          if (response.status === 200) {
            // Redirect to order confirmation or success page
            navigate("/order-success");  // Use navigate for redirection
          } else {
            // Handle failure case
            alert("There was an error completing your payment. Please try again.");
            navigate("/payment/cancel");  // Redirect to a cancel page if necessary
          }
        } catch (error) {
          console.error("Error capturing payment:", error);
          alert("There was an error completing your payment. Please try again.");
          navigate("/payment/cancel");  // Redirect to a cancel page if necessary
        }
      };

      capturePayment();
    } else {
      alert("Invalid payment details.");
      navigate("/payment/cancel");  // Redirect to a cancel page if necessary
    }
  }, [navigate]);  // Add navigate to the dependencies

  return (
    <div>
      <h1>Processing your payment...</h1>
      <p>Please wait while we confirm your payment.</p>
    </div>
  );
};

export default PaypalPaymentSuccess;
