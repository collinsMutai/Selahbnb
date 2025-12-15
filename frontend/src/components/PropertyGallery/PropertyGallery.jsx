import React, { useState, useEffect, useCallback } from "react";
import "./PropertyGallery.css"; // Import the external CSS file

const PropertyGallery = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [properties, setProperties] = useState([]);

  // Updated list of image file names to exclude (including path relative to the images folder)
  const excludedImages = [
    "./manitou-springs-penny-arcade.jpg",
    "./mount-cutler-trail.jpg",
    "./red-rock-canyon-open-space.jpg",
    "./seven-falls.avif",
    "./seven-falls.jpeg",
  ];

  // Function to dynamically load images from 'src/images' folder
  const loadImages = useCallback(() => {
    const context = require.context(
      "../../images", // Adjust path as necessary for your project
      false,
      /\.(jpg|jpeg|png|gif|avif)$/ // Specify the image formats you want to import
    );

    // Log out the list of paths that require.context is providing
    const imagePaths = context.keys();

    // Extract image paths and metadata, and exclude the unwanted images
    const images = imagePaths
      .map((key) => {
        const imageName = key.replace("./", "").replace(/\.[^/.]+$/, ""); // Clean up filename (remove path and extension)

        // Check if the image should be excluded
        const isExcluded = excludedImages.includes(key);
        if (isExcluded) {
          return null; // Skip this image
        }

        return {
          src: context(key), // Path to the image
          name: imageName, // Cleaned up filename
          category: getCategory(key), // Determine category based on filename
        };
      })
      .filter(Boolean); // Remove null values from the array

    return images;
  }, []); // Empty dependency array ensures `loadImages` is stable across renders

  // Helper function to categorize images based on their filenames
  function getCategory(imageName) {
    const lowercasedName = imageName.toLowerCase();
    if (lowercasedName.includes("front")) return "Exterior";
    if (lowercasedName.includes("interior")) return "Living Room";
    if (lowercasedName.includes("kitchen")) return "Kitchen";
    if (lowercasedName.includes("dining")) return "Dining Area";
    if (lowercasedName.includes("bathroom")) return "Bathroom";
    if (lowercasedName.includes("laundry")) return "Laundry Area";
    if (lowercasedName.includes("gaming")) return "Gaming Area";
    if (lowercasedName.includes("bedroom")) return "Bedroom";
    if (lowercasedName.includes("living")) return "Living Room";
    if (lowercasedName.includes("exterior")) return "Exterior";
    return "Other"; // Default category
  }

  // Load images and set them to the state when the component mounts
  useEffect(() => {
    const images = loadImages();
    setProperties(images);
  }, [loadImages]); // Add `loadImages` as a dependency here

  // Function to filter properties based on selected category
  const filterProperties = (category) => {
    setSelectedCategory(category);
  };

  // Filtered properties based on selected category
  const filteredProperties =
    selectedCategory === "All"
      ? properties
      : properties.filter((property) => property.category === selectedCategory);

  return (
    <div className="gallery-container" id="overview">
      {/* Section Heading */}
      <h2 className="gallery-heading">Exterior & Interior</h2>

      {/* Filter Buttons */}
      <div className="filters">
        <button
          onClick={() => filterProperties("All")}
          className={selectedCategory === "All" ? "active" : ""}
        >
          All
        </button>
        <button
          onClick={() => filterProperties("Exterior")}
          className={selectedCategory === "Exterior" ? "active" : ""}
        >
          Exterior
        </button>
        <button
          onClick={() => filterProperties("Living Room")}
          className={selectedCategory === "Living Room" ? "active" : ""}
        >
          Living Room
        </button>
        <button
          onClick={() => filterProperties("Kitchen")}
          className={selectedCategory === "Kitchen" ? "active" : ""}
        >
          Kitchen
        </button>
        <button
          onClick={() => filterProperties("Dining Area")}
          className={selectedCategory === "Dining Area" ? "active" : ""}
        >
          Dining Area
        </button>
        <button
          onClick={() => filterProperties("Bedroom")}
          className={selectedCategory === "Bedroom" ? "active" : ""}
        >
          Bedroom
        </button>
        <button
          onClick={() => filterProperties("Bathroom")}
          className={selectedCategory === "Bathroom" ? "active" : ""}
        >
          Bathroom
        </button>
        <button
          onClick={() => filterProperties("Laundry Area")}
          className={selectedCategory === "Laundry Area" ? "active" : ""}
        >
          Laundry Area
        </button>
        <button
          onClick={() => filterProperties("Gaming Area")}
          className={selectedCategory === "Gaming Area" ? "active" : ""}
        >
          Gaming Area
        </button>
      </div>

      {/* Property Cards */}
      <div className="property-cards">
        {filteredProperties.map((property, index) => (
          <div key={index} className="property-card">
            <img
              src={property.src}
              alt={property.name}
              className="property-image"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertyGallery;
