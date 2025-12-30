import express from "express";
import { 
  registerUser, 
  loginUser, 
  googleLogin, 
  getUserProfile, 
  getUserBookings, 
  updateUserProfile, 
  refreshAccessToken, 
  logout, 
  getAllUsers,  // Import the getAllUsers controller
  deleteUser 
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js"; // Protect routes for authentication
import { isAdmin } from "../middleware/roleMiddleware.js"; // Role-based middleware

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

// Admin-only Routes
router.get("/", protect, isAdmin, getAllUsers);  // Fetch all users (admin only)
router.delete("/user/:id", protect, isAdmin, deleteUser);  // Delete a user (admin only)

export default router;
