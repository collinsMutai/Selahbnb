import React, { useState, useEffect, forwardRef } from "react";
import "./HeroSlider.css";
import Form from "../Form/Form"; // ✅ USE SHARED FORM COMPONENT
import Front_View_of_the_Property from "../../images/exterior_img1.avif";
import Spacious_Living_Room from "../../images/livingroom1_img5.avif";
import Full_Open_Kitchen_with_Modern_Amenities from "../../images/fullkitchen_img1.avif";
import Elegant_Dining_Room_for_Family_Meals from "../../images/diningarea_img1.avif";
import Six_Bedrooms_for_Comfort_and_Relaxation from "../../images/bedroom1_img1.avif";
import Full_Bathroom_with_Luxury_Features from "../../images/fullbathroom2_img1.avif";
import Exciting_Gaming_Room_for_Entertainment from "../../images/gamingarea_img5.avif";

const HeroSlider = forwardRef((props, ref) => {
  const [current, setCurrent] = useState(0);
  const [animateText, setAnimateText] = useState(false);

  const slides = [
    {
      image: Front_View_of_the_Property,
      caption: "Front View of the Property",
    },
    {
      image: Spacious_Living_Room,
      caption: "Spacious Living Room",
    },
    {
      image: Full_Open_Kitchen_with_Modern_Amenities,
      caption: "Full Open Kitchen with Modern Amenities",
    },
    {
      image: Elegant_Dining_Room_for_Family_Meals,
      caption: "Elegant Dining Room for Family Meals",
    },
    {
      image: Six_Bedrooms_for_Comfort_and_Relaxation,
      caption: "Six Bedrooms for Comfort and Relaxation",
    },
    {
      image: Full_Bathroom_with_Luxury_Features,
      caption: "Full Bathroom with Luxury Features",
    },
    {
      image: Exciting_Gaming_Room_for_Entertainment,
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
