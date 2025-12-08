import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
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
  const dispatch = useDispatch();

  const formRef = useRef(null);

  // Reset everything on form load (VERY IMPORTANT)
  useEffect(() => {
    dispatch(setPaymentProcessed(false));
    localStorage.removeItem("paymentProcessed");
    localStorage.removeItem("bookingDetails");
  }, [dispatch]);

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

  const getDisabledDates = () => {
    return bookedRanges.map((date) => new Date(date));
  };

  const handleRangeChange = (ranges) => {
    const { startDate, endDate } = ranges.selection;

    if (startDate && !endDate) {
      const newEndDate = new Date(startDate);
      newEndDate.setDate(newEndDate.getDate() + 1);
      setFormData({ ...formData, startDate, endDate: newEndDate });
      return;
    }

    if (startDate && endDate) {
      const disabled = getDisabledDates();
      const overlap = disabled.some((d) => d >= startDate && d <= endDate);

      if (overlap) {
        toast.error("Selected range includes unavailable dates.");
        return;
      }

      const nights = (endDate - startDate) / (1000 * 60 * 60 * 24) + 1;

      if (nights < 2) {
        toast.error("Minimum stay is 2 nights.");
        return;
      }

      setFormData({ ...formData, startDate, endDate });
      setIsCalendarOpen(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const newErrors = {};
    let valid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      valid = false;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Enter a valid 10-digit phone number";
      valid = false;
    }

    if (!formData.startDate) {
      newErrors.checkIn = "Check-in date required";
      valid = false;
    }

    if (!formData.endDate) {
      newErrors.checkOut = "Check-out date required";
      valid = false;
    }

    if (formData.adults <= 0) {
      newErrors.guests = "At least one adult is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!isLoggedIn) {
      dispatch(setModalOpen(true));
      return;
    }

    // ✨ Only prevent double submit (NOT paymentProcessed)
    if (isSubmitting) return;

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

        // ✅ Show booking confirmed toast BEFORE redirect
        toast.success("Booking confirmed! Redirecting to payment...", {
          autoClose: 1200,
          hideProgressBar: true,
        });

        // ✅ Give the toast time to appear then redirect
        setTimeout(() => {
          window.location.href = response.data.approvalLink;
        }, 1200);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (isCalendarOpen) setIsCalendarOpen(false);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isCalendarOpen]);

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

      {/* Date Picker */}
      <div
        className="input-container"
        onClick={() => {
          setIsCalendarOpen(!isCalendarOpen);
          if (!isCalendarOpen) fetchAvailability();
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
              ranges={[
                {
                  startDate: formData.startDate || new Date(),
                  endDate: formData.endDate || new Date(),
                  key: "selection",
                },
              ]}
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
          document.body
        )}

      {errors.checkIn && <p className="error-text">{errors.checkIn}</p>}
      {errors.checkOut && <p className="error-text">{errors.checkOut}</p>}

      {/* Guest Selector */}
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
                      setFormData({
                        ...formData,
                        [type]: formData[type] + 1,
                      });
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

      <button className="submit-btn" type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <div className="button-loading">
            <div className="small-spinner"></div>
            <span>Submitting...</span>
          </div>
        ) : (
          "Book Now"
        )}
      </button>

      {/* <ToastContainer /> */}
    </form>
  );
};

export default Form;
