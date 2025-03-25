const exp = require("express");
const adminApp = exp.Router();
const UserAuthor = require("../models/userAuthorModel");
const expressAsyncHandler = require("express-async-handler");
require("dotenv").config();

adminApp.use(exp.json());

// POST endpoint for user-authors that matches the client-side call
adminApp.post(
  "/users-authors",
  expressAsyncHandler(async (req, res) => {
    try {
      const userData = req.body;
      
      // Verify this is an admin by checking email in database
      const adminUser = await UserAuthor.findOne({ 
        email: userData.email, 
        role: "admin" 
      });
      
      if (!adminUser) {
        return res.status(403).json({ message: "Not authorized as admin" });
      }
      
      // If admin exists and is active, send back user data
      if (adminUser.isActive) {
        return res.status(200).json({ 
          message: "admin", 
          payload: adminUser 
        });
      } else {
        return res.status(403).json({ 
          message: "Your admin account is blocked. Please contact support for assistance." 
        });
      }
    } catch (error) {
      console.error("Admin verification error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  })
);

// Check if user is an admin (keeping from second API but removing Clerk dependency)
adminApp.post(
  "/check-admin",
  expressAsyncHandler(async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      // Check if user exists
      const user = await UserAuthor.findOne({ email });
      
      if (!user) {
        return res.status(404).json({ message: "User not found", isAdmin: false });
      }
      
      // Return user data with admin status
      return res.status(200).json({ 
        message: "Admin status checked",
        isAdmin: user.role === 'admin',
        userId: user._id,
        role: user.role
      });
    } catch (error) {
      console.error("Admin verification error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  })
);

// Get all users and authors (removing Clerk authentication)
adminApp.get(
  "/users-authors",
  expressAsyncHandler(async (req, res) => {
    try {
      // Optional: Add a simple authentication check using query parameter
      const { email } = req.query;
      
      if (email) {
        // Verify this is an admin by checking the database
        const adminUser = await UserAuthor.findOne({ email, role: "admin" });
        
        if (!adminUser) {
          return res.status(403).json({ message: "Not authorized as admin" });
        }
      }
      
      const users = await UserAuthor.find();
      res.status(200).json({ 
        message: "Users fetched successfully", 
        payload: users 
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching users and authors", error: error.message });
    }
  })
);

// Enable or disable a user/author (removing Clerk authentication)
adminApp.put(
  "/update-status/:email",
  expressAsyncHandler(async (req, res) => {
    try {
      const { email } = req.params;
      const { isActive, adminEmail } = req.body;
      
      if (typeof isActive !== 'boolean') {
        return res.status(400).json({ message: "isActive must be a boolean value" });
      }
      
      // Optional: Verify the requester is an admin
      if (adminEmail) {
        const adminUser = await UserAuthor.findOne({ email: adminEmail, role: "admin" });
        if (!adminUser) {
          return res.status(403).json({ message: "Not authorized as admin" });
        }
      }
      
      const user = await UserAuthor.findOneAndUpdate(
        { email },
        { isActive },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({ 
        message: `User ${isActive ? "activated" : "deactivated"} successfully`, 
        payload: user 
      });
    } catch (error) {
      res.status(500).json({ message: "Error updating user status", error: error.message });
    }
  })
);

module.exports = adminApp;