import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

// Routes
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import listingRoutes from "./routes/listingRoutes.js";
import tourPlaceRoutes from "./routes/tourPlaceRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import paypalRoutes from "./routes/paypalRoutes.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:3000", // Local frontend
    "https://8b0e6b8aec8b.ngrok-free.app", // Ngrok URL for backend
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Enable CORS
app.use(cors(corsOptions));

// Middleware to set security headers for COOP and COEP
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

// Middleware to parse JSON bodies
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/tourplaces", tourPlaceRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/paypal", paypalRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
