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

import "./BookingForm.css";
import backgroundImage from "../../images/bedroom1_img1.avif";

const apiUrl =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const BookingForm = () => {
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

  const [errors, setErrors] = useState({
    name: "",
    phone: "",
    checkIn: "",
    checkOut: "",
    guests: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [bookedRanges, setBookedRanges] = useState([]); // ⭐ NEW
  const listingId = "6929ea1334872125aba99042"; // your listing ID

  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  const paymentProcessed = useSelector(
    (state) => state.booking.paymentProcessed
  );
  const dispatch = useDispatch();

  // Responsive Calendar State
  const [calendarDirection, setCalendarDirection] = useState("horizontal");

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCalendarDirection("vertical");
      } else {
        setCalendarDirection("horizontal");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ⭐ Fetch availability when calendar is opened
  const fetchAvailability = async () => {
    try {
      const res = await axios.get(
        `${apiUrl}/bookings/listings/${listingId}/availability`
      );
      console.log('res.data.bookedDates', res.data);
      
      setBookedRanges(res.data.bookedDates || []);
    } catch (err) {
      console.error("Error fetching availability", err);
    }
  };

  // Convert booked ranges into all disabled dates
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

  // Handle Calendar Change
  const handleRangeChange = (ranges) => {
    const { startDate, endDate } = ranges.selection;

    const disabled = getDisabledDates();
    const overlap = disabled.some(
      (d) => d >= startDate && d <= endDate
    );

    if (overlap) {
      toast.error("Selected range includes booked dates.");
      return;
    }

    setFormData({
      ...formData,
      startDate,
      endDate,
    });
  };

  // Handle Text Inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
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

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
      isValid = false;
    }

    if (!formData.startDate) {
      newErrors.checkIn = "Check-in date is required";
      isValid = false;
    }

    if (!formData.endDate) {
      newErrors.checkOut = "Check-out date is required";
      isValid = false;
    } else {
      const diffDays =
        (formData.endDate - formData.startDate) / (1000 * 60 * 60 * 24);
      if (diffDays < 2) {
        newErrors.checkOut = "Minimum stay is 2 nights.";
        isValid = false;
      }
    }

    if (formData.adults <= 0) {
      newErrors.guests = "At least one adult is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle Submit
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!isLoggedIn) {
    dispatch(setModalOpen(true));
    return;
  }

  if (paymentProcessed || isSubmitting) return;

  if (validateForm()) {
    setIsSubmitting(true);

    const formDataToDispatch = {
      ...formData,
      checkIn: formData.startDate ? formData.startDate.toISOString() : null, // Convert Date to ISO string
      checkOut: formData.endDate ? formData.endDate.toISOString() : null, // Convert Date to ISO string
      listingId,
      returnUrl: window.location.href,
    };

    try {
      const response = await axios.post(
        `${apiUrl}/bookings`,
        formDataToDispatch,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 201) {
        // Handle successful booking and redirection to payment form
        const approvalLink = response.data.approvalLink;
        if (approvalLink) {
          window.location.href = approvalLink;
        }

        dispatch(setBookingData(formDataToDispatch)); // Dispatch ISO strings
        dispatch(setPaymentProcessed(true));

        setFormData({
          name: "",
          phone: "",
          startDate: null,
          endDate: null,
          adults: 0,
          children: 0,
          infants: 0,
          pets: 0,
        });
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "An error occurred";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }
};



  return (
    <div
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
        <div className="booking-text">
          <h2>Book Your Stay at Selah</h2>
          <p>Your Tranquil Retreat in Colorado Springs is Just a Few Clicks Away.</p>
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

            {/* Date Picker */}
            <div
              className="input-container"
              onClick={() => {
                setIsCalendarOpen(!isCalendarOpen);
                if (!isCalendarOpen) fetchAvailability(); // ⭐ load booked dates
              }}
            >
              <FaCalendarAlt className="input-icon" />
              <input
                type="text"
                readOnly
                placeholder="Select dates"
                value={
                  formData.startDate && formData.endDate
                    ? `${formData.startDate.toLocaleDateString()} → ${formData.endDate.toLocaleDateString()}`
                    : ""
                }
                className="date-input"
              />
            </div>

            {isCalendarOpen && (
              <div
                className="calendar-popup"
                style={{
                  maxHeight: window.innerWidth < 768 ? "400px" : "auto",
                  overflowY: window.innerWidth < 768 ? "auto" : "visible",
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
                  disabledDates={getDisabledDates()} // ⭐ prevent selecting booked days
                  disabledDay={(date) =>
                    getDisabledDates().some(
                      (d) => d.toDateString() === date.toDateString()
                    )
                  }
                />
              </div>
            )}

            {errors.checkIn && <p className="error-text">{errors.checkIn}</p>}
            {errors.checkOut && <p className="error-text">{errors.checkOut}</p>}

            {/* Guests */}
            <div
              className="input-container"
              onClick={() => setIsDropdownVisible(!isDropdownVisible)}
            >
              <span className="input-icon">👨‍👩‍👧‍👦</span>

              <input
                type="text"
                readOnly
                placeholder="Select Guests"
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

            {/* Submit Button */}
            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting || paymentProcessed}
            >
              {isSubmitting ? <div className="spinner"></div> : "Book Now"}
            </button>
          </form>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
};

export default BookingForm;
