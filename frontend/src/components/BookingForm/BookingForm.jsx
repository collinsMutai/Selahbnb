import React, { useState } from "react";
import { FaUser, FaPhoneAlt, FaCalendarAlt, FaChevronDown } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment-timezone";
import { useSelector, useDispatch } from "react-redux"; // Import useSelector and useDispatch
import { setModalOpen } from "../../redux/modalSlice"; // Correct import for opening modal
import "./BookingForm.css";

// Import the background image
import backgroundImage from "../../images/bedroom1_img1.avif"; // Adjust the path as needed

const BookingForm = () => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    checkIn: null,
    checkOut: null,
    adults: 0,
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

  const isLoggedIn = useSelector((state) => state.user.isLoggedIn); // Get the login status from the Redux store
  const dispatch = useDispatch(); // Dispatch function to trigger actions

  const coloradoSpringsTimeZone = "America/Denver"; // Colorado Springs time zone

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

  // Convert the local date to UTC including time
  const handleCheckInChange = (date) => {
    const localDate = moment.tz(date, "America/Los_Angeles");
    const adjustedDate = localDate.set({ hour: 12, minute: 0, second: 0 });
    const utcDate = adjustedDate.utc().toDate();
    setFormData({ ...formData, checkIn: utcDate });
  };

  // Handle check-out date similarly
  const handleCheckOutChange = (date) => {
    const localDate = moment.tz(date, "America/Los_Angeles");
    const adjustedDate = localDate.set({ hour: 12, minute: 0, second: 0 });
    const utcDate = adjustedDate.utc().toDate();

    const minCheckOutDate = new Date(formData.checkIn);
    minCheckOutDate.setDate(minCheckOutDate.getDate() + 2);

    if (utcDate >= minCheckOutDate) {
      setFormData({ ...formData, checkOut: utcDate });
    } else {
      alert("Check-out must be at least 2 nights after check-in (including check-in day).");
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
    const phoneRegex = /^[0-9]{10}$/;
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
      newErrors.checkOut = "Check-out date must be at least 2 days after check-in (including check-in day).";
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

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if the user is logged in before submitting the form
    if (!isLoggedIn) {
      // If not logged in, open the login modal
      dispatch(setModalOpen(true)); // Open the login modal
      return; // Prevent form submission
    }

    // Perform validation before submitting the form
    if (validateForm()) {
      // Log UTC and Colorado Springs date for check-in and check-out (with time)
      if (formData.checkIn && formData.checkOut) {
        const checkInUtc = moment(formData.checkIn).format("YYYY-MM-DD HH:mm:ss [UTC]");
        const checkOutUtc = moment(formData.checkOut).format("YYYY-MM-DD HH:mm:ss [UTC]");
        const checkInCST = moment(formData.checkIn).tz(coloradoSpringsTimeZone).format("YYYY-MM-DD HH:mm:ss [MST]");
        const checkOutCST = moment(formData.checkOut).tz(coloradoSpringsTimeZone).format("YYYY-MM-DD HH:mm:ss [MST]");

        console.log("Form submitted!");
        console.log("Check-in (UTC):", checkInUtc);
        console.log("Check-out (UTC):", checkOutUtc);
        console.log("Check-in (Colorado Springs Time):", checkInCST);
        console.log("Check-out (Colorado Springs Time):", checkOutCST);
      }

      // Log the entire formData (for debugging purposes)
      console.log("Form Data:", formData);

      // Add further submit logic (e.g., API call, etc.)
    }
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
      <div className="booking-overlay"></div>

      <div className="booking-content">
        <div className="booking-text">
          <h2>Book Your Stay at Selah</h2>
          <p>
            Your Tranquil Retreat in Colorado Springs is Just a Few Clicks Away.
            Escape to Selah and experience the perfect blend of nature,
            relaxation, and adventure!
          </p>
        </div>

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

            {/* Check-in / Check-out */}
            <div className="input-container-inline">
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
                {errors.checkIn && <p className="error-text">{errors.checkIn}</p>}
              </div>

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
                {errors.checkOut && <p className="error-text">{errors.checkOut}</p>}
              </div>
            </div>

            {/* Guests */}
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
