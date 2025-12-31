import express from "express";
import { getAnalytics } from "../controllers/analyticsController.js";
import { protect } from "../middleware/authMiddleware.js"; // Protect routes for authentication
import { isAdmin } from "../middleware/roleMiddleware.js"; // Role-based middleware

const router = express.Router();

// Protected route for admins to access analytics
router.get("/", protect, isAdmin, getAnalytics);

export default router;
