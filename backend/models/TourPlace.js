// models/TourPlace.js
import mongoose from "mongoose";

const tourPlaceSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String },
  },
  {
    timestamps: true,
  }
);

const TourPlace = mongoose.model("TourPlace", tourPlaceSchema);
export default TourPlace;
