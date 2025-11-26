import mongoose from "mongoose";

// Booking Schema definition
const bookingSchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true }, // Reference to the listing
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to the user
    name: { type: String, required: true }, // Guest's full name
    phone: { type: String, required: true }, // Guest's phone number
    adults: { type: Number, required: true }, // Number of adults
    children: { type: Number, default: 0 }, // Number of children
    infants: { type: Number, default: 0 }, // Number of infants
    pets: { type: Number, default: 0 }, // Number of pets
    checkIn: { type: Date, required: true }, // Check-in date
    checkOut: { type: Date, required: true }, // Check-out date
    totalPrice: { type: Number, required: true }, // Total price of the booking
    numberOfDays: { type: Number, required: true }, // Number of days the guest stays
    status: { type: String, default: "Pending", enum: ["Pending", "Confirmed", "Cancelled"] }, // Status of the booking
    paymentStatus: { type: String, enum: ["Pending", "Completed", "Failed", "Refunded"], default: "Pending" }, // Payment status
    paymentTransactionId: { type: String, unique: true, required: true }, // Unique transaction ID for the payment
    paypalOrderId: { type: String, unique: true },

  },
  { timestamps: true } // Automatically adds createdAt and updatedAt timestamps
);

export default mongoose.model("Booking", bookingSchema);
