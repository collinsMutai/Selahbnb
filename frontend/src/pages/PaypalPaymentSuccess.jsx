import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const apiUrl = process.env.REACT_APP_API_URL || "https://8b0e6b8aec8b.ngrok-free.app/api";

const PaypalPaymentSuccess = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Using useRef to keep track of the captured state across renders
  const capturedRef = useRef(false); // This will not trigger re-renders

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const payerID = params.get("PayerID");

    if (token && payerID && !capturedRef.current) {
      // Prevent multiple captures by checking the ref value
      const capturePayment = async () => {
        try {
          const response = await axios.post(`${apiUrl}/paypal/capture`, {
            orderId: token,
            payerId: payerID,
          });
          console.log('capturepayment response', response);

          if (response.status === 200) {
            capturedRef.current = true;  // Set captured to true in the ref after successful capture
            navigate("/order-success");  // Redirect on success
          } else {
            alert("There was an error completing your payment. Please try again.");
            navigate("/payment/cancel");
          }
        } catch (error) {
          console.error("Error capturing payment:", error);
          alert("There was an error completing your payment. Please try again.");
          navigate("/payment/cancel");
        }
      };

      capturePayment();
    } else {
      alert("Invalid payment details.");
      navigate("/payment/cancel");
    }
  }, [navigate]);  // No need to depend on `captured` anymore since we use `useRef`

  return (
    <div>
      <h1>Processing your payment...</h1>
      <p>Please wait while we confirm your payment.</p>
    </div>
  );
};

export default PaypalPaymentSuccess;
