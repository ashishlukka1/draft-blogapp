// middleware/authMiddleware.js
const UserAuthor = require("../models/userAuthorModel");

// Middleware to check if user is active and has correct role
const checkUserStatus = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      // Get user info from Clerk (assuming it's attached to req.auth)
      const userEmail = req.auth.userId;
      
      if (!userEmail) {
        return res.status(401).send({ message: "Unauthorized" });
      }

      // Find user in database
      const user = await UserAuthor.findOne({ email: userEmail });
      
      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(403).send({ message: "Your account has been deactivated by an administrator. Please contact support." });
      }

      // Check if user has required role
      if (allowedRoles && !allowedRoles.includes(user.role)) {
        return res.status(403).send({ message: "You don't have permission to access this resource" });
      }

      // Add user to request object for future use
      req.user = user;
      next();
    } catch (error) {
      console.error("Auth middleware error:", error);
      res.status(500).send({ message: "Internal server error" });
    }
  };
};

module.exports = { checkUserStatus };