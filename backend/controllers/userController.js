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
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Generate JWT Access Token (expires in 1 hour)
    const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Generate JWT Refresh Token (expires in 7 days)
    const refreshToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Set the refresh token in an HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', // Set to true in production to use https
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days expiration
      sameSite: 'Strict',
    });

    // Return the access token in response
    res.json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Google Login function
export const googleLogin = async (req, res) => {
  const { token } = req.body;

  try {
    // Verify the token with Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID, // Your Google Client ID
    });

    const payload = ticket.getPayload(); // Get user info from payload
    const { email, name, picture } = payload;

    // Try to find and update the user
    let user = await User.findOneAndUpdate(
      { email },
      { profilePicture: picture }, // Update the profile picture
      { new: true, upsert: true } // Create user if they don't exist
    );

    if (!user) {
      user = new User({
        email,
        name,
        password: null, // No password needed for Google login
        role: 'user',
        profilePicture: picture,
      });
      await user.save(); // Save the new user
    }

    // Generate JWT Access Token (expires in 1 hour)
    const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Generate JWT Refresh Token (expires in 7 days)
    const refreshToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Set the refresh token in an HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days expiration
      sameSite: 'Strict',
    });

    // Return the access token and user data in response
    res.json({
      accessToken,
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


// Refresh the Access Token
export const refreshAccessToken = async (req, res) => {
  try {
    // Get the refresh token from the cookie
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    // Generate a new access token
    const newAccessToken = jwt.sign({ id: decoded.id, role: decoded.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Return the new access token
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired refresh token" });
  }
};

// Logout the user
export const logout = (req, res) => {
  res.clearCookie('refreshToken'); // Clear the refresh token from cookies
  res.json({ message: "Logged out successfully" });
};
