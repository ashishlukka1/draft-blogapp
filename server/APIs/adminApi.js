const exp = require("express");
const adminApp = exp.Router();
const UserAuthor = require("../models/userAuthorModel");
const expressAsyncHandler = require("express-async-handler");
const { clerkClient } = require("@clerk/clerk-sdk-node");
require("dotenv").config();

adminApp.use(exp.json());

// Custom authentication middleware
const authenticateAdmin = async (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Missing or invalid authorization token" });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify with Clerk
    try {
      // Get session from token
      const session = await clerkClient.sessions.verifyToken(token);
      
      if (!session) {
        return res.status(401).json({ message: "Invalid session token" });
      }
      
      // Get user from session
      const user = await clerkClient.users.getUser(session.userId);
      
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      // Get primary email
      const primaryEmail = user.emailAddresses.find(email => email.id === user.primaryEmailAddressId)?.emailAddress;
      
      if (!primaryEmail) {
        return res.status(401).json({ message: "Email not found" });
      }
      
      // Check if user is admin in your database
      const adminUser = await UserAuthor.findOne({ email: primaryEmail, role: "admin" });
      
      if (!adminUser) {
        return res.status(403).json({ message: "Not authorized as admin" });
      }
      
      // Add user email to request for later use
      req.userEmail = primaryEmail;
      
      // Proceed if user is admin
      next();
    } catch (error) {
      console.error("Token verification error:", error);
      return res.status(401).json({ message: "Authentication failed", error: error.message });
    }
  } catch (error) {
    console.error("Authentication middleware error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Check if user is an admin
adminApp.post(
  "/users-authors",
  expressAsyncHandler(async (req, res) => {
    try {
      const { email } = req.body;
      // Check if user exists and is an admin
      const adminUser = await UserAuthor.findOne({ email, role: "admin" });
      
      if (!adminUser) {
        return res.status(403).json({ message: "not admin" });
      }
      
      // Return admin user data with active status
      return res.status(200).json({ 
        message: "admin", 
        payload: adminUser 
      });
    } catch (error) {
      console.error("Admin verification error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  })
);

// Get all users and authors (with custom authentication)
adminApp.get(
  "/users-authors",
  authenticateAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      // Authentication middleware already verified this is an admin
      const users = await UserAuthor.find();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Error fetching users and authors", error: error.message });
    }
  })
);

// Enable or disable a user/author (with custom authentication)
adminApp.put(
  "/update-status/:email",
  authenticateAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      const { email } = req.params;
      const { isActive } = req.body;

      const user = await UserAuthor.findOneAndUpdate(
        { email },
        { isActive },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ 
        message: `User ${isActive ? "enabled" : "disabled"} successfully`, 
        user 
      });
    } catch (error) {
      res.status(500).json({ message: "Error updating user status", error: error.message });
    }
  })
);

// Route to handle unauthorized access attempts
adminApp.get("/unauthorized", (req, res) => {
  res.status(401).json({ message: "Unauthorized request" });
});

module.exports = adminApp;