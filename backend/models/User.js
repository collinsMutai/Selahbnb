import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, enum: ['user', 'host', 'admin'], default: 'user' }, // 'user', 'host', 'admin'
    bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking" }],
    profilePicture: { type: String }, // Field for storing the profile picture URL
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
