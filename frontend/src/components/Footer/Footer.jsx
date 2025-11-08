import React from 'react';
import './Footer.css';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa'; // Correct import after installation

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Left section (Logo and menu links) */}
        <div className="footer-left">
          <h2 className="footer-logo">Selah</h2>
          <div className="footer-links">
            <a href="/overview">Overview</a>
            <a href="/services">Services</a>
            <a href="/blog">Blog</a>
            <a href="/contact">Contact</a>
          </div>
        </div>
        
        {/* Right section (Email and phone) */}
        <div className="footer-right">
          <p>Email: <a href="mailto:info@mywebsite.com">info@selah.com</a></p>
          <p>Phone: <a href="tel:+1234567890">+1 (234) 567-890</a></p>
        </div>
      </div>

      {/* Bottom section (Copyright and social icons) */}
      <div className="footer-bottom">
        <p className="footer-copyright">&copy; {new Date().getFullYear()} Selah. All Rights Reserved.</p>
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
