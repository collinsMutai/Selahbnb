import React from "react";
import AdminBookings from "../components/AdminBookings/Bookings";
import "./Admin.css";

const Admin = () => {
  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <h2 className="sidebar-title">Admin Panel</h2>
        <ul className="sidebar-menu">
          <li className="active">Bookings</li>
          <li>PayPal Transactions</li>
          <li>Users</li>
          <li>Settings</li>
        </ul>
      </aside>

      {/* Content */}
      <main className="admin-content">
        <AdminBookings />
      </main>
    </div>
  );
};

export default Admin;
