// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  // First, check the Authorization header for the token (Bearer token)
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1]; // Get token from authorization header

      // Decode the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user to the request object
      req.user = await User.findById(decoded.id).select("-password");

      return next(); // Proceed to the next middleware
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, invalid token" });
    }
  }

  // If token is not in Authorization header, check cookies for refresh token (for refresh-token route)
  if (req.cookies && req.cookies.refreshToken) {
    try {
      token = req.cookies.refreshToken; // Get token from cookies

      // Decode the refresh token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user to the request object
      req.user = await User.findById(decoded.id).select("-password");

      return next(); // Proceed to the next middleware
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, invalid refresh token" });
    }
  }

  // If no token is found in either location
  return res.status(401).json({ message: "Not authorized, no token" });
};
