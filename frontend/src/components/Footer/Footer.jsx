import React from 'react';
import './Footer.css';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa'; // Correct import after installation
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const Footer = () => {
  const navigate = useNavigate(); // Initialize navigate function

  // Handler function for link clicks (other than overview)
  const handleLinkClick = (e, path) => {
    e.preventDefault(); // Prevent default anchor link behavior
    navigate(path); // Navigate to the desired path
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to the top after navigation
  };

  // Function to handle overview scroll with navbar offset
const handleOverviewClick = (e) => {
  e.preventDefault(); // Prevent default behavior

  // Check if you're on the homepage or not
  const isHomePage = window.location.pathname === '/';
  const overviewSection = document.getElementById("overview");

  if (isHomePage && overviewSection) {
    // If you're already on the homepage, just scroll to the overview section
    const navbarHeight = document.querySelector(".navbar")?.offsetHeight || 0; // Get navbar height
    window.scrollTo({
      top: overviewSection.offsetTop - navbarHeight, // Adjust for navbar
      behavior: "smooth", // Smooth scroll
    });
  } else if (!isHomePage) {
    // If you're not on the homepage, navigate to homepage and scroll to overview section
    navigate("/", { replace: true });

    setTimeout(() => {
      const overviewSection = document.getElementById("overview");

      if (overviewSection) {
        const navbarHeight = document.querySelector(".navbar")?.offsetHeight || 0; // Get navbar height
        window.scrollTo({
          top: overviewSection.offsetTop - navbarHeight, // Adjust for navbar height
          behavior: "smooth", // Smooth scroll
        });
      }
    }, 100); // Delay navigation to ensure the page has time to load before scrolling
  }
};


  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Left section (Logo and menu links) */}
        <div className="footer-left">
          <h2 className="footer-logo">Selah Springs</h2>
          <div className="footer-links">
            <a href="/" onClick={(e) => handleLinkClick(e, '/')}>Home</a>
            <a href="#overview" onClick={handleOverviewClick}>Overview</a>
            <a href="/places" onClick={(e) => handleLinkClick(e, '/places')}>Places</a>
            <a href="/contact" onClick={(e) => handleLinkClick(e, '/contact')}>Contact</a>
            <a href="/blog" onClick={(e) => handleLinkClick(e, '/blog')}>Book Now</a>
          </div>
        </div>

        {/* Right section (Email and phone) */}
        <div className="footer-right">
          <p>Email: <a href="mailto:info@mywebsite.com">selahsprings48@gmail.com</a></p>
          <p>Phone: <a href="tel:+1234567890">+17194920042</a></p>
        </div>
      </div>

      {/* Bottom section (Copyright and social icons) */}
      <div className="footer-bottom">
        <p className="footer-copyright">&copy; {new Date().getFullYear()} Selah Springs. All Rights Reserved.</p>
        <div className="footer-social">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebook size={24} /></a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter size={24} /></a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><FaLinkedin size={24} /></a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram size={24} /></a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
