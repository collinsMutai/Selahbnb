import React, { useState, useEffect, forwardRef } from "react";
import "./HeroSlider.css";
import Form from "../Form/Form"; // ✅ USE SHARED FORM COMPONENT

const HeroSlider = forwardRef((props, ref) => {
  const [current, setCurrent] = useState(0);
  const [animateText, setAnimateText] = useState(false);

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

  // Slider autoplay animation
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimateText(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % slides.length);
        setAnimateText(true);
      }, 300);
    }, 4000);

    setAnimateText(true);
    return () => clearInterval(interval);
  }, []);

  const { image, caption } = slides[current];

  return (
    <div className="hero-slider" id="hero" ref={ref}>
      <div className="hero-slide" style={{ backgroundImage: `url(${image})` }}>
        <div className="hero-content">
          <div className={`hero-caption ${animateText ? "slide-up" : ""}`}>
            {caption}
          </div>

          {/* ⭐ REPLACED: Entire form is now clean, reusable, shared logic */}
          <div className="hero-form-wrapper">
            <Form />
          </div>
        </div>
      </div>
    </div>
  );
});

export default HeroSlider;
  