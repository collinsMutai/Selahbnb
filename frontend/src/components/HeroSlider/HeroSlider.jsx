import React, { useState, useEffect, forwardRef } from "react";
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
import moment from "moment-timezone"; // Correct import
import "./HeroSlider.css";

const apiUrl = process.env.REACT_APP_API_URL;
const coloradoSpringsTimeZone = "America/Denver"; // Colorado Springs time zone

const HeroSlider = forwardRef((props, ref) => {
  const [current, setCurrent] = useState(0);
  const [animateText, setAnimateText] = useState(false);
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
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for submitting status
  const [bookedRanges, setBookedRanges] = useState([]);

  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  const dispatch = useDispatch();

  // Ensure slides data is properly initialized
  const slides = [
    {
      image:
        "https://a0.muscache.com/im/pictures/hosting/Hosting-1510422806091021624/original/05d2e101-b217-4c0e-9ba8-55dca12f3a8f.jpeg?im_w=1200",
      caption: "Front View of the Property",
    },
    {
      image:
        "https://a0.muscache.com/im/pictures/hosting/Hosting-1510422806091021624/original/19960d67-7f8f-4ee7-a679-13ce81f7e534.jpeg?im_w=1200",
      caption: "Spacious Living Room",
    },
    {
      image:
        "https://a0.muscache.com/im/pictures/hosting/Hosting-1510422806091021624/original/ca24cc0e-34c7-4b18-b80f-e9ed639ea963.jpeg?im_w=1200",
      caption: "Full Open Kitchen with Modern Amenities",
    },
    {
      image:
        "https://a0.muscache.com/im/pictures/hosting/Hosting-1510422806091021624/original/f88455c8-3f02-4b1d-a107-0fbaee382798.jpeg?im_w=1200",
      caption: "Elegant Dining Room for Family Meals",
    },
    {
      image:
        "https://a0.muscache.com/im/pictures/hosting/Hosting-1510422806091021624/original/f4179e2e-7d5f-4c7f-8cbe-423a683d2d77.jpeg?im_w=1200",
      caption: "Six Bedrooms for Comfort and Relaxation",
    },
    {
      image:
        "https://a0.muscache.com/im/pictures/hosting/Hosting-1510422806091021624/original/951caa35-ee85-475f-b8cf-69dffc91d5d9.jpeg?im_w=1200",
      caption: "Full Bathroom with Luxury Features",
    },
    {
      image:
        "https://a0.muscache.com/im/pictures/hosting/Hosting-1510422806091021624/original/1722b722-bf9f-4508-a01a-402679439b21.jpeg?im_w=1440",
      caption: "Exciting Gaming Room for Entertainment",
    },
  ];
  const listingId = "6929ea1334872125aba99042";

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimateText(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % slides.length);
        setAnimateText(true);
      }, 300);
    }, 4000); // automatic slide change every 4 seconds

    setAnimateText(true);
    return () => clearInterval(interval);
  }, []);

  // Fetch booked ranges only when calendar is opened
  const fetchAvailability = async () => {
    try {
      const res = await axios.get(
        `${apiUrl}/bookings/listings/${listingId}/availability`
      );
      console.log("Availability data:", res.data);
      setBookedRanges(res.data.bookedDates || []);
    } catch (err) {
      console.error("Error fetching availability", err);
    }
  };

  // Get disabled dates based on booked ranges
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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle calendar date selection
  const handleRangeChange = (ranges) => {
    const { startDate, endDate } = ranges.selection;

    const disabled = getDisabledDates();
    const overlap = disabled.some((d) => d >= startDate && d <= endDate);

    if (overlap) {
      toast.error("Selected range includes booked dates.");
      return;
    }

    setFormData({
      ...formData,
      checkIn: startDate,
      checkOut: endDate,
    });
  };

  // Handle dropdown visibility toggle
  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  // Handle guest selection (increment or decrement)
  const handleGuestChange = (type, value) => {
    setFormData({
      ...formData,
      [type]: Math.max(formData[type] + value, 0),
    });
  };

  // Validate the form data before submission
  const validateForm = () => {
    let isValid = true;
    let errorMessages = [];

    if (!formData.name.trim()) {
      errorMessages.push("Name is required");
      isValid = false;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      errorMessages.push("Please enter a valid phone number");
      isValid = false;
    }

    if (!formData.checkIn) {
      errorMessages.push("Check-in date is required");
      isValid = false;
    }

    if (!formData.checkOut) {
      errorMessages.push("Check-out date is required");
      isValid = false;
    } else if (new Date(formData.checkOut) <= new Date(formData.checkIn)) {
      errorMessages.push(
        "Check-out date must be at least 2 days after check-in."
      );
      isValid = false;
    }

    if (formData.adults <= 0) {
      errorMessages.push("At least one adult is required");
      isValid = false;
    }

    if (!isValid) {
      errorMessages.forEach((message) => {
        toast.error(message);
      });
    }

    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !isLoggedIn) {
      dispatch(setModalOpen(true));
      return;
    }

    if (validateForm()) {
      setIsSubmitting(true);
      const formDataToDispatch = {
        ...formData,
        checkIn: formData.checkIn ? formData.checkIn.toISOString() : null,
        checkOut: formData.checkOut ? formData.checkOut.toISOString() : null,
        listingId: "6929ea1334872125aba99042",
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
          toast.success("Booking successful! Redirecting to payment...");
          const approvalLink = response.data.approvalLink;
          if (approvalLink) {
            window.location.href = approvalLink;
          }
          dispatch(setBookingData(formDataToDispatch));
          dispatch(setPaymentProcessed(true));

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
        toast.error("Error submitting booking");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Check if slide exists before rendering
  const { image, caption } = slides[current] || {}; // Avoid destructuring error

  return (
    <div className="hero-slider" id="hero" ref={ref}>
      <div className="hero-slide" style={{ backgroundImage: `url(${image})` }}>
        <div className={`hero-content`}>
          <div className={`hero-caption ${animateText ? "slide-up" : ""}`}>
            {caption}
          </div>

          <form onSubmit={handleSubmit} className="hero-form">
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

            {/* Date Picker */}
            <div
              className="input-container"
              onClick={() => {
                setIsCalendarOpen(!isCalendarOpen);
                if (!isCalendarOpen) {
                  fetchAvailability(); // Fetch availability only when opening the calendar
                }
              }}
            >
              <FaCalendarAlt className="input-icon" />
              <input
                type="text"
                readOnly
                value={
                  formData.checkIn && formData.checkOut
                    ? `${formData.checkIn.toLocaleDateString()} → ${formData.checkOut.toLocaleDateString()}`
                    : "Select Dates"
                }
                placeholder="Select Dates"
              />
            </div>

            {/* Calendar */}
            {isCalendarOpen && (
              <div className="calendar-popup">
                <DateRange
                  ranges={[
                    {
                      startDate: formData.checkIn || new Date(),
                      endDate: formData.checkOut || new Date(),
                      key: "selection",
                    },
                  ]}
                  onChange={handleRangeChange}
                  moveRangeOnFirstSelection={false}
                  rangeColors={["#148992"]}
                  months={2}
                  direction="horizontal"
                  minDate={new Date()}
                  locale={enUS}
                  disabledDates={getDisabledDates()}
                />
              </div>
            )}

            {/* Dropdown menu for guest selection */}
            <div className="input-container" onClick={toggleDropdown}>
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
            </div>
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
                          handleGuestChange(type, -1);
                        }}
                      >
                        −
                      </button>
                      <span>{formData[type]}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGuestChange(type, 1);
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Book Now"}
            </button>
          </form>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
});

export default HeroSlider;
