import React, { useState } from "react";
import {
  FaUser,
  FaPhoneAlt,
  FaCalendarAlt,
  FaChevronDown,
} from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment-timezone";
import { useSelector, useDispatch } from "react-redux";
import { setModalOpen } from "../../redux/modalSlice"; // For opening login modal
import { setBookingData, setPaymentProcessed } from "../../redux/bookingSlice"; // Import the new actions
import axios from "axios"; // Import Axios
import { ToastContainer, toast } from "react-toastify"; // Import Toastify
import "react-toastify/dist/ReactToastify.css";

import "./BookingForm.css";
import backgroundImage from "../../images/bedroom1_img1.avif"; // Adjust the path as needed

const apiUrl =
  process.env.REACT_APP_API_URL || "https://selahbnbbackend.onrender.com/api"; // Replace with your actual API URL

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

  const [isSubmitting, setIsSubmitting] = useState(false); // Add loading state for submission

  const isLoggedIn = useSelector((state) => state.user.isLoggedIn); // Get login status
  const paymentProcessed = useSelector(
    (state) => state.booking.paymentProcessed
  ); // Get payment status from Redux
  const dispatch = useDispatch(); // Dispatch function

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
        action === "increase"
          ? prevData[type] + 1
          : Math.max(prevData[type] - 1, 0);
      return {
        ...prevData,
        [type]: newValue,
      };
    });
  };

  const handleCheckInChange = (date) => {
    const adjustedDate = moment(date)
      .tz("America/Denver") // Use Colorado Springs' local time zone
      .set({ hour: 15, minute: 0, second: 0 }); // Set time to 3:00 PM
    setFormData({ ...formData, checkIn: adjustedDate.toDate() });
  };

  const handleCheckOutChange = (date) => {
    const adjustedDate = moment(date)
      .tz(coloradoSpringsTimeZone)
      .set({ hour: 11, minute: 0, second: 0 });
    setFormData({ ...formData, checkOut: adjustedDate.toDate() });
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
      newErrors.checkOut =
        "Check-out date must be at least 2 days after check-in (including check-in day).";
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if the user is logged in before submitting the form
    if (!isLoggedIn) {
      dispatch(setModalOpen(true)); // Open the login modal
      return; // Prevent form submission
    }

    // Prevent double submission if payment has already been processed or form is in submitting state
    if (paymentProcessed || isSubmitting) return;

    // Perform validation before submitting the form
    if (validateForm()) {
      setIsSubmitting(true); // Set loading state to true during submission
      // Convert Date objects to ISO strings
      const formDataToDispatch = {
        ...formData,
        checkIn: formData.checkIn ? formData.checkIn.toISOString() : null,
        checkOut: formData.checkOut ? formData.checkOut.toISOString() : null,
        listingId: "6929ea1334872125aba99042",
        returnUrl: window.location.href,
      };

      try {
        const response = await axios.post(
          `${apiUrl}/bookings`, // API URL
          formDataToDispatch,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.status === 201) {
          console.log("Booking created successfully:", response.data);

          // Dispatch form data to Redux
          dispatch(setBookingData(formDataToDispatch));

          // Set payment processed flag to prevent double submission
          dispatch(setPaymentProcessed(true));

          // Display success toast
          toast.success("Booking successful! Redirecting to payment...");

          // Optionally redirect to payment page if necessary
          const approvalLink = response.data.approvalLink; // Assuming backend returns a link
          if (approvalLink) {
            window.location.href = approvalLink;
            // Set toastShown to true after the booking is complete
            localStorage.setItem("toastShown", "false");
          }

          // Reset form data after successful submission
          setFormData({
            name: "",
            phone: "",
            checkIn: null,
            checkOut: null,
            adults: 0,
            children: 0,
            infants: 0,
            pets: 0,
          });
        }
      } catch (error) {
        console.error("Error submitting booking:", error);
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "An unknown error occurred";

        // Display error message in toast
        toast.error(errorMessage);
      } finally {
        setIsSubmitting(false); // Reset submitting state after API call
      }
    }
  };

  const today = new Date();
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

            {/* Check-in and Check-out Dates */}
            <div className="input-container-inline">
              <div className="input-container">
                <FaCalendarAlt className="input-icon" />
                <DatePicker
                  selected={formData.checkIn}
                  onChange={handleCheckInChange}
                  placeholderText="Check-in"
                  dateFormat="MM/dd/yyyy"
                  className="date-input"
                  minDate={today}
                />
                {errors.checkIn && (
                  <p className="error-text">{errors.checkIn}</p>
                )}
              </div>

              <div className="input-container">
                <FaCalendarAlt className="input-icon" />
                <DatePicker
                  selected={formData.checkOut}
                  onChange={handleCheckOutChange}
                  placeholderText="Check-out"
                  dateFormat="MM/dd/yyyy"
                  className="date-input"
                  minDate={minCheckOutDate}
                  disabled={!formData.checkIn}
                />
                {errors.checkOut && (
                  <p className="error-text">{errors.checkOut}</p>
                )}
              </div>
            </div>

            {/* Guests */}
            <div
              className="input-container"
              onClick={() => setIsDropdownVisible(!isDropdownVisible)}
            >
              <span className="input-icon">👨‍👩‍👧‍👦</span>
              <input
                type="text"
                value={`Adults: ${formData.adults}, Children: ${formData.children}, Infants: ${formData.infants}, Pets: ${formData.pets}`}
                readOnly
                placeholder="Select Guests"
              />
              <FaChevronDown
                className={`dropdown-icon ${isDropdownVisible ? "rotate" : ""}`}
              />
              {isDropdownVisible && (
                <div className="dropdown-menu">
                  {["adults", "children", "infants", "pets"].map((type) => (
                    <div className="dropdown-item" key={type}>
                      <label>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </label>
                      <div className="quantity-controls">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormData({
                              ...formData,
                              [type]:
                                formData[type] - 1 < 0 ? 0 : formData[type] - 1,
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

      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
};

export default BookingForm;
