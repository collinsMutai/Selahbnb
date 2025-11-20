// controllers/userController.js
import { OAuth2Client } from 'google-auth-library';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Booking from "../models/Booking.js"; // Import the Booking model
const client = new OAuth2Client(process.env.CLIENT_ID);
// Register a new user
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login a user
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Google Login function
export const googleLogin = async (req, res) => {
  const { token } = req.body; // Get the token from frontend
  
  try {
    // Verify the token with Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID, // Your Google Client ID
    });
    
    const payload = ticket.getPayload(); // Get user info from payload
    const { email, name, picture } = payload; // Destructure the fields

    // Check if the user already exists
    let user = await User.findOne({ email });
    if (!user) {
      // If the user does not exist, create a new user
      user = await User.create({ 
        email, 
        name, 
        password: null, // Password is not needed for Google login
        role: "user", 
        profilePicture: picture // Store Google profile picture
      });
    } else {
      // If the user exists, update their profile picture (optional)
      user.profilePicture = picture;
      await user.save();
    }

    // Create a JWT token for the logged-in user
    const jwtToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error during Google login", error: error.message });
  }
};


// Get User Profile and Check if Host
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if the user is a host based on the role
    const isHost = user.role === 'host';

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isHost: isHost, // Return isHost field based on role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all bookings for the user
export const getUserBookings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("bookings");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.bookings); // Send back the user's bookings
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user profile (name, email, password)
export const updateUserProfile = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user info (password is optional)
    user.name = name || user.name;
    user.email = email || user.email;

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await user.save();
    res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    // Check if the user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. You are not an admin." });
    }

    // Fetch all users from the database
    const users = await User.find().select("-password"); // Exclude the password field for security reasons
    res.json(users); // Return the list of users
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a user (admin only)
export const deleteUser = async (req, res) => {
  const { id } = req.params; // Get the user ID from the request params
  try {
    // Ensure that the user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. You are not an admin." });
    }

    // Find the user by ID
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete the user
    await user.deleteOne();

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


