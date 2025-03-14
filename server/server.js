const exp = require("express");
const app = exp();
require("dotenv").config();
const mongoose = require("mongoose");
const userApp = require("./APIs/userApi");
const authorApp = require("./APIs/authorApi");
const adminApp = require("./APIs/adminApi");
const cors = require("cors");

// CORS Configuration
const corsOptions = {
  origin: "https://draft-blogapp.vercel.app", // Allow only your frontend
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Handle preflight requests

app.use(exp.json());

// Database connection
console.log("DBURL from env:", process.env.DBURL);
mongoose
  .connect(process.env.DBURL)
  .then(() => console.log("Database connection successful"))
  .catch((err) => console.log("Database connection failed: ", err));

// API routes
app.use("/user-api", userApp);
app.use("/author-api", authorApp);
app.use("/admin-api", adminApp);

// Middleware to manually set CORS headers (if needed)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://draft-blogapp.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});
  
// Global error handling middleware
app.use((err, req, res, next) => {
  console.log("Error encountered:", err);
  res.status(500).send({ message: err.message });
});

// Export the Express app for Vercel
module.exports = app;
