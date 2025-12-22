import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import listingRoutes from "./routes/listingRoutes.js";
import tourPlaceRoutes from "./routes/tourPlaceRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import paypalRoutes from "./routes/paypalRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";

dotenv.config();
connectDB();

const app = express();

// ✅ CORRECT CORS CONFIG — no COOP/COEP headers
const corsOptions = {
  origin: process.env.CORS_ORIGIN.split(","),
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Apply express.raw() middleware specifically to the PayPal webhook route
// This ensures we handle the raw body correctly for signature verification
app.use("/api/paypal/webhook", express.raw({ type: "application/json" }));

// Apply general body parsers after
app.use(express.json());  // For other API routes that require JSON body parsing

// Your route handlers
app.use("/api/users", userRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/tourplaces", tourPlaceRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/paypal", paypalRoutes);
app.use("/api/contact", contactRoutes);

// Test route to check if server is running
app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
