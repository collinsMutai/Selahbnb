import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: function () {
        return this.createdBy === "user";
      },
    },

    adults: {
      type: Number,
      required: function () {
        return this.createdBy === "user";
      },
    },

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

    paymentTransactionId: {
      type: String,
      required: true,
    },

    paypalOrderId: { type: String },
    captureId: { type: String },

    holdExpiration: { type: Date },

    // 🔑 Admin vs User distinction
    createdBy: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    blockReason: {
      type: String, // "maintenance", "owner stay", etc.
    },
  },
  { timestamps: true }
);

// ✅ TTL index — ONLY deletes expired holds
bookingSchema.index(
  { holdExpiration: 1 },
  { expireAfterSeconds: 0, partialFilterExpression: { status: "Hold" } }
);

// ✅ Availability performance index
bookingSchema.index({ listing: 1, status: 1, checkIn: 1, checkOut: 1 });

export default mongoose.model("Booking", bookingSchema);
