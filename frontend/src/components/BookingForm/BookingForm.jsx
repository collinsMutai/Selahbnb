import React from "react";

import "./BookingForm.css";
import backgroundImage from "../../images/bedroom1_img1.avif";
import Form from "../Form/Form";

const BookingForm = () => {
  return (
    <div
      id="form"
      className="booking-section"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="booking-overlay"></div>

      <div className="booking-content">
        {/* Left Text Content */}
        <div className="booking-text">
          <h2>Book Your Stay at Selah</h2>
          <p>
            Your tranquil retreat in Colorado Springs is just a few clicks away.
          </p>
        </div>

        {/* Form Container */}
        <div className="booking-form-container">
          <div className="booking-form-only">
            <h2>Book Your Stay</h2>
            <Form />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
