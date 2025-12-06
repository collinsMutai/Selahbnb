import React, { useState, useEffect } from "react";
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

  const today = new Date();

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
  const listingId = "6929ea1334872125aba99042";

  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  const paymentProcessed = useSelector(
    (state) => state.booking.paymentProcessed
  );
  const dispatch = useDispatch();

  // Calendar orientation logic
  const [calendarDirection, setCalendarDirection] = useState("horizontal");

  useEffect(() => {
    const handleResize = () => {
      setCalendarDirection(window.innerWidth < 768 ? "vertical" : "horizontal");
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
  const handleRangeChange = (ranges) => {
    const { startDate, endDate } = ranges.selection;

    const disabled = getDisabledDates();
    const overlap = disabled.some((d) => d >= startDate && d <= endDate);

    if (overlap) {
      toast.error("Selected range includes unavailable dates.");
      return;
    }

    setFormData({
      ...formData,
      startDate,
      endDate,
    });
  };

  // Input handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Validation
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
    } else {
      const nights =
        (formData.endDate - formData.startDate) / (1000 * 60 * 60 * 24);
      if (nights < 2) {
        newErrors.checkOut = "Minimum stay is 2 nights";
        valid = false;
      }
    }

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

    if (!isLoggedIn) {
      dispatch(setModalOpen(true));
      return;
    }

    if (paymentProcessed || isSubmitting) return;

    if (validateForm()) {
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
    }
  };

  return (
    <form className="booking-form-only" onSubmit={handleSubmit}>
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

      {isCalendarOpen && (
        <div
          className="calendar-popup"
          style={{
            maxHeight: window.innerWidth < 768 ? "400px" : "auto",
            overflowY: window.innerWidth < 768 ? "auto" : "visible", // ⭐ vertical scroll preserved
          }}
        >
          <DateRange
            ranges={[
              {
                startDate: formData.startDate || today,
                endDate: formData.endDate || today,
                key: "selection",
              },
            ]}
            onChange={handleRangeChange}
            moveRangeOnFirstSelection={false}
            rangeColors={["#148992"]}
            months={2}
            direction={calendarDirection}
            minDate={today}
            locale={enUS}
            disabledDates={getDisabledDates()}
          />
        </div>
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

      <ToastContainer position="top-right" autoClose={5000} />
    </form>
  );
};

export default Form;
