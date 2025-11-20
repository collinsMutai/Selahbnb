// models/Listing.js
import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String },
    description: { type: String },
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking" }] // Add bookings reference
  },
  { timestamps: true }
);


export default mongoose.model("Listing", listingSchema);
