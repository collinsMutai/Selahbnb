import React, { useEffect, useState } from "react";
import { NavLink, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Bookings from "../components/AdminBookings/Bookings";
import Users from "../components/Users/Users";
import { logout } from "../redux/userSlice";
import "./Admin.css";

const Admin = () => {
  const [userData, setUserData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true); // Sidebar state to manage visibility
  const dispatch = useDispatch(); // Redux dispatch hook
  const navigate = useNavigate(); // React Router navigate hook

  // Fetch user data from localStorage on mount
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("user"));
    if (data) {
      console.log("User data fetched:", data);
      setUserData(data);
    } else {
      console.log("No user data found in localStorage");
    }
  }, []);

  // Logout handler
  const handleLogout = () => {
    dispatch(logout());
    navigate("/"); // Redirect to home page after logout
  };

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <h2 className="sidebar-title">Admin Panel</h2>

        <ul className="sidebar-menu">
          <li>
            <NavLink to="bookings" className={({ isActive }) => (isActive ? "active" : "")}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M12 13m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                <path d="M13.45 11.55l2.05 -2.05" />
                <path d="M6.4 20a9 9 0 1 1 11.2 0z" />
              </svg>
              {sidebarOpen && <span>Bookings</span>}
            </NavLink>
          </li>

          <li>
            <NavLink to="users" className={({ isActive }) => (isActive ? "active" : "")}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
                <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                <path d="M21 21v-2a4 4 0 0 0 -3 -3.85" />
              </svg>
              {sidebarOpen && <span>Users</span>}
            </NavLink>
          </li>

          <li>
            <NavLink to="settings" className={({ isActive }) => (isActive ? "active" : "")}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M12 2v20" />
                <path d="M2 12h20" />
              </svg>
              {sidebarOpen && <span>Settings</span>}
            </NavLink>
          </li>
        </ul>

        {/* Avatar and Logout */}
        <div className="sidebar-footer">
          {userData && userData.profilePicture ? (
            <img src={userData.profilePicture} alt="User Avatar" className="avatar-img" />
          ) : (
            <p>Loading...</p>
          )}

          <NavLink onClick={handleLogout} className="logout-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
              <path d="M9 12h12l-3 -3" />
              <path d="M18 15l3 -3" />
            </svg>
            <span>Logout</span>
          </NavLink>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-content">
        {/* Toggle Sidebar Button */}
        <div className="toggle-sidebar-btn" onClick={toggleSidebar}>
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </div>

        <Routes>
          <Route index element={<Navigate to="bookings" replace />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="users" element={<Users />} />
          <Route path="settings" element={<h2>Settings (Coming Soon)</h2>} />
        </Routes>
      </main>
    </div>
  );
};

export default Admin;
