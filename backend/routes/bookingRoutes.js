// routes/bookingRoutes.js
import express from "express";
import {
  createBooking,
  getUserBookings,
  getListingBookings,
  updateBookingStatus,
  getListingAvailability,
  getBookingById,
  adminBlockDates,
  adminRemoveBlock,
  getAdminCalendar,
} from "../controllers/bookingController.js";
// Import both protect and optionalProtect
import { protect, optionalProtect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Public route to create a booking (Strict protection: User must be logged in to pay)
router.post("/", protect, createBooking);

// Protected routes for getting user bookings and listing bookings
router.get("/user", protect, getUserBookings);
// This must come AFTER /user so it doesn't treat 'user' as an ID
router.get("/:id", protect, getBookingById);
router.get("/listing/:id", protect, getListingBookings);

// Only hosts or admins can update booking status
router.put("/:id/status", protect, updateBookingStatus);

/**
 * UPDATED: Use optionalProtect here.
 * This allows the controller to see req.user if they are logged in,
 * but doesn't block guests (unauthenticated users) from viewing the calendar.
 */
router.get(
  "/listings/:listingId/availability",
  optionalProtect,
  getListingAvailability
);

// Admin: block dates for a listing
router.post(
  "/admin/listings/:listingId/block-dates",
  protect,
  isAdmin,
  adminBlockDates
);

// Admin: remove a blocked date range
router.delete("/admin/bookings/:id", protect, isAdmin, adminRemoveBlock);

router.get(
  "/admin/listings/:listingId/calendar",
  protect,
  isAdmin,
  getAdminCalendar
);

export default router;
