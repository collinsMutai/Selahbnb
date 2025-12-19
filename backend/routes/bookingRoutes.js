// routes/bookingRoutes.js
import express from "express";
import { 
  createBooking, 
  getUserBookings, 
  getListingBookings, 
  updateBookingStatus, 
  getListingAvailability 
} from "../controllers/bookingController.js";
// Import both protect and optionalProtect
import { protect, optionalProtect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route to create a booking (Strict protection: User must be logged in to pay)
router.post("/", protect, createBooking);

// Protected routes for getting user bookings and listing bookings
router.get("/user", protect, getUserBookings);
router.get("/listing/:id", protect, getListingBookings);

// Only hosts or admins can update booking status
router.put("/:id/status", protect, updateBookingStatus);

/**
 * UPDATED: Use optionalProtect here.
 * This allows the controller to see req.user if they are logged in,
 * but doesn't block guests (unauthenticated users) from viewing the calendar.
 */
router.get("/listings/:listingId/availability", optionalProtect, getListingAvailability);

export default router;