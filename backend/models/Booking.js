import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },             // Guest's full name
    phone: { type: String, required: true },            // Guest's phone number
    adults: { type: Number, required: true },           // Number of adults
    children: { type: Number, default: 0 },             // Number of children
    infants: { type: Number, default: 0 },              // Number of infants
    pets: { type: Number, default: 0 },                 // Number of pets
    checkIn: { type: Date, required: true },            // Check-in date
    checkOut: { type: Date, required: true },           // Check-out date
    totalPrice: { type: Number, required: true },       // Total price of the stay
    numberOfDays: { type: Number, required: true },     // Number of days of the stay
    status: { type: String, default: "Pending", enum: ["Pending", "Confirmed", "Cancelled"] },  // Booking status
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
