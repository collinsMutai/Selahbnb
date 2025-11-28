import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux"; 
import { setBookingData, setPaymentProcessed } from "../redux/bookingSlice"; 
import { toast, ToastContainer } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css"; 
import { TailSpin } from "react-loader-spinner"; // Import TailSpin spinner

import "./PaypalPaymentSuccess.css"; 

const apiUrl = process.env.REACT_APP_API_URL || "https://875660ecaa99.ngrok-free.app/api";

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
    // Check if the toast has already been shown using localStorage
    const toastShown = localStorage.getItem("toastShown");

    // If booking data is available and toast hasn't been shown before
    if (bookingDetails && toastShown !== "true") {
      // Show success toast
      toast.success("Thank you for booking with us! You will receive a confirmation email shortly.");
      
      // Mark the toast as shown in localStorage
      localStorage.setItem("toastShown", "true");
    }

    // If payment has already been processed, skip the capture process
    if (isPaymentProcessed) {
      setLoading(false);
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const payerID = params.get("PayerID");

    // Only fetch payment if we don't have the paymentProcessed flag and booking data in localStorage
    if (token && payerID && !isPaymentProcessed) {
      const capturePayment = async () => {
        try {
          const response = await axios.post(`${apiUrl}/paypal/capture`, {
            orderId: token,
            payerId: payerID,
          });

          if (response.status === 200 && response.data.booking) {
            const bookingData = response.data.booking;

            // Dispatch Redux actions to update the store with the booking data
            dispatch(setBookingData({
              name: bookingData.name,
              phone: bookingData.phone,
              checkIn: bookingData.checkIn,
              checkOut: bookingData.checkOut,
              adults: bookingData.adults,
              children: bookingData.children,
              infants: bookingData.infants,
              pets: bookingData.pets,
              totalPrice: bookingData.totalPrice,
              status: bookingData.status,
              paymentStatus: bookingData.paymentStatus,
              paymentProcessed: true, // Set paymentProcessed flag to true
              listingId: "6929ea1334872125aba99042",
            }));

            // Set payment as processed in Redux and store it in localStorage to prevent re-triggering
            dispatch(setPaymentProcessed(true));
            localStorage.setItem("paymentProcessed", "true");

            // Store booking details in localStorage for re-use after page reload
            localStorage.setItem("bookingDetails", JSON.stringify(bookingData));

            setBookingDetails(bookingData); // Set booking data to state
            setLoading(false);
          }
        } catch (error) {
          console.error("Error capturing payment:", error);
          setError("An error occurred while processing your payment.");
          setLoading(false);
        }
      };

      capturePayment();
    } else {
      setLoading(false); // No payment capture needed if data is already present in localStorage
    }
  }, [dispatch, isPaymentProcessed, bookingDetails]); // Dependency on bookingDetails to show the toast only when the booking is confirmed

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
