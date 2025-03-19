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
  requireAuth(),
  expressAsyncHandler(async (req, res) => {
    try {
      // Log that we're attempting to fetch users
      console.log("Attempting to fetch all users and authors");
      
      // Get all users from the database without any filters
      const users = await UserAuthor.find({}).lean();
      
      // Log the number of users found for debugging
      console.log(`Found ${users.length} users in the database`);
      
      // Return the users array even if empty
      return res.status(200).json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      return res.status(500).json({ message: "Error fetching users and authors", error: error.message });
    }
  })
);

// Enable or disable a user/author (requires authentication)
adminApp.put(
  "/update-status/:email",
  requireAuth(),
  expressAsyncHandler(async (req, res) => {
    try {
      const { email } = req.params;
      const { isActive } = req.body;

      console.log(`Updating status for user ${email} to ${isActive}`);

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
      console.error("Error updating user status:", error);
      res.status(500).json({ message: "Error updating user status", error: error.message });
    }
  })
);

// Route to handle unauthorized access attempts
adminApp.get("/unauthorized", (req, res) => {
  res.status(401).json({ message: "Unauthorized request" });
});

// Add a utility route to create an initial admin user if none exists
adminApp.post(
  "/initialize-admin",
  expressAsyncHandler(async (req, res) => {
    try {
      const { email, name, clerkUserId } = req.body;
      
      if (!email || !name || !clerkUserId) {
        return res.status(400).json({ message: "Email, name and clerkUserId are required" });
      }
      
      // Check if admin already exists
      const existingAdmin = await UserAuthor.findOne({ email });
      
      if (existingAdmin) {
        return res.status(200).json({ 
          message: "Admin already exists", 
          user: existingAdmin 
        });
      }
      
      // Create new admin
      const newAdmin = new UserAuthor({
        name,
        email,
        role: "admin",
        isActive: true,
        clerkUserId
      });
      
      const savedAdmin = await newAdmin.save();
      
      res.status(201).json({
        message: "Admin user created successfully",
        user: savedAdmin
      });
    } catch (error) {
      console.error("Error creating admin:", error);
      res.status(500).json({ message: "Error creating admin user", error: error.message });
    }
  })
);

// Add this to debug authentication issues
adminApp.get(
  "/check-auth",
  requireAuth(),
  (req, res) => {
    res.status(200).json({
      message: "Authentication successful",
      userId: req.auth.userId,
      sessionId: req.auth.sessionId
    });
  }
);

module.exports = adminApp;