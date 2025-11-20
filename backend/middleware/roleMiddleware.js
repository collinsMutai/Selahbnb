// middleware/roleMiddleware.js

// Middleware to check if the user is a host
export const isHost = (req, res, next) => {
  if (req.user.role !== 'host') {
    return res.status(403).json({ message: "Access denied. You are not a host." });
  }
  next(); // Proceed if the user is a host
};

// Middleware to check if the user is an admin
export const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Access denied. You are not an admin." });
  }
  next(); // Proceed if the user is an admin
};

// Middleware to check if the user is either a host or admin
export const isHostOrAdmin = (req, res, next) => {
  if (req.user.role !== 'host' && req.user.role !== 'admin') {
    return res.status(403).json({ message: "Access denied. You are neither a host nor an admin." });
  }
  next(); // Proceed if the user is a host or an admin
};
