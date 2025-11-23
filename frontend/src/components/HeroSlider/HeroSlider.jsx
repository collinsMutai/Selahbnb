import React, { useState, useEffect } from "react";
import { FaUser, FaPhoneAlt, FaCalendarAlt, FaChevronDown } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment-timezone";
import "./HeroSlider.css";

const slides = [
  {
    image: "https://a0.muscache.com/im/pictures/hosting/Hosting-1510422806091021624/original/05d2e101-b217-4c0e-9ba8-55dca12f3a8f.jpeg?im_w=1200",
    caption: "Front View of the Property"
  },
  {
    image: "https://a0.muscache.com/im/pictures/hosting/Hosting-1510422806091021624/original/19960d67-7f8f-4ee7-a679-13ce81f7e534.jpeg?im_w=1200",
    caption: "Spacious Living Room"
  },
  {
    image: "https://a0.muscache.com/im/pictures/hosting/Hosting-1510422806091021624/original/ca24cc0e-34c7-4b18-b80f-e9ed639ea963.jpeg?im_w=1200",
    caption: "Full Open Kitchen with Modern Amenities"
  },
  {
    image: "https://a0.muscache.com/im/pictures/hosting/Hosting-1510422806091021624/original/f88455c8-3f02-4b1d-a107-0fbaee382798.jpeg?im_w=1200",
    caption: "Elegant Dining Room for Family Meals"
  },
  {
    image: "https://a0.muscache.com/im/pictures/hosting/Hosting-1510422806091021624/original/f4179e2e-7d5f-4c7f-8cbe-423a683d2d77.jpeg?im_w=1200",
    caption: "Six Bedrooms for Comfort and Relaxation"
  },
  {
    image: "https://a0.muscache.com/im/pictures/hosting/Hosting-1510422806091021624/original/951caa35-ee85-475f-b8cf-69dffc91d5d9.jpeg?im_w=1200",
    caption: "Full Bathroom with Luxury Features"
  },
  {
    image: "https://a0.muscache.com/im/pictures/hosting/Hosting-1510422806091021624/original/1722b722-bf9f-4508-a01a-402679439b21.jpeg?im_w=1440",
    caption: "Exciting Gaming Room for Entertainment"
  }
];

export default function HeroSlider() {
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
  const [errors, setErrors] = useState({
    name: "",
    phone: "",
    checkIn: "",
    checkOut: "",
    guests: "",
  });

  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const nextSlide = () => {
    setAnimateText(false);
    setTimeout(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
      setAnimateText(true);
    }, 300);
  };

  const prevSlide = () => {
    setAnimateText(false);
    setTimeout(() => {
      setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
      setAnimateText(true);
    }, 300);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 4000); // automatic slide change every 4 seconds
    setAnimateText(true);
    return () => clearInterval(interval);
  }, []);

  const { image, caption } = slides[current];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCheckInChange = (date) => {
    const adjustedDate = moment(date).set({ hour: 12, minute: 0, second: 0 });
    setFormData({ ...formData, checkIn: adjustedDate.toDate() });
  };

  const handleCheckOutChange = (date) => {
    const adjustedDate = moment(date).set({ hour: 12, minute: 0, second: 0 });
    setFormData({ ...formData, checkOut: adjustedDate.toDate() });
  };

  const validateForm = () => {
    const newErrors = { name: "", phone: "", checkIn: "", checkOut: "", guests: "" };
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

    if (!formData.checkIn) {
      newErrors.checkIn = "Check-in date is required";
      isValid = false;
    }

    if (!formData.checkOut) {
      newErrors.checkOut = "Check-out date is required";
      isValid = false;
    } else if (new Date(formData.checkOut) <= new Date(formData.checkIn)) {
      newErrors.checkOut = "Check-out date must be at least 2 days after check-in.";
      isValid = false;
    }

    if (formData.adults <= 0) {
      newErrors.guests = "At least one adult is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log(formData);
      alert("Form Submitted!");
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
      setErrors({ name: "", phone: "", checkIn: "", checkOut: "", guests: "" });
    }
  };

  const today = new Date();
  const minCheckOutDate = formData.checkIn
    ? new Date(formData.checkIn).setDate(formData.checkIn.getDate() + 2)
    : today;

  const changeQuantity = (type, action, e) => {
    e.stopPropagation(); // Prevent the click from closing the dropdown
    setFormData((prevData) => {
      const newValue =
        action === "increase" ? prevData[type] + 1 : Math.max(prevData[type] - 1, 0);
      return {
        ...prevData,
        [type]: newValue,
      };
    });
  };

  const toggleDropdown = () => {
    setIsDropdownVisible((prevState) => !prevState);
  };

  return (
    <div className="hero-slider" id="hero">
      <div
        className="hero-slide"
        style={{ backgroundImage: `url(${image})` }}
      >
        <div className={`hero-content`}>
          <div className={`hero-caption ${animateText ? "slide-up" : ""}`}>
            {caption}
          </div>

          <form onSubmit={handleSubmit} className="hero-form">
            {/* Name and Phone Fields */}
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

            {/* Date pickers inline */}
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
                  minDate={minCheckOutDate}
                  disabled={!formData.checkIn}
                />
                {errors.checkOut && <p className="error-text">{errors.checkOut}</p>}
              </div>
            </div>

            {/* Guests Dropdown */}
            <div className="input-container" onClick={toggleDropdown}>
              <span className="input-icon">👨‍👩‍👧‍👦</span>
              <input
                type="text"
                value={`Adults: ${formData.adults}, Children: ${formData.children}, Infants: ${formData.infants}, Pets: ${formData.pets}`}
                readOnly
                placeholder="Select Guests"
              />
              <FaChevronDown className={`dropdown-icon ${isDropdownVisible ? "rotate" : ""}`} />
              {isDropdownVisible && (
                <div className="dropdown-menu">
                  {["adults", "children", "infants", "pets"].map((type) => (
                    <div className="dropdown-item" key={type}>
                      <label>{type.charAt(0).toUpperCase() + type.slice(1)}</label>
                      <div className="quantity-controls">
                        <button
                          type="button"
                          onClick={(e) => changeQuantity(type, "decrease", e)}
                        >
                          −
                        </button>
                        <span>{formData[type]}</span>
                        <button
                          type="button"
                          onClick={(e) => changeQuantity(type, "increase", e)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {errors.guests && <p className="error-text">{errors.guests}</p>}

            <button type="submit" className="submit-btn">
              Book Now
            </button>
          </form>
        </div>

        <button className="arrow left-arrow" onClick={prevSlide}>
          &#10094;
        </button>
        <button className="arrow right-arrow" onClick={nextSlide}>
          &#10095;
        </button>
      </div>
    </div>
  );
}
