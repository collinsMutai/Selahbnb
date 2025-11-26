import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import listingRoutes from "./routes/listingRoutes.js";
import tourPlaceRoutes from "./routes/tourPlaceRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import paypalRoutes from './routes/paypalRoutes.js';


dotenv.config();
connectDB();

const app = express();

// CORS configuration
const corsOptions = {
  origin: "http://localhost:3000", // Update this with the actual origin of your frontend
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};

// Enable CORS
app.use(cors(corsOptions));

// Middleware to set security headers for COOP and COEP
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/tourplaces", tourPlaceRoutes);
app.use("/api/bookings", bookingRoutes);
app.use('/api/paypal', paypalRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
