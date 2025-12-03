import React, { useState, useEffect } from "react";
import axios from "axios";
import { ThreeDots } from "react-loader-spinner"; // Import the spinner component
import "./Admin.css"; // Optional for custom styles

const Admin = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all bookings from the API
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // Retrieve the token from localStorage
        const token = localStorage.getItem("token");

        if (!token) {
          setError("You are not logged in. Please log in first.");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          "http://localhost:5000/api/users/bookings",
          {
            headers: {
              Authorization: `Bearer ${token}`, // Include the token in the request header
            },
          }
        );

        setBookings(response.data); // Set bookings data
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch bookings: " + err.message);
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <ThreeDots 
          height="80" 
          width="80" 
          radius="9" 
          color="#148992" 
          ariaLabel="three-dots-loading"
          visible={true} 
        />
        <h2>Loading...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <h2>{error}</h2>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <h2>Bookings Overview</h2>

      <table className="booking-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Check-in</th>
            <th>Check-out</th>
            <th>Total Price</th>
            <th>Status</th>
            <th>Payment Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.length === 0 ? (
            <tr>
              <td colSpan="8">No bookings available</td>
            </tr>
          ) : (
            bookings.map((booking) => (
              <tr key={booking._id}>
                <td>{booking.name}</td>
                <td>{booking.phone}</td>
                <td>{new Date(booking.checkIn).toLocaleDateString()}</td>
                <td>{new Date(booking.checkOut).toLocaleDateString()}</td>
                <td>${parseFloat(booking.totalPrice).toFixed(2)}</td>
                <td>{booking.status}</td>
                <td>{booking.paymentStatus}</td>
                <td>
                  <button className="btn btn-view">View</button>
                  <button className="btn btn-delete">Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Admin;
