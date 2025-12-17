import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import listingRoutes from "./routes/listingRoutes.js";
import tourPlaceRoutes from "./routes/tourPlaceRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import paypalRoutes from "./routes/paypalRoutes.js";

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

app.use("/api/paypal/webhook", express.raw({ type: "application/json" }));

app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/tourplaces", tourPlaceRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/paypal", paypalRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});