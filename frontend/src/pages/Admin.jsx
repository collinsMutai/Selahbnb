import React from "react";
import { NavLink, Routes, Route, Navigate } from "react-router-dom";
import Bookings from "../components/AdminBookings/Bookings";
import Users from "../components/Users/Users";
import "./Admin.css";

const Admin = () => {
  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <h2 className="sidebar-title">Admin Panel</h2>

        <ul className="sidebar-menu">
          <li>
            <NavLink
              to="bookings"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Bookings
            </NavLink>
          </li>

          <li>
            <NavLink
              to="users"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Users
            </NavLink>
          </li>

          <li>
            <NavLink
              to="settings"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Settings
            </NavLink>
          </li>
        </ul>
      </aside>

      {/* Content (RIGHT SIDE) */}
      <main className="admin-content">
        <Routes>
          {/* Default admin route */}
          <Route index element={<Navigate to="bookings" replace />} />

          <Route path="bookings" element={<Bookings />} />
          <Route path="users" element={<Users />} />

          {/* Optional */}
          <Route path="settings" element={<h2>Settings (Coming Soon)</h2>} />
        </Routes>
      </main>
    </div>
  );
};

export default Admin;
