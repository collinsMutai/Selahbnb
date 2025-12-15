import React, { useState } from "react";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import "./Contact.css";
import bedroomimage from "../../images/bedroom1_img1.avif";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [honeypot, setHoneypot] = useState(""); // Honeypot state

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;
    setLoading(true);

    // Honeypot check - if the honeypot field is filled, it's likely a bot
    if (honeypot) {
      toast.error("Bot detected! Please try again.");
      setLoading(false);
      return;
    }

    try {
      // Send form data to the backend
      const res = await fetch(`${process.env.REACT_APP_API_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          message,
          honeypot,  // Send the honeypot value (empty if legit)
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Something went wrong");

      toast.success("Message sent successfully! We'll get back to you soon.");

      // Clear form fields
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setHoneypot("");  // Reset the honeypot field
    } catch (error) {
      toast.error(error.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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

      <section className="contact-two-column">
        <div className="contact-image-column">
          <img
            src={bedroomimage}
            alt="Contact visual"
            className="contact-left-image"
          />
        </div>

        <div className="contact-form-column">
          <h2 className="form-title">Send Us a Message</h2>

          <form className="contact-form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Name"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="tel"
              placeholder="Phone"
              className="form-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <textarea
              placeholder="Message"
              className="form-textarea"
              rows="5"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />

            {/* Honeypot Field (Invisible to real users, but visible to bots) */}
            <input
              type="text"
              name="honeypot"
              style={{ display: "none" }}
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}  // Track any input in this field
            />

            <button type="submit" className="form-btn" disabled={loading}>
              {loading ? "Sending..." : "Submit"}
            </button>
          </form>
        </div>
      </section>
    </>
  );
};

export default Contact;
