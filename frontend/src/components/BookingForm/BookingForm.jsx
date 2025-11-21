import React, { useState } from "react";
import moment from "moment-timezone"; // Import Moment.js with Timezone support
import { FaUser, FaPhoneAlt, FaCalendarAlt, FaChevronDown } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./BookingForm.css";

// Import the background image
import backgroundImage from "../../images/bedroom1_img1.avif"; // Adjust the path as needed

const BookingForm = () => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: "cccvvv",
    phone: "6718897890",
    checkIn: "2025-11-20T21:00:00.000Z", // Example UTC time
    checkOut: "2025-11-22T21:00:00.000Z", // Example UTC time
    adults: 1,
    children: 0,
    infants: 0,
    pets: 0,
  });

  const [errors, setErrors] = useState({
    name: "",
    phone: "",
    checkIn: "",
    checkOut: "",
    guests: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsDropdownVisible(!isDropdownVisible);
  };

  const changeQuantity = (type, action) => {
    setFormData((prevData) => {
      const newValue =
        action === "increase" ? prevData[type] + 1 : Math.max(prevData[type] - 1, 0);
      return {
        ...prevData,
        [type]: newValue,
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Perform validation before submitting the form
    if (validateForm()) {
      console.log(formData); // Logs the entire formData including guests
      // Add further submit logic (e.g., API call, etc.)
    }
  };

  const validateForm = () => {
    const newErrors = {
      name: "",
      phone: "",
      checkIn: "",
      checkOut: "",
      guests: "",
    };
    let isValid = true;

    // Validate Name
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    // Validate Phone
    const phoneRegex = /^[0-9]{10}$/; // Basic phone validation (10 digits)
    if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
      isValid = false;
    }

    // Validate Check-in and Check-out
    if (!formData.checkIn) {
      newErrors.checkIn = "Check-in date is required";
      isValid = false;
    }

    if (!formData.checkOut) {
      newErrors.checkOut = "Check-out date is required";
      isValid = false;
    } else if (new Date(formData.checkOut) <= new Date(formData.checkIn)) {
      newErrors.checkOut = "Check-out date must be at least 2 days after check-in";
      isValid = false;
    }

    // Validate Guests
    if (formData.adults <= 0) {
      newErrors.guests = "At least one adult is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Convert UTC to Colorado Springs Local Time using Moment.js
  const formatDateTime = (date) => {
    return moment(date).tz("America/Denver").format("MM/DD/YYYY hh:mm A");
  };

  // Get formatted times
  const checkInTime = formatDateTime(formData.checkIn);
  const checkOutTime = formatDateTime(formData.checkOut);

  return (
    <div
      className="booking-section"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed", // Keep background fixed
      }}
    >
      {/* Dark overlay on background image */}
      <div className="booking-overlay"></div>

      <div className="booking-content">
        {/* Content Text on the Left */}
        <div className="booking-text">
          <h2>Book Your Stay at Selah</h2>
          <p>
            Your Tranquil Retreat in Colorado Springs is Just a Few Clicks Away.
            Escape to Selah and experience the perfect blend of nature,
            relaxation, and adventure! Whether you're planning a weekend
            getaway, a romantic retreat, or an adventure-filled vacation, our
            peaceful home offers everything you need to unwind and explore the
            beauty of Colorado Springs.
          </p>
        </div>

        {/* Booking Form on the Right */}
        <div className="booking-form-container">
          <h2>Book Your Stay</h2>
          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div className="input-container">
              <FaUser className="input-icon" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Full Name"
              />
              {errors.name && <p className="error-text">{errors.name}</p>}
            </div>

            {/* Phone */}
            <div className="input-container">
              <FaPhoneAlt className="input-icon" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Phone Number"
              />
              {errors.phone && <p className="error-text">{errors.phone}</p>}
            </div>

            {/* Inline Date Inputs */}
            <div className="input-container-inline">
              {/* Check-in Date */}
              <div className="input-container">
                <FaCalendarAlt className="input-icon" />
                <DatePicker
                  selected={new Date(formData.checkIn)}
                  onChange={(date) => setFormData({ ...formData, checkIn: date })}
                  placeholderText="Check-in"
                  dateFormat="MM/dd/yyyy"
                  className="date-input"
                  popperPlacement="bottom"
                  withPortal
                  minDate={new Date()}
                />
                {errors.checkIn && <p className="error-text">{errors.checkIn}</p>}
              </div>

              {/* Check-out Date */}
              <div className="input-container">
                <FaCalendarAlt className="input-icon" />
                <DatePicker
                  selected={new Date(formData.checkOut)}
                  onChange={(date) => setFormData({ ...formData, checkOut: date })}
                  placeholderText="Check-out"
                  dateFormat="MM/dd/yyyy"
                  className="date-input"
                  popperPlacement="bottom"
                  withPortal
                  minDate={new Date(formData.checkIn)}
                />
                {errors.checkOut && <p className="error-text">{errors.checkOut}</p>}
              </div>
            </div>

            {/* Display Colorado Springs Time for Check-in/Check-out */}
            <div className="time-display">
              <p>Check-in (Colorado Springs Local Time): {checkInTime}</p>
              <p>Check-out (Colorado Springs Local Time): {checkOutTime}</p>
            </div>

            {/* Guests: Adults, Children, Infants, Pets */}
            <div className="input-container" onClick={toggleDropdown}>
              <span className="input-icon">👨‍👩‍👧‍👦</span>
              <input
                type="text"
                value={`Adults: ${formData.adults}, Children: ${formData.children}, Infants: ${formData.infants}, Pets: ${formData.pets}`}
                readOnly
                placeholder="Select People"
              />
              <FaChevronDown
                className={`dropdown-icon ${isDropdownVisible ? "rotate" : ""}`}
              />
              {isDropdownVisible && (
                <div className="dropdown-menu">
                  {/* Adults */}
                  <div className="dropdown-item">
                    <label>Adults</label>
                    <div className="quantity-controls">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          changeQuantity("adults", "decrease");
                        }}
                      >
                        −
                      </button>
                      <span>{formData.adults}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          changeQuantity("adults", "increase");
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Children */}
                  <div className="dropdown-item">
                    <label>Children</label>
                    <div className="quantity-controls">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          changeQuantity("children", "decrease");
                        }}
                      >
                        −
                      </button>
                      <span>{formData.children}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          changeQuantity("children", "increase");
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Infants */}
                  <div className="dropdown-item">
                    <label>Infants</label>
                    <div className="quantity-controls">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          changeQuantity("infants", "decrease");
                        }}
                      >
                        −
                      </button>
                      <span>{formData.infants}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          changeQuantity("infants", "increase");
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Pets */}
                  <div className="dropdown-item">
                    <label>Pets</label>
                    <div className="quantity-controls">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          changeQuantity("pets", "decrease");
                        }}
                      >
                        −
                      </button>
                      <span>{formData.pets}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          changeQuantity("pets", "increase");
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Guests Validation */}
            {errors.guests && <p className="error-text">{errors.guests}</p>}

            {/* Submit Button */}
            <button type="submit" className="submit-btn">
              Book Now
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
