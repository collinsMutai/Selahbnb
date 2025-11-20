import React, { useState } from "react";
import { FaUser, FaPhoneAlt, FaCalendarAlt, FaChevronDown } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./BookingForm.css";

// Import the background image
import backgroundImage from "../../images/bedroom1_img1.avif"; // Adjust the path as needed

const BookingForm = () => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [adults, setAdults] = useState(0);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [pets, setPets] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    checkIn: null,
    checkOut: null,
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
    switch (type) {
      case "adults":
        setAdults(action === "increase" ? adults + 1 : Math.max(adults - 1, 0));
        break;
      case "children":
        setChildren(action === "increase" ? children + 1 : Math.max(children - 1, 0));
        break;
      case "infants":
        setInfants(action === "increase" ? infants + 1 : Math.max(infants - 1, 0));
        break;
      case "pets":
        setPets(action === "increase" ? pets + 1 : Math.max(pets - 1, 0));
        break;
      default:
        break;
    }
  };

  const handleCheckInChange = (date) => {
    setFormData({ ...formData, checkIn: date });
  };

  const handleCheckOutChange = (date) => {
    // Ensure check-out is at least 2 days after check-in
    const minCheckOutDate = new Date(formData.checkIn);
    minCheckOutDate.setDate(minCheckOutDate.getDate() + 2);

    if (date >= minCheckOutDate) {
      setFormData({ ...formData, checkOut: date });
    } else {
      alert("Check-out must be at least 2 nights after check-in.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    // Additional submit logic goes here
  };

  const today = new Date();

  // Calculate the minimum check-out date dynamically based on check-in
  const minCheckOutDate = formData.checkIn
    ? new Date(formData.checkIn).setDate(formData.checkIn.getDate() + 2)
    : today;

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
            Your Tranquil Retreat in Colorado Springs is Just a Few Clicks Away. Escape to Selah and experience the perfect blend of nature, relaxation, and adventure! Whether you're planning a weekend getaway, a romantic retreat, or an adventure-filled vacation, our peaceful home offers everything you need to unwind and explore the beauty of Colorado Springs.
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
            </div>

            {/* Inline Date Inputs */}
            <div className="input-container-inline">
              {/* Check-in Date */}
              <div className="input-container">
                <FaCalendarAlt className="input-icon" />
                <DatePicker
                  selected={formData.checkIn}
                  onChange={handleCheckInChange}
                  placeholderText="Check-in"
                  dateFormat="MM/dd/yyyy"
                  className="date-input"
                  popperPlacement="bottom"
                  withPortal
                  minDate={today}
                />
              </div>

              {/* Check-out Date */}
              <div className="input-container">
                <FaCalendarAlt className="input-icon" />
                <DatePicker
                  selected={formData.checkOut}
                  onChange={handleCheckOutChange}
                  placeholderText="Check-out"
                  dateFormat="MM/dd/yyyy"
                  className="date-input"
                  popperPlacement="bottom"
                  withPortal
                  minDate={minCheckOutDate}
                  disabled={!formData.checkIn}
                />
              </div>
            </div>

            {/* Guests: Adults, Children, Infants, Pets */}
            <div className="input-container" onClick={toggleDropdown}>
              <span className="input-icon">👨‍👩‍👧‍👦</span>
              <input
                type="text"
                value={`Adults: ${adults}, Children: ${children}, Infants: ${infants}, Pets: ${pets}`}
                readOnly
                placeholder="Select People"
              />
              <FaChevronDown
                className={`dropdown-icon ${isDropdownVisible ? "rotate" : ""}`}
              />
              {isDropdownVisible && (
                <div className="dropdown-menu">
                  {/* Dropdown Items for Adjusting Number of Guests */}
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
                      <span>{adults}</span>
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
                  {/* Similar items for Children, Infants, and Pets */}
                </div>
              )}
            </div>

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
