const exp = require("express");
const app = exp();
require("dotenv").config();
const mongoose = require("mongoose");
const userApp = require("./APIs/userApi");
const authorApp = require("./APIs/authorApi");
const adminApp = require("./APIs/adminApi");
const cors = require("cors");
const port = process.env.PORT || 3000;

// CORS is handled by vercel.json headers, but we'll keep a basic configuration
// for local development and as a fallback
app.use(cors({
  origin: "https://draft-blogapp.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Body parser middleware
app.use(exp.json());

// Connect to database without starting a server (Vercel handles the serverless function)
mongoose
  .connect(process.env.DBURL)
  .then(() => {
    // In local development, start the server
    if (process.env.NODE_ENV !== 'production') {
      app.listen(port, () => console.log(`Server listening on port ${port}...`));
    }
    console.log("Database connection successful");
  })
  .catch((err) => console.log("Error in DB connection: ", err));

// Optional: Add a health check endpoint
app.get("/", (req, res) => {
  res.status(200).send({ message: "API is running" });
});

// API routes
app.use("/user-api", userApp);
app.use("/author-api", authorApp);
app.use("/admin-api", adminApp);

// Global error handling middleware
app.use((err, req, res, next) => {
  console.log("Error encountered:", err);
  res.status(500).send({ message: err.message });
});

// Export the Express app for Vercel serverless functions
module.exports = app;