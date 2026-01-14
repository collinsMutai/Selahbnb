import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Keep your existing protect middleware for routes that REQUIRE login
export const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      return next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, invalid token" });
    }
  }
  // ... (your existing cookie check logic)
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
      return res
        .status(401)
        .json({ message: "Not authorized, invalid refresh token" });
    }
  }
  return res.status(401).json({ message: "Not authorized, no token" });
};

// ADD THIS: Soft middleware for routes that work for BOTH guests and users
export const optionalProtect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
    } catch (error) {
      // If token is invalid, we don't error out; we just treat them as a guest
      req.user = null;
    }
  } else {
    // No token provided; user is a guest
    req.user = null;
  }

  next(); // Always proceed to the controller
};
