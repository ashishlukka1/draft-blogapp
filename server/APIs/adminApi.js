const exp = require("express");
const adminApp = exp.Router();
const UserAuthor = require("../models/userAuthorModel");
const expressAsyncHandler = require("express-async-handler");
const { requireAuth, clerkMiddleware } = require("@clerk/express");
require("dotenv").config();

adminApp.use(exp.json());

// Get all users and authors (requires authentication)
adminApp.get(
  "/users-authors",
  requireAuth({ signInUrl: "unauthorized" }),
  expressAsyncHandler(async (req, res) => {
    try {
      const users = await UserAuthor.find();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Error fetching users and authors" });
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
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ 
        message: `User ${isActive ? "enabled" : "disabled"} successfully`, 
        user 
      });
    } catch (error) {
      res.status(500).json({ error: "Error updating user status" });
    }
  })
);

// Route to handle unauthorized access attempts
adminApp.get("/unauthorized", (req, res) => {
  res.send({ message: "Unauthorized request" });
});

module.exports = adminApp;