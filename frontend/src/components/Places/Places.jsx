import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import './Places.css';

// Import images (same as before)
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

// Sample data for places (same as before)
const places = [
  { id: 1, name: 'Garden of the Gods', image: gardenofthegods, description: 'A stunning natural park with massive red rock formations.' },
  { id: 2, name: 'Pikes Peak', image: pikespeak, description: 'The famous mountain offering breathtaking views of Colorado Springs.' },
  { id: 3, name: 'Cheyenne Mountain Zoo', image: cheyennemountain, description: 'A unique zoo located on the side of a mountain.' },
  { id: 4, name: 'Old Colorado City', image: oldcoloradocity, description: 'A historic district with unique shops and restaurants.' },
  { id: 5, name: 'Colorado Springs Pioneers Museum', image: coloradospringspioneersmuseum, description: 'A museum showcasing the history of Colorado Springs.' },
  { id: 6, name: 'Manitou Springs Penny Arcade', image: manitouspringspennyarcade, description: 'A nostalgic arcade with vintage games and memorabilia.' },
  { id: 7, name: 'The Broadmoor Seven Falls', image: sevenfalls, description: 'A series of seven stunning waterfalls.' },
  { id: 8, name: 'Air Force Academy', image: airforceacademy, description: 'A prestigious military academy with striking architecture.' },
  { id: 9, name: 'Red Rock Canyon Open Space', image: redrockcanyonopenspace, description: 'A hidden gem for hiking and outdoor activities.' },
  { id: 10, name: 'Mount Cutler Trail', image: mountcutlertrail, description: 'A popular trail with sweeping views of the city.' },
];

const Places = () => {
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsToShow, setItemsToShow] = useState(3); // Default to 3 items per view

  const totalItems = places.length;

  // Update items to show based on window width
  useEffect(() => {
    const updateItemsToShow = () => {
      if (window.innerWidth <= 480) {
        setItemsToShow(1); // Show 1 item on small screens
      } else if (window.innerWidth <= 768) {
        setItemsToShow(2); // Show 2 items on medium screens
      } else {
        setItemsToShow(3); // Show 3 items by default
      }
    };

    window.addEventListener('resize', updateItemsToShow);
    updateItemsToShow(); // Set initial value

    return () => window.removeEventListener('resize', updateItemsToShow);
  }, []);

  // Handle opening and closing modal
  const handleCardClick = (place) => {
    setSelectedPlace(place);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlace(null);
  };

  // Autoplay effect (moves carousel every 3 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      moveCarousel(1); // Move to the next slide every 3 seconds
    }, 3000); // Adjust interval timing here (3000ms = 3 seconds)

    return () => clearInterval(interval);
  }, [currentIndex]);

  // Move the carousel based on direction
  const moveCarousel = (direction) => {
    const newIndex = (currentIndex + direction + totalItems) % totalItems;
    setCurrentIndex(newIndex);
  };

  return (
    <div className="places-container">
      <h2>Places to Visit in Colorado Springs</h2>

      <div className="carousel-container">
        <div className="carousel-wrapper">
          <div
            className="carousel-track"
            style={{
              transform: `translateX(-${(currentIndex * 100) / itemsToShow}%)`,
              width: `${totalItems * (100 / itemsToShow)}%`,
            }}
          >
            {places.map((place) => (
              <div key={place.id} className="place-card" onClick={() => handleCardClick(place)}>
                <img src={place.image} alt={place.name} />
                <h3>{place.name}</h3>
                <p>{place.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <button className="carousel-button prev" onClick={() => moveCarousel(-1)}>Prev</button>
        <button className="carousel-button next" onClick={() => moveCarousel(1)}>Next</button>
      </div>

      <Modal isOpen={isModalOpen} onRequestClose={handleCloseModal} contentLabel="Place Details" className="modal-content" overlayClassName="modal-overlay">
        {selectedPlace && (
          <div className="modal-content-wrapper">
            <h3>{selectedPlace.name}</h3>
            <img src={selectedPlace.image} alt={selectedPlace.name} className="modal-image" />
            <p>{selectedPlace.details}</p>
            <button onClick={handleCloseModal}>Close</button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Places;
