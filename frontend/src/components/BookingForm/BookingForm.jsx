import React, { useState } from "react";
import {
  FaUser,
  FaPhoneAlt,
  FaCalendarAlt,
  FaChevronDown,
} from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./BookingForm.css";

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
        setChildren(
          action === "increase" ? children + 1 : Math.max(children - 1, 0)
        );
        break;
      case "infants":
        setInfants(
          action === "increase" ? infants + 1 : Math.max(infants - 1, 0)
        );
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
    setFormData({ ...formData, checkOut: date });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    // Additional submit logic goes here
  };

  // Get today's date
  const today = new Date();

  return (
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
              minDate={formData.checkIn || today}  
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
                  <span>{children}</span>
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
                  <span>{infants}</span>
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
                  <span>{pets}</span>
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

        {/* Submit Button */}
        <button type="submit" className="submit-btn">
          Book Now
        </button>
      </form>
    </div>
  );
};

export default BookingForm;
