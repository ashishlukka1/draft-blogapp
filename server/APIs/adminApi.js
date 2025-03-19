const exp = require("express");
const adminApp = exp.Router();
const UserAuthor = require("../models/userAuthorModel");
const expressAsyncHandler = require("express-async-handler");
const { requireAuth, clerkMiddleware } = require("@clerk/express");
require("dotenv").config();

adminApp.use(exp.json());

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

// Get all users and authors (requires authentication)
adminApp.get(
  "/users-authors",
  requireAuth({ signInUrl: "unauthorized" }),
  expressAsyncHandler(async (req, res) => {
    try {
      // Get clerk user ID from auth middleware
      const clerkUserId = req.auth.userId;
      
      // Verify this is an admin by checking the admin email in your database
      // You would typically map the Clerk user ID to your application's user
      const users = await UserAuthor.find();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users and authors", error: error.message });
    }
  })
);

// Enable or disable a user/author (requires authentication)
adminApp.put(
  "/update-status/:email",
  requireAuth({ signInUrl: "unauthorized" }),
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