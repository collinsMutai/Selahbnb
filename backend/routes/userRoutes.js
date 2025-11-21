import express from "express";
import { registerUser, loginUser, googleLogin, getUserProfile, getUserBookings, updateUserProfile, refreshAccessToken, logout } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js"; // Protect routes for authentication
import { isHost, isAdmin } from "../middleware/roleMiddleware.js"; // Role-based middleware

const router = express.Router();

// Public Routes
router.post("/register", registerUser); // Register a new user
router.post("/login", loginUser); // Login a user
router.post("/google-login", googleLogin); // Google login

// Refresh Access Token
router.post("/refresh-token", refreshAccessToken); // Refresh the access token

// Protected Routes
router.get("/profile", protect, getUserProfile); // Get user profile
router.get("/bookings", protect, getUserBookings); // Get user bookings
router.put("/profile", protect, updateUserProfile); // Update user profile
router.post("/logout", protect, logout); // Logout the user

export default router;
