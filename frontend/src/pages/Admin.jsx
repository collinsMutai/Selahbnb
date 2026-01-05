import React, { useEffect, useState } from "react";
import {
  NavLink,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { useDispatch } from "react-redux";
import Bookings from "../components/AdminBookings/Bookings";
import Users from "../components/Users/Users";
import Analytics from "../components/Analytics/Analytics";
import AdminCalendar from "../components/AdminCalendar/AdminCalendar";
import { logout } from "../redux/userSlice";
import "./Admin.css";

const Admin = () => {
  const [userData, setUserData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const GLOBAL_LISTING_ID = process.env.REACT_APP_GLOBAL_LISTING_ID;

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("user"));
    if (data) setUserData(data);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const handleLinkClick = () => {
    if (window.innerWidth <= 768) setSidebarOpen(false);
  };

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <h2 className="sidebar-title">Admin Panel</h2>
        <ul className="sidebar-menu">
          <li>
            <NavLink
              to="analytics"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={handleLinkClick}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M3 13a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z" />
                <path d="M15 9a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z" />
                <path d="M9 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z" />
                <path d="M4 20h14" />
              </svg>
              {sidebarOpen && <span>Analytics</span>}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="bookings"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={handleLinkClick}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M12 13m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0" />
                <path d="M13.45 11.55l2.05-2.05" />
                <path d="M6.4 20a9 9 0 1 1 11.2 0z" />
              </svg>
              {sidebarOpen && <span>Bookings</span>}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="users"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={handleLinkClick}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0" />
                <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                <path d="M21 21v-2a4 4 0 0 0-3-3.85" />
              </svg>
              {sidebarOpen && <span>Users</span>}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="calendar"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={handleLinkClick}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {sidebarOpen && <span>Calendar</span>}
            </NavLink>
          </li>
        </ul>

        <div className="sidebar-footer">
          {userData && userData.profilePicture ? (
            <img src={userData.profilePicture} alt="User" className="avatar-img" />
          ) : (
            <p>Loading...</p>
          )}
          <NavLink onClick={handleLogout} className="logout-link">
            <span>Logout</span>
          </NavLink>
        </div>
      </aside>

      <main className="admin-content">
        <div className="toggle-sidebar-btn" onClick={toggleSidebar}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </div>

        <Routes>
          <Route index element={<Navigate to="analytics" replace />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="users" element={<Users />} />
          <Route path="calendar" element={<AdminCalendar listingId={GLOBAL_LISTING_ID} />} />
        </Routes>
      </main>
    </div>
  );
};

export default Admin;
