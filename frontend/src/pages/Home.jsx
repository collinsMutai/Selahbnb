import React from "react";
import HeroSlider from "../components/HeroSlider/HeroSlider";
import PropertyGallery from "../components/PropertyGallery/PropertyGallery";
import BookingForm from "../components/BookingForm/BookingForm";

export default function Home() {
  return (
    <div>
      <HeroSlider />
      <PropertyGallery/>
      <BookingForm />
    </div>
  );
}
