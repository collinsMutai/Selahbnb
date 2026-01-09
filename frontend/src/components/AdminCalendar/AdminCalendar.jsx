import React, { useEffect, useState } from "react";
import axios from "axios";

const GLOBAL_LISTING_ID = "695025737ee434d532c393eb";

const AdminCalendar = () => {
  const [calendar, setCalendar] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  // Function to fetch calendar data
  const fetchCalendar = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found. Redirecting to login...");
      window.location.href = "/"; // Or use React Router: history.push("/login")
      return;
    }

    try {
      const api = axios.create({
        baseURL: process.env.REACT_APP_API_URL, // Make sure your API URL is set in .env
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const res = await api.get(
        `/bookings/admin/listings/${GLOBAL_LISTING_ID}/calendar`
      );
      setCalendar(res.data);
    } catch (err) {
      console.error("Error fetching calendar:", err.response || err);
      if (err.response && err.response.status === 401) {
        console.error("Token expired or invalid. Redirecting to login...");
        window.location.href = "/login"; // Or use React Router: history.push("/login")
      }
    }
  };

  // Check token existence and fetch calendar when component mounts
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found. Redirecting to login...");
      window.location.href = "/"; // Or use React Router: history.push("/login")
    } else {
      fetchCalendar();
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // ➕ Block dates form handler
  const handleBlock = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found. Redirecting to login...");
      window.location.href = "/login"; // Or use React Router: history.push("/login")
      return;
    }

    try {
      const api = axios.create({
        baseURL: process.env.REACT_APP_API_URL,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await api.post(
        `/bookings/admin/listings/${GLOBAL_LISTING_ID}/block-dates`,
        {
          startDate,
          endDate,
          reason,
        }
      );

      setStartDate("");
      setEndDate("");
      setReason("");
      fetchCalendar(); // Refresh the calendar after blocking the dates
    } catch (err) {
      console.error("Error blocking dates:", err.response || err);
    }
  };

  // ❌ Remove admin block
  const handleDelete = async (id) => {
    if (!window.confirm("Remove this block?")) return;

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found. Redirecting to login...");
      window.location.href = "/login"; // Or use React Router: history.push("/login")
      return;
    }

    try {
      const api = axios.create({
        baseURL: process.env.REACT_APP_API_URL,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await api.delete(`/bookings/admin/bookings/${id}`);
      fetchCalendar(); // Refresh the calendar after removing the block
    } catch (err) {
      console.error("Error deleting block:", err.response || err);
    }
  };

  return (
    <div>
      <h2>Admin Calendar</h2>

      {/* Block Dates Form */}
      <form onSubmit={handleBlock} style={{ marginBottom: 20 }}>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Reason (maintenance, owner stay)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <button type="submit">Block Dates</button>
      </form>

      {/* Calendar Table */}
      <table width="100%" border="1" cellPadding="6">
        <thead>
          <tr>
            <th>From</th>
            <th>To</th>
            <th>Type</th>
            <th>Reason / Guest</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {calendar.map((item) => (
            <tr key={item._id}>
              <td>{item.checkIn.slice(0, 10)}</td>
              <td>{item.checkOut.slice(0, 10)}</td>
              <td>{item.createdBy === "admin" ? "🟥 Block" : "🟦 Booking"}</td>
              <td>
                {item.createdBy === "admin"
                  ? item.blockReason || "—"
                  : item.user?.name}
              </td>
              <td>
                {item.createdBy === "admin" && (
                  <button onClick={() => handleDelete(item._id)}>Delete</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminCalendar;
