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
    holdExpiration: { type: Date }, // Holds the expiration time for the hold
  },
  { timestamps: true }
);

// Create a TTL index with a partial filter expression
bookingSchema.index(
  { holdExpiration: 1 },
  { expireAfterSeconds: 900, partialFilterExpression: { status: "Hold" } }
);

export default mongoose.model("Booking", bookingSchema);
