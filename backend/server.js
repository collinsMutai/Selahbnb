import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from 'body-parser';


import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import listingRoutes from "./routes/listingRoutes.js";
import tourPlaceRoutes from "./routes/tourPlaceRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import paypalRoutes from "./routes/paypalRoutes.js"; // This contains your webhook route
import contactRoutes from './routes/contactRoutes.js';

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

// 1. First, use express.raw() for PayPal webhook route
// This ensures raw body capture for signature verification
app.use("/api/paypal/webhook", bodyParser.raw({ type: 'application/json' }));

// 2. Then, use express.json() for other routes that require JSON parsing
app.use(express.json());

// 3. Define the routes (including PayPal routes)
app.use("/api/users", userRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/tourplaces", tourPlaceRoutes);
app.use("/api/bookings", bookingRoutes);

// **PayPal routes should come after express.raw() to handle /webhook correctly**
app.use("/api/paypal", paypalRoutes); // This includes webhook handling and other PayPal routes

app.use('/api/contact', contactRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
