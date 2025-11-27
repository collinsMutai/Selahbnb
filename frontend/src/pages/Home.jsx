import React, { useEffect } from "react";
import HeroSlider from "../components/HeroSlider/HeroSlider"; // Import HeroSlider
import PropertyGallery from "../components/PropertyGallery/PropertyGallery";
import BookingForm from "../components/BookingForm/BookingForm";

export default function Home() {
  return (
    <div id="home">
      {/* HeroSlider */}
      <HeroSlider />

      {/* PropertyGallery */}
      <PropertyGallery />

      {/* Booking Form */}
      <BookingForm />
    </div>
  );
}
