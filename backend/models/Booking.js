import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    adults: { type: Number, required: true },
    children: { type: Number, default: 0 },
    infants: { type: Number, default: 0 },
    pets: { type: Number, default: 0 },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    totalPrice: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    numberOfDays: { type: Number, required: true },
    status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Confirmed", "Cancelled", "Hold"],
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Completed", "Failed", "Refunded"],
      default: "Pending",
    },
    paymentTransactionId: { type: String, required: true },
    paypalOrderId: { type: String },
    captureId: { type: String },
    holdExpiration: { type: Date }, 
  },
  { timestamps: true }
);

// 1. Optimized TTL Index: 
// Setting expireAfterSeconds to 0 means "Delete exactly at the time stored in holdExpiration"
bookingSchema.index(
  { holdExpiration: 1 },
  { expireAfterSeconds: 0, partialFilterExpression: { status: "Hold" } }
);

// 2. Search Index:
// Speeds up checking if dates are already taken/held for a specific listing
bookingSchema.index({ listing: 1, status: 1, checkIn: 1, checkOut: 1 });

export default mongoose.model("Booking", bookingSchema);