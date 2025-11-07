import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

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
        <div className={`hamburger ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </div>

        {/* Menu Links (Left-aligned) */}
        <ul className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
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
            <i className="fa fa-user"></i>
          </div>
          <div className="phone-number">
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
