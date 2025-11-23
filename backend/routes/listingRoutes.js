import express from "express";
import {
  getListings,
  createListing,
  getListingById,
  updateListing,
  deleteListing,
} from "../controllers/listingController.js";
import { protect } from "../middleware/authMiddleware.js";
import { isHostOrAdmin } from "../middleware/roleMiddleware.js"; // Import the isHostOrAdmin middleware

const router = express.Router();

// Public routes
router.get("/", getListings);
router.get("/:id", getListingById);

// Protected routes with role-based access control
router.post("/", protect, isHostOrAdmin, createListing);  // Only hosts or admins can create a listing
router.put("/:id", protect, isHostOrAdmin, updateListing); // Only hosts or admins can update a listing
router.delete("/:id", protect, isHostOrAdmin, deleteListing); // Only hosts or admins can delete a listing

export default router;
