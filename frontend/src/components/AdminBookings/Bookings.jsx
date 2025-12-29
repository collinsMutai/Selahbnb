import React, { useEffect, useState } from "react";
import axios from "axios";
import { ThreeDots } from "react-loader-spinner";
import "./Bookings.css";

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [paypalTransactions, setPaypalTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [pageBookings, setPageBookings] = useState(1);
  const [pagePaypal, setPagePaypal] = useState(1);
  const perPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const bookingsRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/users/bookings`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const paypalRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/paypal/transactions`
        );

        setBookings(bookingsRes.data);
        setPaypalTransactions(paypalRes.data);
        setLoading(false);
      } catch {
        setError("Failed to load data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const paginate = (data, page) =>
    data.slice((page - 1) * perPage, page * perPage);

  if (loading) {
    return (
      <div className="loading">
        <ThreeDots color="#148992" />
      </div>
    );
  }

  if (error) return <div className="error">{error}</div>;

  return (
    <>
      <h2>Bookings</h2>

      <div className="table-wrapper">
        <table className="booking-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Total</th>
              <th>Status</th>
              <th>Payment</th>
            </tr>
          </thead>
          <tbody>
            {paginate(bookings, pageBookings).map((b) => (
              <tr key={b._id}>
                <td>{b.name}</td>
                <td>{b.phone}</td>
                <td>{new Date(b.checkIn).toLocaleDateString()}</td>
                <td>{new Date(b.checkOut).toLocaleDateString()}</td>
                <td>${b.totalPrice}</td>
                <td>{b.status}</td>
                <td>{b.paymentStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination-controls">
          <button
            disabled={pageBookings === 1}
            onClick={() => setPageBookings((p) => p - 1)}
          >
            Previous
          </button>
          <span>Page {pageBookings}</span>
          <button
            disabled={pageBookings * perPage >= bookings.length}
            onClick={() => setPageBookings((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>

      <h2>PayPal Transactions</h2>

      <div className="table-wrapper">
        <table className="booking-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Email</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {paginate(paypalTransactions, pagePaypal).map((t) => (
              <tr key={t._id}>
                <td>{t.orderId}</td>
                <td>{t.payerEmail}</td>
                <td>${t.amount}</td>
                <td>{t.status}</td>
                <td>{new Date(t.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination-controls">
          <button
            disabled={pagePaypal === 1}
            onClick={() => setPagePaypal((p) => p - 1)}
          >
            Previous
          </button>
          <span>Page {pagePaypal}</span>
          <button
            disabled={pagePaypal * perPage >= paypalTransactions.length}
            onClick={() => setPagePaypal((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
};

export default Bookings;
