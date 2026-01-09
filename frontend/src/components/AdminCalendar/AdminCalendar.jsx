import React, { useEffect, useState } from "react";
import axios from "axios";

// Define the global listing ID
const GLOBAL_LISTING_ID = "695025737ee434d532c393eb";

const AdminCalendar = () => {
  const [calendar, setCalendar] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  // Get token from localStorage
const token = localStorage.getItem("token");
console.log('token',token);



  // Axios instance with Authorization header
  const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // 🔄 Fetch calendar data
  const fetchCalendar = async () => {
    try {
      const res = await api.get(`/bookings/admin/listings/${GLOBAL_LISTING_ID}/calendar`);
      setCalendar(res.data);
    } catch (err) {
      console.error("Error fetching calendar:", err);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, []);

  // ➕ Block dates
  const handleBlock = async (e) => {
    e.preventDefault();

    try {
      await api.post(`/bookings/admin/listings/${GLOBAL_LISTING_ID}/block-dates`, {
        startDate,
        endDate,
        reason,
      });
      setStartDate("");
      setEndDate("");
      setReason("");
      fetchCalendar();
    } catch (err) {
      console.error("Error blocking dates:", err);
    }
  };

  // ❌ Remove admin block
  const handleDelete = async (id) => {
    if (!window.confirm("Remove this block?")) return;
    try {
      await api.delete(`/bookings/admin/bookings/${id}`);
      fetchCalendar();
    } catch (err) {
      console.error("Error deleting block:", err);
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
                {item.createdBy === "admin" ? item.blockReason || "—" : item.user?.name}
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
