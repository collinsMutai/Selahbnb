import React, { useEffect, useState } from "react";
import "./Footer.css";
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from "react-icons/fa"; // Correct import after installation
import { useNavigate, useLocation } from "react-router-dom"; // Import useNavigate
import Selah_Logo from "../../images/Selah_Logo.png";

const Footer = () => {
  const navigate = useNavigate(); // Initialize navigate function
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Function to handle link clicks (other than overview)
  const handleLinkClick = (e, path) => {
    e.preventDefault(); // Prevent default anchor link behavior
    navigate(path); // Navigate to the desired path
    window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to the top after navigation
  };

  // Function to handle overview scroll with navbar offset
  const handleOverviewClick = (e) => {
    e.preventDefault(); // Prevent default behavior

    // Check if we're already on the homepage or not
    const isHomePage = window.location.pathname === "/";
    const formSection = document.getElementById("form");

    if (isHomePage && formSection) {
      // If you're already on the homepage, just scroll to the overview section
      const navbarHeight = document.querySelector(".navbar")?.offsetHeight || 0; // Get navbar height
      window.scrollTo({
        top: formSection.offsetTop - navbarHeight, // Adjust for navbar
        behavior: "smooth", // Smooth scroll
      });
    } else {
      // If we're not on the homepage, navigate to homepage first
      navigate("/", { replace: true });

      // Scroll after the page load, once navigation has happened
      setTimeout(() => {
        const formSection = document.getElementById("form");
        if (formSection) {
          const navbarHeight =
            document.querySelector(".navbar")?.offsetHeight || 0; // Get navbar height
          window.scrollTo({
            top: formSection.offsetTop - navbarHeight, // Adjust for navbar height
            behavior: "smooth", // Smooth scroll
          });
        }
      }, 300); // Small delay to ensure the page has loaded before scrolling
    }
  };

  // Ensure scrolling to overview section on initial load if hash is present
  useEffect(() => {
    if (window.location.hash === "#overview") {
      const formSection = document.getElementById("overview");
      if (formSection) {
        const navbarHeight =
          document.querySelector(".navbar")?.offsetHeight || 0; // Get navbar height
        window.scrollTo({
          top: formSection.offsetTop - navbarHeight,
          behavior: "smooth",
        });
      }
    }
  }, []); // This ensures the first time the page loads and we need to scroll

  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Left section (Logo and menu links) */}
        <div className="footer-left">
             <div className="logo">
            <img src={Selah_Logo} alt="Selah Logo" className="selahnavbar-logo" />
          </div>
          <div className="footer-links">
            <a href="/" onClick={(e) => handleLinkClick(e, "/")}>
              Home
            </a>
            <a href="#overview" onClick={handleOverviewClick}>
              Overview
            </a>
            <a href="/places" onClick={(e) => handleLinkClick(e, "/places")}>
              Places
            </a>
            <a href="/contact" onClick={(e) => handleLinkClick(e, "/contact")}>
              Contact
            </a>

            {/* Book Now Link */}
            <a
              href="/"
              onClick={handleOverviewClick}
              className="footer-book-now-link"
            >
              Book Now
            </a>
          </div>
        </div>

        {/* Right section (Email and phone) */}
        <div className="footer-right">
          <p>
            Email:{" "}
            <a href="mailto:info@mywebsite.com">selahsprings48@gmail.com</a>
          </p>
          <p>
            Phone: <a href="tel:+1234567890">+17194920042</a>
          </p>
        </div>
      </div>

      {/* Bottom section (Copyright and social icons) */}
      <div className="footer-bottom">
        <p className="footer-copyright">
          &copy; {new Date().getFullYear()} Selah Springs. All Rights Reserved.
        </p>
        <div className="footer-social">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaFacebook size={24} />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaTwitter size={24} />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaLinkedin size={24} />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaInstagram size={24} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
