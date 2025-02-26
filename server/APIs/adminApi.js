const exp = require("express");
const adminApp = exp.Router();
const expressAsyncHandler = require("express-async-handler");
const UserAuthor = require("../models/userAuthorModel");
const { requireAuth } = require("@clerk/express");
require("dotenv").config();

// Route to create a new admin
adminApp.post(
  "/admin", 
  expressAsyncHandler(async (req, res) => {
    // Create admin using shared function
    const createUserOrAuthor = require("./createUserOrAuthor");
    await createUserOrAuthor(req, res);
  })
);

// Route to get all users and authors (admin only)
adminApp.get(
  "/users",
  requireAuth({ signInUrl: "unauthorized" }),
  expressAsyncHandler(async (req, res) => {
    try {
      // Verify the requester is an admin
      const adminEmail = req.auth.userId; // Using Clerk userId which contains email
      const admin = await UserAuthor.findOne({ email: adminEmail, role: "admin" });
      
      if (!admin) {
        return res.status(403).send({ message: "Access denied. Admin privileges required." });
      }
      
      // Get all users and authors
      const allUsers = await UserAuthor.find({ role: { $in: ["user", "author"] } });
      
      res.status(200).send({ message: "All users and authors", payload: allUsers });
    } catch (error) {
      res.status(500).send({ message: "Error fetching users", error: error.message });
    }
  })
);

// Route to enable/disable a user or author (admin only)
adminApp.put(
  "/users/:userId/status",
  requireAuth({ signInUrl: "unauthorized" }),
  expressAsyncHandler(async (req, res) => {
    try {
      // Verify the requester is an admin
      const adminEmail = req.auth.userId;
      const admin = await UserAuthor.findOne({ email: adminEmail, role: "admin" });
      
      if (!admin) {
        return res.status(403).send({ message: "Access denied. Admin privileges required." });
      }
      
      // Extract status from request body
      const { isActive } = req.body;
      
      if (typeof isActive !== "boolean") {
        return res.status(400).send({ message: "Invalid status. Must be a boolean value." });
      }
      
      // Update user status
      const updatedUser = await UserAuthor.findByIdAndUpdate(
        req.params.userId,
        { isActive: isActive },
        { new: true }
      );
      
      if (!updatedUser) {
        return res.status(404).send({ message: "User not found" });
      }
      
      const statusMessage = isActive ? "activated" : "blocked";
      
      res.status(200).send({ 
        message: `User ${statusMessage} successfully`, 
        payload: updatedUser 
      });
    } catch (error) {
      res.status(500).send({ message: "Error updating user status", error: error.message });
    }
  })
);

// Route to get admin dashboard data
adminApp.get(
  "/dashboard",
  requireAuth({ signInUrl: "unauthorized" }),
  expressAsyncHandler(async (req, res) => {
    try {
      // Verify the requester is an admin
      const adminEmail = req.auth.userId;
      const admin = await UserAuthor.findOne({ email: adminEmail, role: "admin" });
      
      if (!admin) {
        return res.status(403).send({ message: "Access denied. Admin privileges required." });
      }
      
      // Get counts for dashboard
      const userCount = await UserAuthor.countDocuments({ role: "user" });
      const authorCount = await UserAuthor.countDocuments({ role: "author" });
      const blockedCount = await UserAuthor.countDocuments({ 
        role: { $in: ["user", "author"] },
        isActive: false
      });
      
      res.status(200).send({ 
        message: "Dashboard data", 
        payload: {
          userCount,
          authorCount,
          blockedCount,
          totalCount: userCount + authorCount
        } 
      });
    } catch (error) {
      res.status(500).send({ message: "Error fetching dashboard data", error: error.message });
    }
  })
);

// Route to handle unauthorized access attempts
adminApp.get("/unauthorized", (req, res) => {
  res.status(401).send({ message: "Unauthorized request" });
});

module.exports = adminApp;