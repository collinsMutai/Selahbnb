import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const apiUrl = process.env.REACT_APP_API_URL || "https://63919269e920.ngrok-free.app/api";

const PaypalPaymentSuccess = () => {
  const navigate = useNavigate();
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

          if (response.status === 200 && response.data.booking) {
            // Payment captured successfully, set the booking details
            setBookingDetails(response.data.booking);
            setLoading(false);
          }
        } catch (error) {
          console.error("Error capturing payment:", error);
          setError("An error occurred while processing your payment.");
          setLoading(false);
        }
      };

      capturePayment();
    }
  }, [navigate]);

  if (loading) {
    return (
      <div>
        <h1>Processing your payment...</h1>
        <p>Please wait while we confirm your payment.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1>Payment Failed</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (bookingDetails) {
    return (
      <div>
        <h1>Payment Successful!</h1>
        <h2>Your Booking Details</h2>
        <div>
          <p><strong>Name:</strong> {bookingDetails.name}</p>
          <p><strong>Phone:</strong> {bookingDetails.phone}</p>
          <p><strong>Check-in:</strong> {new Date(bookingDetails.checkIn).toLocaleDateString()}</p>
          <p><strong>Check-out:</strong> {new Date(bookingDetails.checkOut).toLocaleDateString()}</p>
          <p><strong>Guests:</strong> {`Adults: ${bookingDetails.adults}, Children: ${bookingDetails.children}, Infants: ${bookingDetails.infants}, Pets: ${bookingDetails.pets}`}</p>
          <p><strong>Total Price:</strong> ${bookingDetails.totalPrice}</p>
          <p><strong>Status:</strong> {bookingDetails.status}</p>
          <p><strong>Payment Status:</strong> {bookingDetails.paymentStatus}</p>
        </div>
        <p>Thank you for booking with us! You will receive a confirmation email shortly.</p>
      </div>
    );
  }

  return null;
};

export default PaypalPaymentSuccess;
