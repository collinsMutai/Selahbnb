import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    name: String,
    phone: String,

    adults: Number,
    children: Number,
    infants: Number,
    pets: Number,

    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },

    subtotal: Number,
    tax: Number,
    totalPrice: Number,
    numberOfDays: Number,

    status: {
      type: String,
      enum: ["HOLD", "CONFIRMED", "CANCELLED"],
      default: "HOLD",
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "COMPLETED", "REFUNDED"],
      default: "PENDING",
    },

    paypalOrderId: { type: String, unique: true, sparse: true },
    captureId: { type: String, sparse: true },

    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// -----------------------------
// TTL: Automatically remove expired HOLD bookings
// -----------------------------
bookingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Prevent overlapping CONFIRMED/HOLD bookings
bookingSchema.index({ listing: 1, checkIn: 1, checkOut: 1, status: 1 });

// Fast lookup by PayPal Order ID
bookingSchema.index({ paypalOrderId: 1 });

export default mongoose.model("Booking", bookingSchema);
