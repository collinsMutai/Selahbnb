import React, { useState, useEffect } from "react";
import axios from "axios";
import { ThreeDots } from "react-loader-spinner"; // Import the spinner component
import "./Admin.css"; // Optional for custom styles
import { toast } from "react-toastify"; // Import toast for showing notifications

const Admin = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State variables for search and dropdown filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterColumn, setFilterColumn] = useState("name"); // default filter column: "name"

  // Fetch all bookings from the API
  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("You are not logged in. Please log in first.");
        setLoading(false);
        return;
      }

      const response = await axios.get("http://localhost:5000/api/users/bookings", {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the request header
        },
      });

      setBookings(response.data);
      setFilteredBookings(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch bookings: " + err.message);
      setLoading(false);
    }
  };

  // Handle refund action
  const handleRefund = async (bookingId) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/paypal/refund",
        { bookingId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      if (response.status === 200) {
        toast.success("Refund successful!"); // Show success toast
        fetchBookings(); // Re-fetch bookings to reflect the refund
      } else {
        toast.error("Failed to issue refund."); // Show error toast
      }
    } catch (error) {
      console.error("Error issuing refund:", error);
      toast.error("Error issuing refund. Please try again."); // Show error toast on exception
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    filterBookings(value, filterColumn);
  };

  // Handle column filter change (dropdown)
  const handleFilterColumnChange = (e) => {
    const column = e.target.value;
    setFilterColumn(column);
    filterBookings(searchTerm, column); // Reapply search with the new filter column
  };

  // Filter bookings based on search term and filter column
  const filterBookings = (term, column) => {
    const filtered = bookings.filter((booking) => {
      const field = booking[column]?.toString().toLowerCase();
      return field?.includes(term.toLowerCase());
    });
    setFilteredBookings(filtered);
  };

  // Fetch bookings when the component mounts
  useEffect(() => {
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

      {/* Filter Section */}
      <div className="filter-section">
        <input
          type="text"
          value={searchTerm}
          placeholder="Search Bookings"
          onChange={handleSearchChange}
          className="search-input"
        />
        <select
          value={filterColumn}
          onChange={handleFilterColumnChange}
          className="filter-dropdown"
        >
          <option value="name">Name</option>
          <option value="phone">Phone</option>
          <option value="status">Status</option>
          <option value="paymentStatus">Payment Status</option>
          <option value="checkIn">Check-in</option>
          <option value="checkOut">Check-out</option>
        </select>
      </div>

      {/* Bookings Table */}
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
          {filteredBookings.length === 0 ? (
            <tr>
              <td colSpan="8">No bookings available</td>
            </tr>
          ) : (
            filteredBookings.map((booking) => (
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
                  {booking.paymentStatus === "Completed" && booking.status !== "Refunded" && (
                    <button
                      className="btn btn-refund"
                      onClick={() => handleRefund(booking._id)}
                    >
                      Refund
                    </button>
                  )}
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
