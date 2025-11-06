import express from "express";
import {
  getListings,
  createListing,
  getListingById,
  updateListing,
  deleteListing,
} from "../controllers/listingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getListings);
router.get("/:id", getListingById);

// Protected routes
router.post("/", protect, createListing);
router.put("/:id", protect, updateListing); // ✅ Update listing
router.delete("/:id", protect, deleteListing); // ✅ Delete listing

export default router;
