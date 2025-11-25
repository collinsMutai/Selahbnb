import React from "react";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import "./Contact.css";
import bedroomimage from "../../images/bedroom1_img1.avif"

const Contact = () => {
  return (
    <>
      {/* Existing Section */}
      <section className="contact-section">
        <h2 className="contact-title">Contact Us</h2>
        <p className="contact-description">
          We'd love to hear from you. Reach out to us through any of the channels below.
        </p>

        <div className="contact-grid">
          <div className="contact-card">
            <FaPhoneAlt className="contact-icon" />
            <h3 className="contact-heading">Phone</h3>
            <p className="contact-text">+17194920042</p>
          </div>

          <div className="contact-card">
            <FaEnvelope className="contact-icon" />
            <h3 className="contact-heading">Email</h3>
            <p className="contact-text">selahsprings48@gmail.com</p>
          </div>

          <div className="contact-card">
            <FaMapMarkerAlt className="contact-icon" />
            <h3 className="contact-heading">Address</h3>
            <p className="contact-text">
              Colorado Springs, Colorado, United States
            </p>
          </div>
        </div>
      </section>

      {/* NEW Two-Column Section */}
      <section className="contact-two-column">
        {/* Left Column with Image */}
        <div className="contact-image-column">
          <img
            src={bedroomimage} 
            alt="Contact visual"
            className="contact-left-image"
          />
        </div>

        {/* Right Column with Form */}
        <div className="contact-form-column">
          <h2 className="form-title">Send Us a Message</h2>

          <form className="contact-form">
            <input type="text" placeholder="Name" className="form-input" required />
            <input type="email" placeholder="Email" className="form-input" required />
            <input type="tel" placeholder="Phone" className="form-input" required />
            <textarea placeholder="Message" className="form-textarea" rows="5" required />

            <button type="submit" className="form-btn">Submit</button>
          </form>
        </div>
      </section>
    </>
  );
};

export default Contact;
