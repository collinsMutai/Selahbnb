import express from "express";
import { registerUser, loginUser, googleLogin, getUserProfile, getUserBookings, updateUserProfile, getAllUsers, deleteUser } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js"; // Protect routes for authentication
import { isHost, isAdmin, isHostOrAdmin } from "../middleware/roleMiddleware.js"; // Import the role-based middleware
import { createListing, updateListing, deleteListing } from "../controllers/listingController.js"; // Import listing functions

const router = express.Router();

// Public Routes
router.post("/register", registerUser); // Register a new user
router.post("/login", loginUser); // Login a user

// Google Login Route
router.post("/google-login", googleLogin); // Handle Google login

// Protected Routes (User must be logged in)
router.get("/profile", protect, getUserProfile); // Get the user's profile
router.get("/bookings", protect, getUserBookings); // Get all bookings for the logged-in user
router.put("/profile", protect, updateUserProfile); // Update user profile

// Host Routes (only accessible by users with the 'host' role)
router.post("/listings", protect, isHost, createListing); 
router.put("/listings/:id", protect, isHost, updateListing); 
router.delete("/listings/:id", protect, isHost, deleteListing);

// Admin Routes (only accessible by users with the 'admin' role)
router.get("/users", protect, isAdmin, getAllUsers); // Admin can view all users
router.delete("/users/:id", protect, isAdmin, deleteUser); // Admin can delete any user

export default router;
