import React, { useState, useEffect, useRef } from "react";
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
  {
    id: 1,
    name: "Garden of the Gods",
    image: gardenofthegods,
    description: "A stunning natural park with massive red rock formations.",
  },
  {
    id: 2,
    name: "Pikes Peak",
    image: pikespeak,
    description:
      "The famous mountain offering breathtaking views of Colorado Springs.",
  },
  {
    id: 3,
    name: "Cheyenne Mountain Zoo",
    image: cheyennemountain,
    description: "A unique zoo located on the side of a mountain.",
  },
  {
    id: 4,
    name: "Old Colorado City",
    image: oldcoloradocity,
    description: "A historic district with unique shops and restaurants.",
  },
  {
    id: 5,
    name: "Colorado Springs Pioneers Museum",
    image: coloradospringspioneersmuseum,
    description: "A museum showcasing the history of Colorado Springs.",
  },
  {
    id: 6,
    name: "Manitou Springs Penny Arcade",
    image: manitouspringspennyarcade,
    description: "A nostalgic arcade with vintage games and memorabilia.",
  },
  {
    id: 7,
    name: "The Broadmoor Seven Falls",
    image: sevenfalls,
    description: "A series of seven stunning waterfalls.",
  },
  {
    id: 8,
    name: "Air Force Academy",
    image: airforceacademy,
    description: "A prestigious military academy with striking architecture.",
  },
  {
    id: 9,
    name: "Red Rock Canyon Open Space",
    image: redrockcanyonopenspace,
    description: "A hidden gem for hiking and outdoor activities.",
  },
  {
    id: 10,
    name: "Mount Cutler Trail",
    image: mountcutlertrail,
    description: "A popular trail with sweeping views of the city.",
  },
];

const Places = () => {
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsToShow, setItemsToShow] = useState(3);

  const trackRef = useRef();

  const updateItemsToShow = () => {
    const width = window.innerWidth;
    if (width <= 768) setItemsToShow(1);
    else if (width <= 1024) setItemsToShow(2);
    else setItemsToShow(3);
  };

  useEffect(() => {
    updateItemsToShow();
    window.addEventListener("resize", updateItemsToShow);
    return () => window.removeEventListener("resize", updateItemsToShow);
  }, []);

 const moveCarousel = (direction) => {
  if (!trackRef.current) return;

  const cardWidth = trackRef.current.children[0].offsetWidth + 15; // card width + gap
  const totalCards = places.length;
  const maxIndex = totalCards - itemsToShow;

  let newIndex = currentIndex + direction;

  if (newIndex > maxIndex) newIndex = 0;
  if (newIndex < 0) newIndex = maxIndex;

  setCurrentIndex(newIndex);

  trackRef.current.style.transform = `translateX(-${newIndex * cardWidth}px)`;
};


  useEffect(() => {
    const interval = setInterval(() => moveCarousel(1), 3000);
    return () => clearInterval(interval);
  }, [currentIndex, itemsToShow]);

  const handleCardClick = (place) => {
    setSelectedPlace(place);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlace(null);
  };

  return (
    <div className="places-container">
      <h2>Places to Visit in Colorado Springs</h2>

      <div className="carousel-container">
        <div className="carousel-wrapper">
          <div
            className="carousel-track"
            ref={trackRef}
            style={{
              transform: `translateX(-${
                currentIndex *
                (trackRef.current
                  ? trackRef.current.children[0].offsetWidth + 10
                  : 0)
              }px)`,
            }}
          >
            {places.map((place) => (
              <div
                key={place.id}
                className="place-card"
                onClick={() => handleCardClick(place)}
              >
                <img src={place.image} alt={place.name} />
                <h3>{place.name}</h3>
                <p>{place.description}</p>
              </div>
            ))}
          </div>
        </div>

        <button
          className="carousel-button prev"
          onClick={() => moveCarousel(-1)}
        >
          Prev
        </button>
        <button
          className="carousel-button next"
          onClick={() => moveCarousel(1)}
        >
          Next
        </button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        contentLabel="Place Details"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        {selectedPlace && (
          <div className="modal-content-wrapper">
            <h3>{selectedPlace.name}</h3>
            <img
              src={selectedPlace.image}
              alt={selectedPlace.name}
              className="modal-image"
            />
            <p>{selectedPlace.description}</p>
            <button onClick={handleCloseModal}>Close</button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Places;
