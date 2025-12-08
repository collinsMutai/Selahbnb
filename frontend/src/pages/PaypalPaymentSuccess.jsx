import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux"; 
import { setBookingData, setPaymentProcessed } from "../redux/bookingSlice"; 
import { toast, ToastContainer } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css"; 
import { TailSpin } from "react-loader-spinner"; // Import TailSpin spinner

import "./PaypalPaymentSuccess.css"; 

const apiUrl =
  process.env.REACT_APP_API_URL;

const PaypalPaymentSuccess = () => {
  const dispatch = useDispatch(); 

  const { paymentProcessed } = useSelector(state => state.booking);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if payment has already been processed using localStorage or Redux
  const isPaymentProcessed = localStorage.getItem("paymentProcessed") === "true" || paymentProcessed;

  // Check if booking data is already stored in localStorage
  const storedBookingData = JSON.parse(localStorage.getItem("bookingDetails"));
  const [bookingDetails, setBookingDetails] = useState(storedBookingData || null);

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

                const bookingData = response.data.booking;

                setBookingDetails(bookingData);
                setLoading(false);

            } catch (error) {
                console.error("Error capturing payment:", error);
                setError("An error occurred while processing your payment.");
                setLoading(false);
            }
        };

        capturePayment();
    } else {
        setLoading(false);
    }
}, []);


  if (loading) {
    return (
      <div className="spinner-container">
        <h1>Processing your payment...</h1>
        <p>Please wait while we confirm your payment.</p>

        {/* Using TailSpin Spinner */}
        <TailSpin height="80" width="80" color="#148992" margin-top="130" ariaLabel="tail-spin-loading" />
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
      <div className="card">
        <h2 className="subtitle">Your Booking Details</h2>

        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Check-in Date</th>
              <th>Check-out Date</th>
              <th>Total Price</th>
              <th>Status</th>
              <th>Payment Status</th>
              <th>Guests</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{bookingDetails.name}</td>
              <td>{bookingDetails.phone}</td>
              <td>{new Date(bookingDetails.checkIn).toLocaleDateString()}</td>
              <td>{new Date(bookingDetails.checkOut).toLocaleDateString()}</td>
              <td>${bookingDetails.totalPrice}</td>
              <td>{bookingDetails.status}</td>
              <td>{bookingDetails.paymentStatus}</td>
              <td>
                Adults: {bookingDetails.adults}, Children: {bookingDetails.children}, 
                Infants: {bookingDetails.infants}, Pets: {bookingDetails.pets}
              </td>
            </tr>
          </tbody>
        </table>

        <ToastContainer />
      </div>
    );
  }

  return null;
};

export default PaypalPaymentSuccess;
