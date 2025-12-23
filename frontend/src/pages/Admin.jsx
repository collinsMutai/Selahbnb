import React, { useState, useEffect } from "react";
import axios from "axios";
import { ThreeDots } from "react-loader-spinner"; // Import the spinner component
import { toast } from "react-toastify"; // Import toast for showing notifications
import "./Admin.css"; // Optional for custom styles

const Admin = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [paypalTransactions, setPaypalTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State variables for search and dropdown filter for bookings
  const [searchTerm, setSearchTerm] = useState("");
  const [filterColumn, setFilterColumn] = useState("name");

  // Pagination states for Bookings
  const [currentPageBookings, setCurrentPageBookings] = useState(1);
  const itemsPerPageBookings = 5;

  // Pagination states for PayPal Transactions
  const [currentPageTransactions, setCurrentPageTransactions] = useState(1);
  const itemsPerPageTransactions = 5;

  // Fetch all bookings from the API
  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("You are not logged in. Please log in first.");
        setLoading(false);
        return;
      }

      const response = await axios.get(`${process.env.REACT_APP_API_URL}/users/bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
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

  // Fetch PayPal transactions
  const fetchPaypalTransactions = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/paypal/transactions`);
      setPaypalTransactions(response.data);
    } catch (err) {
      console.error("Error fetching PayPal transactions:", err);
    }
  };

  // Handle search input change for bookings
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    filterBookings(value, filterColumn);
  };

  // Handle column filter change (dropdown) for bookings
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
    setCurrentPageBookings(1); // Reset to page 1 after filtering
  };

  // Pagination for Bookings
  const getPaginatedBookings = () => {
    const indexOfLastItem = currentPageBookings * itemsPerPageBookings;
    const indexOfFirstItem = indexOfLastItem - itemsPerPageBookings;
    return filteredBookings.slice(indexOfFirstItem, indexOfLastItem);
  };

  // Handle page change for Bookings
  const handlePageChangeBookings = (pageNumber) => {
    const totalPages = Math.ceil(filteredBookings.length / itemsPerPageBookings);
    if (pageNumber < 1 || pageNumber > totalPages) return; // Prevent invalid page numbers
    setCurrentPageBookings(pageNumber);
  };

  // Pagination for PayPal Transactions
  const getPaginatedTransactions = () => {
    const indexOfLastItem = currentPageTransactions * itemsPerPageTransactions;
    const indexOfFirstItem = indexOfLastItem - itemsPerPageTransactions;
    return paypalTransactions.slice(indexOfFirstItem, indexOfLastItem);
  };

  // Handle page change for PayPal Transactions
  const handlePageChangeTransactions = (pageNumber) => {
    const totalPages = Math.ceil(paypalTransactions.length / itemsPerPageTransactions);
    if (pageNumber < 1 || pageNumber > totalPages) return; // Prevent invalid page numbers
    setCurrentPageTransactions(pageNumber);
  };

  // Fetch bookings and PayPal transactions when the component mounts
  useEffect(() => {
    fetchBookings();
    fetchPaypalTransactions();
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <ThreeDots height="80" width="80" radius="9" color="#148992" ariaLabel="three-dots-loading" visible={true} />
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
      {/* Bookings Table */}
      {filteredBookings.length > 0 ? (
        <>
          <div className="table-wrapper">
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
                {getPaginatedBookings().map((booking) => (
                  <tr key={booking._id}>
                    <td>{booking.name}</td>
                    <td>{booking.phone}</td>
                    <td>{new Date(booking.checkIn).toLocaleDateString()}</td>
                    <td>{new Date(booking.checkOut).toLocaleDateString()}</td>
                    <td>${parseFloat(booking.totalPrice).toFixed(2)}</td>
                    <td>{booking.status}</td>
                    <td>{booking.paymentStatus}</td>
                    <td>
                      {booking.paymentStatus === "Completed" && booking.status !== "Refunded" && (
                        <button className="btn btn-refund">Refund</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls for Bookings */}
            <div className="pagination-controls">
              <button onClick={() => handlePageChangeBookings(currentPageBookings - 1)} disabled={currentPageBookings === 1}>
                Previous
              </button>
              <span>Page {currentPageBookings}</span>
              <button onClick={() => handlePageChangeBookings(currentPageBookings + 1)} disabled={currentPageBookings * itemsPerPageBookings >= filteredBookings.length}>
                Next
              </button>
            </div>
          </div>
        </>
      ) : (
        <p>No bookings available</p>
      )}

      {/* PayPal Transactions Overview */}
      <h2>PayPal Transactions Overview</h2>
      {paypalTransactions.length > 0 ? (
        <>
          <div className="table-wrapper">
            <table className="paypal-transaction-table booking-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Payer Email</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {getPaginatedTransactions().map((transaction) => (
                  <tr key={transaction._id}>
                    <td>{transaction.orderId}</td>
                    <td>{transaction.payerEmail}</td>
                    <td>${transaction.amount}</td>
                    <td>{transaction.status}</td>
                    <td>{new Date(transaction.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls for PayPal Transactions */}
            <div className="pagination-controls">
              <button onClick={() => handlePageChangeTransactions(currentPageTransactions - 1)} disabled={currentPageTransactions === 1}>
                Previous
              </button>
              <span>Page {currentPageTransactions}</span>
              <button onClick={() => handlePageChangeTransactions(currentPageTransactions + 1)} disabled={currentPageTransactions * itemsPerPageTransactions >= paypalTransactions.length}>
                Next
              </button>
            </div>
          </div>
        </>
      ) : (
        <p>No PayPal transactions available</p>
      )}
    </div>
  );
};

export default Admin;
