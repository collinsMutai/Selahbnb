import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Admin.css'; // Optional for custom styles

const Admin = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all bookings from the API
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get('/api/bookings');  // Adjust API endpoint as needed
        setBookings(response.data); // Set bookings data
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch bookings');
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) {
    return (
      <div className="loading">
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
                <td>${booking.totalPrice}</td>
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
