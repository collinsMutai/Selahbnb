// routes/tourPlaceRoutes.js
import express from "express";
const router = express.Router();

import {
  getTourPlaces,
  getTourPlaceById,
  createTourPlace,
  updateTourPlace,
  deleteTourPlace,
} from "../controllers/tourPlaceController.js";

import { protect } from "../middleware/authMiddleware.js"; // JWT protection

// Public routes
router.get("/", getTourPlaces);          // Get all tour places
router.get("/:id", getTourPlaceById);   // Get tour place by ID

// Protected routes (require token)
router.post("/", protect, createTourPlace);      // Create a tour place
router.put("/:id", protect, updateTourPlace);   // Update a tour place
router.delete("/:id", protect, deleteTourPlace);// Delete a tour place

export default router;
