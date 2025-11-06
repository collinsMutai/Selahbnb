// controllers/tourPlaceController.js
import TourPlace from "../models/TourPlace.js";

// Get all tour places
export const getTourPlaces = async (req, res) => {
  try {
    const tourPlaces = await TourPlace.find({});
    res.status(200).json(tourPlaces);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single tour place
export const getTourPlaceById = async (req, res) => {
  try {
    const tourPlace = await TourPlace.findById(req.params.id);
    if (!tourPlace) return res.status(404).json({ message: "Tour place not found" });
    res.status(200).json(tourPlace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a tour place
export const createTourPlace = async (req, res) => {
  try {
    const { name, state, city, description, imageUrl } = req.body;
    const tourPlace = new TourPlace({ name, state, city, description, imageUrl });
    const createdTourPlace = await tourPlace.save();
    res.status(201).json(createdTourPlace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a tour place
export const updateTourPlace = async (req, res) => {
  try {
    const tourPlace = await TourPlace.findById(req.params.id);
    if (!tourPlace) return res.status(404).json({ message: "Tour place not found" });

    const { name, state, city, description, imageUrl } = req.body;
    tourPlace.name = name || tourPlace.name;
    tourPlace.state = state || tourPlace.state;
    tourPlace.city = city || tourPlace.city;
    tourPlace.description = description || tourPlace.description;
    tourPlace.imageUrl = imageUrl || tourPlace.imageUrl;

    const updatedTourPlace = await tourPlace.save();
    res.status(200).json(updatedTourPlace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a tour place
export const deleteTourPlace = async (req, res) => {
  try {
    const tourPlace = await TourPlace.findById(req.params.id);
    if (!tourPlace) return res.status(404).json({ message: "Tour place not found" });

    // Correct way to delete
    await tourPlace.deleteOne(); // or use TourPlace.findByIdAndDelete(req.params.id)

    res.status(200).json({ message: "Tour place deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};