import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State to toggle mobile menu

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen); // Toggle the state to show/hide the mobile menu
  };

  // Close menu after navigating to a link
  const handleLinkClick = () => {
    setIsMenuOpen(false); // Close the menu when a link is clicked
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="logo">
          <span className="navbar-logo">Selah</span>
        </div>

        {/* Hamburger Icon for mobile menu */}
        <div
          className={`hamburger ${isMenuOpen ? "active" : ""}`}
          onClick={toggleMenu}
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </div>

        {/* Menu Links (Left-aligned) */}
        <ul className={`navbar-links ${isMenuOpen ? "active" : ""}`}>
          <li>
            <NavLink
              to="/"
              className="navbar-link"
              end
              onClick={handleLinkClick}
              activeClassName="active" // Apply 'active' class when link is active
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/about"
              className="navbar-link"
              onClick={handleLinkClick}
              activeClassName="active"
            >
              About
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/services"
              className="navbar-link"
              onClick={handleLinkClick}
              activeClassName="active"
            >
              Services
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/contact"
              className="navbar-link"
              onClick={handleLinkClick}
              activeClassName="active"
            >
              Contact
            </NavLink>
          </li>
        </ul>

        {/* Right-aligned section */}
        <div className="navbar-right">
          <div className="user-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="icon icon-tabler icons-tabler-outline icon-tabler-user-circle"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
              <path d="M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
              <path d="M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855" />
            </svg>
          </div>
          <div className="phone-number">
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
              className="phone-icon"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2" />
            </svg>
            <span>+1 234 567 890</span>
          </div>

          <div className="book-now">
            <button className="book-now-btn">Book Now</button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
