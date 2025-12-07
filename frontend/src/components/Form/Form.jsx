import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom"; // Importing ReactDOM for Portal
import {
  FaUser,
  FaPhoneAlt,
  FaCalendarAlt,
  FaChevronDown,
} from "react-icons/fa";

import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

import { useSelector, useDispatch } from "react-redux";
import { setModalOpen } from "../../redux/modalSlice";
import { setBookingData, setPaymentProcessed } from "../../redux/bookingSlice";

import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { enUS } from "date-fns/locale";

import "./Form.css";

const apiUrl = process.env.REACT_APP_API_URL;

const Form = () => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    startDate: null,
    endDate: null,
    adults: 0,
    children: 0,
    infants: 0,
    pets: 0,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookedRanges, setBookedRanges] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const listingId = "6929ea1334872125aba99042";

  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  const paymentProcessed = useSelector(
    (state) => state.booking.paymentProcessed
  );
  const dispatch = useDispatch();

  const formRef = useRef(null); // Reference for form element

  // Fetch unavailable dates
  const fetchAvailability = async () => {
    try {
      const res = await axios.get(
        `${apiUrl}/bookings/listings/${listingId}/availability`
      );
      setBookedRanges(res.data.bookedDates || []);
    } catch (err) {
      console.error("Error fetching availability", err);
    }
  };

  // Build disabled date list
  const getDisabledDates = () => {
    let disabled = [];

    bookedRanges.forEach((range) => {
      const start = new Date(range.checkIn);
      const end = new Date(range.checkOut);

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        disabled.push(new Date(d));
      }
    });

    return disabled;
  };

  // Handle calendar selection
 // Handle calendar selection
const handleRangeChange = (ranges) => {
  const { startDate, endDate } = ranges.selection;

  // If start date is selected and end date is not, set end date to 1 day after start
  if (startDate && !endDate) {
    const newEndDate = new Date(startDate);
    newEndDate.setDate(newEndDate.getDate() + 1); // Add 1 day to start date (to get 2 full days including start date)
    setFormData({
      ...formData,
      startDate,
      endDate: newEndDate, // Set 1 day after start date, which makes it 2 full days including start date
    });
  } else if (startDate && endDate) {
    const disabled = getDisabledDates();
    const overlap = disabled.some((d) => d >= startDate && d <= endDate);

    if (overlap) {
      toast.error("Selected range includes unavailable dates.");
      return; // Don't close the calendar if dates are unavailable
    }

    // Calculate the number of nights, including the start date
    const nights = (endDate - startDate) / (1000 * 60 * 60 * 24) + 1;

    // Minimum stay validation
    if (nights < 2) {
      toast.error("Minimum stay is 2 nights.");
      return; // Don't close the calendar if validation fails
    }

    // If validation passes, update form data
    setFormData({
      ...formData,
      startDate,
      endDate,
    });

    // Close the calendar only when both dates are selected and validation passes
    setIsCalendarOpen(false);
  }
};


  // Input handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Validation for all fields
  const validateForm = () => {
    const newErrors = {};
    let valid = true;

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      valid = false;
    }

    // Phone validation (assuming a 10-digit phone number)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Enter a valid 10-digit phone number";
      valid = false;
    }

    // Start Date validation (Check-in)
    if (!formData.startDate) {
      newErrors.checkIn = "Check-in date required";
      valid = false;
    }

    // End Date validation (Check-out)
    if (!formData.endDate) {
      newErrors.checkOut = "Check-out date required";
      valid = false;
    }

    // Adults validation (must have at least one adult)
    if (formData.adults <= 0) {
      newErrors.guests = "At least one adult is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // Submit handler
const handleSubmit = async (e) => {
  e.preventDefault();

  // Perform form validation first
  if (!validateForm()) {
    return; // Don't proceed further if validation fails
  }

  // Check if user is logged in
  if (!isLoggedIn) {
    dispatch(setModalOpen(true)); // Show login modal
    return; // Don't proceed further if not logged in
  }

  // Prevent submitting if payment is already processed or if it's submitting
  if (paymentProcessed || isSubmitting) return;

  setIsSubmitting(true);

  const payload = {
    ...formData,
    checkIn: formData.startDate?.toISOString(),
    checkOut: formData.endDate?.toISOString(),
    listingId,
    returnUrl: window.location.href,
  };

  try {
    const response = await axios.post(`${apiUrl}/bookings`, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (response.status === 201 && response.data.approvalLink) {
      dispatch(setBookingData(payload));
      dispatch(setPaymentProcessed(true));
      window.location.href = response.data.approvalLink;
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "An error occurred");
  } finally {
    setIsSubmitting(false);
  }
};

  // Update window width state on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Detect scroll event to close calendar
  useEffect(() => {
    const handleScroll = () => {
      if (isCalendarOpen) {
        setIsCalendarOpen(false); // Close calendar on scroll
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isCalendarOpen]);

  // Determine the direction based on window width
  const calendarDirection = windowWidth <= 768 ? "vertical" : "horizontal";

  return (
    <form className="booking-form-only" onSubmit={handleSubmit} ref={formRef}>
      {/* Name */}
      <div className="input-container">
        <FaUser className="input-icon" />
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleInputChange}
        />
        {errors.name && <p className="error-text">{errors.name}</p>}
      </div>

      {/* Phone */}
      <div className="input-container">
        <FaPhoneAlt className="input-icon" />
        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleInputChange}
        />
        {errors.phone && <p className="error-text">{errors.phone}</p>}
      </div>

      {/* Date picker */}
      <div
        className="input-container"
        onClick={() => {
          setIsCalendarOpen(!isCalendarOpen);
          if (!isCalendarOpen) fetchAvailability(); // keeps same availability logic
        }}
      >
        <FaCalendarAlt className="input-icon" />
        <input
          type="text"
          readOnly
          placeholder="Select dates"
          className="date-input"
          value={
            formData.startDate && formData.endDate
              ? `${formData.startDate.toLocaleDateString()} → ${formData.endDate.toLocaleDateString()}`
              : ""
          }
        />
      </div>

      {isCalendarOpen &&
        ReactDOM.createPortal(
          <div className="calendar-modal">
            <DateRange
              ranges={[{ startDate: formData.startDate || new Date(), endDate: formData.endDate || new Date(), key: "selection" }]}
              onChange={handleRangeChange}
              moveRangeOnFirstSelection={false}
              rangeColors={["#148992"]}
              months={2}
              direction={calendarDirection}
              minDate={new Date()}
              locale={enUS}
              disabledDates={getDisabledDates()}
            />
          </div>,
          document.body // Places the calendar inside the body
        )}

      {errors.checkIn && <p className="error-text">{errors.checkIn}</p>}
      {errors.checkOut && <p className="error-text">{errors.checkOut}</p>}

      {/* Guest selector */}
      <div
        className="input-container"
        onClick={() => setIsDropdownVisible(!isDropdownVisible)}
      >
        <span className="input-icon">👨‍👩‍👧‍👦</span>

        <input
          type="text"
          readOnly
          value={`Adults: ${formData.adults}, Children: ${formData.children}, Infants: ${formData.infants}, Pets: ${formData.pets}`}
        />

        <FaChevronDown
          className={`dropdown-icon ${isDropdownVisible ? "rotate" : ""}`}
        />

        {isDropdownVisible && (
          <div className="dropdown-menu">
            {["adults", "children", "infants", "pets"].map((type) => (
              <div className="dropdown-item" key={type}>
                <label>{type.charAt(0).toUpperCase() + type.slice(1)}</label>

                <div className="quantity-controls">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData({
                        ...formData,
                        [type]: Math.max(formData[type] - 1, 0),
                      });
                    }}
                  >
                    −
                  </button>

                  <span>{formData[type]}</span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData({ ...formData, [type]: formData[type] + 1 });
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        className="submit-btn"
        type="submit"
        disabled={isSubmitting || paymentProcessed}
      >
        {isSubmitting ? <div className="spinner"></div> : "Book Now"}
      </button>

      {/* Toast Container for Notifications */}
      {/* <ToastContainer position="top-right" autoClose={5000} toastContainerClassName="toast-container" /> */}
    </form>
  );
};

export default Form;
