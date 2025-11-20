// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1]; // Get token from authorization header

      // Decode token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user to the request object
      req.user = await User.findById(decoded.id).select("-password");

      next(); // Proceed to the next middleware
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, invalid token" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};
