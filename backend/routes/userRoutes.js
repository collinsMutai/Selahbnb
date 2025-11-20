// routes/userRoutes.js
import express from "express";
import { registerUser, loginUser, getUserProfile, getUserBookings, updateUserProfile, getAllUsers, deleteUser } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js"; // Protect routes for authentication
import { isHost, isAdmin, isHostOrAdmin } from "../middleware/roleMiddleware.js"; // Import the role-based middleware
import { createListing, updateListing, deleteListing } from "../controllers/listingController.js"; // Import listing functions

const router = express.Router();

// Public Routes
router.post("/register", registerUser); // Register a new user
router.post("/login", loginUser); // Login a user

// Protected Routes (User must be logged in)
router.get("/profile", protect, getUserProfile); // Get the user's profile (including role)
router.get("/bookings", protect, getUserBookings); // Get all bookings for the logged-in user
router.put("/profile", protect, updateUserProfile); // Update user profile (name, email, password)

// Host Routes (only accessible by users with the 'host' role)
router.post("/listings", protect, isHost, createListing); // Create a new listing (only accessible by hosts)
router.put("/listings/:id", protect, isHost, updateListing); // Update a listing (only accessible by hosts)
router.delete("/listings/:id", protect, isHost, deleteListing); // Delete a listing (only accessible by hosts)

// Admin Routes (only accessible by users with the 'admin' role)
router.get("/users", protect, isAdmin, getAllUsers); // Admin can view all users
router.delete("/users/:id", protect, isAdmin, deleteUser); // Admin can delete any user

export default router;
