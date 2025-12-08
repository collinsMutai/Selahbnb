import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import "./Bookings.css";

const apiUrl = process.env.REACT_APP_API_URL;

const Bookings = () => {
  const user = useSelector((state) => state.user.user);

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Search + Filter States
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  // ✅ Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 5;

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get(`${apiUrl}/bookings/user`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        setBookings(res.data || []);
      } catch (err) {
        console.error(err);
        setError("Unable to load your booking history.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // -------------------------------------------------
  // ✅ FILTER + SEARCH LOGIC
  // -------------------------------------------------
  const filteredBookings = bookings
    .filter((b) => {
      // Search by name or phone
      const query = search.toLowerCase();
      return (
        b.name.toLowerCase().includes(query) ||
        b.phone.includes(query)
      );
    })
    .filter((b) => {
      // Status filter
      if (statusFilter === "all") return true;
      return b.status === statusFilter;
    })
    .filter((b) => {
      // Payment filter
      if (paymentFilter === "all") return true;
      return b.paymentStatus === paymentFilter;
    });

  // -------------------------------------------------
  // ✅ Pagination Logic
  // -------------------------------------------------
  const totalPages = Math.ceil(filteredBookings.length / perPage);

  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // --------------------------
  // Loading state
  // --------------------------
  if (loading) {
    return (
      <div className="spinner-container">
        <h1>Loading bookings...</h1>
      </div>
    );
  }

  // --------------------------
  // Error state
  // --------------------------
  if (error) {
    return (
      <div className="card">
        <h2 className="subtitle">Your Booking History</h2>
        <p style={{ color: "red", textAlign: "center" }}>{error}</p>
      </div>
    );
  }

  // --------------------------
  // Main UI
  // --------------------------
  return (
    <div className="card">
      <h2 className="subtitle">Your Booking History</h2>

      {/* ==========================
          ✅ SEARCH + FILTER BAR
      ========================== */}
      <div style={{ marginBottom: "15px", display: "flex", gap: "10px" }}>

        {/* Search Input */}
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          style={{
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        >
          <option value="all">All Status</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Pending">Pending</option>
        </select>

        {/* Payment Filter */}
        <select
          value={paymentFilter}
          onChange={(e) => {
            setPaymentFilter(e.target.value);
            setCurrentPage(1);
          }}
          style={{
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        >
          <option value="all">All Payments</option>
          <option value="Completed">Completed</option>
          <option value="Pending">Pending</option>
          <option value="Failed">Failed</option>
        </select>
      </div>

      {/* ==========================
          ✅ TABLE
      ========================== */}
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Total Price</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Guests</th>
            </tr>
          </thead>

          <tbody>
            {paginatedBookings.length > 0 ? (
              paginatedBookings.map((b) => (
                <tr key={b._id}>
                  <td>{b.name}</td>
                  <td>{b.phone}</td>
                  <td>{new Date(b.checkIn).toLocaleDateString()}</td>
                  <td>{new Date(b.checkOut).toLocaleDateString()}</td>
                  <td>${b.totalPrice}</td>
                  <td>{b.status}</td>
                  <td>{b.paymentStatus}</td>
                  <td>
                    Adults: {b.adults}, Children: {b.children}, Infants:{" "}
                    {b.infants}, Pets: {b.pets}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" style={{ textAlign: "center" }}>
                  No bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ==========================
          ✅ Pagination Controls
      ========================== */}
      <div
        style={{
          marginTop: "10px",
          display: "flex",
          justifyContent: "center",
          gap: "8px",
        }}
      >
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-btn"
        >
          Prev
        </button>

        <span style={{ padding: "6px 10px" }}>
          Page {currentPage} / {totalPages || 1}
        </span>

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="pagination-btn"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Bookings;
