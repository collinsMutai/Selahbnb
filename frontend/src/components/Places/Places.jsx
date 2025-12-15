import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import "./Places.css";

import gardenofthegods from "../../images/garden-of-gods.jpg";
import pikespeak from "../../images/pikespeak-highway.webp";
import oldcoloradocity from "../../images/old-colorado-city.webp";
import airforceacademy from "../../images/airforceacademy.avif";
import cheyennemountain from "../../images/cheyenne-mountain.webp";
import coloradospringspioneersmuseum from "../../images/colorado-springs-pioneers-museum.jpg";
import manitouspringspennyarcade from "../../images/manitou-springs-penny-arcade.jpg";
import mountcutlertrail from "../../images/mount-cutler-trail.jpg";
import redrockcanyonopenspace from "../../images/red-rock-canyon-open-space.jpg";
import sevenfalls from "../../images/seven-falls.jpeg";

const places = [
  { id: 1, name: "Garden of the Gods", image: gardenofthegods },
  { id: 2, name: "Pikes Peak", image: pikespeak },
  { id: 3, name: "Cheyenne Mountain Zoo", image: cheyennemountain },
  { id: 4, name: "Old Colorado City", image: oldcoloradocity },
  { id: 5, name: "Colorado Springs Pioneers Museum", image: coloradospringspioneersmuseum },
  { id: 6, name: "Manitou Springs Penny Arcade", image: manitouspringspennyarcade },
  { id: 7, name: "The Broadmoor Seven Falls", image: sevenfalls },
  { id: 8, name: "Air Force Academy", image: airforceacademy },
  { id: 9, name: "Red Rock Canyon Open Space", image: redrockcanyonopenspace },
  { id: 10, name: "Mount Cutler Trail", image: mountcutlertrail },
];

const Places = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visibleImages, setVisibleImages] = useState(places.slice(0, 4)); // Start with first 4 images

  // Function to update visible images in the carousel
  const moveCarousel = () => {
    setVisibleImages((prevImages) => {
      const nextImages = [
        ...prevImages.slice(1),
        places[(places.indexOf(prevImages[prevImages.length - 1]) + 1) % places.length],
      ]; // Shift images and add the next one
      return nextImages;
    });
  };

  // Auto move carousel every 3 seconds
  useEffect(() => {
    const interval = setInterval(moveCarousel, 3000); // Slide every 3 seconds
    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  // Adjust number of visible images based on screen width
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width <= 768) {
        setVisibleImages(places.slice(0, 1)); // 1 image for mobile
      } else if (width <= 1024) {
        setVisibleImages(places.slice(0, 2)); // 2 images for tablets
      } else {
        setVisibleImages(places.slice(0, 4)); // 4 images for desktop
      }
    };

    handleResize(); // Initialize on mount
    window.addEventListener("resize", handleResize); // Update on window resize

    return () => window.removeEventListener("resize", handleResize); // Cleanup on unmount
  }, []);

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  return (
    <div className="main-container">
      <div className="places-container">
      <h2>Places to Visit in Colorado Springs</h2>

      <div className="carousel-container">
        <div className="carousel-wrapper">
          {visibleImages.map((place) => (
            <div
              key={place.id}
              className="carousel-image-container"
              onClick={() => handleImageClick(place.image)}
            >
              <img src={place.image} alt={place.name} className="carousel-image" />
              <div className="carousel-caption">{place.name}</div> {/* Image name below the image */}
            </div>
          ))}
        </div>
      </div>

      {/* Modal to view image in detail */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        contentLabel="Image Details"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        {selectedImage && (
          <div className="modal-content-wrapper">
            <img
              src={selectedImage}
              alt="Selected"
              className="modal-image"
            />
            <button onClick={handleCloseModal}>Close</button>
          </div>
        )}
      </Modal>
    </div>
    </div>
  );
};

export default Places;
