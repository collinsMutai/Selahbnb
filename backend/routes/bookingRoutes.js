// routes/bookingRoutes.js
import express from "express";
import { createBooking, getUserBookings, getListingBookings, updateBookingStatus } from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route to create a booking
router.post("/", protect, createBooking);

// Protected routes for getting user bookings and listing bookings
router.get("/user", protect, getUserBookings);
router.get("/listing/:id", protect, getListingBookings);

// Only hosts or admins can update booking status
router.put("/:id/status", protect, updateBookingStatus);

export default router;
