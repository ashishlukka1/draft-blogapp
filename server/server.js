const exp = require("express");
const app = exp();
require("dotenv").config();
const mongoose = require("mongoose");
const userApp = require("./APIs/userApi");
const authorApp = require("./APIs/authorApi");
const adminApp = require("./APIs/adminApi");
const cors = require("cors");
const port = process.env.PORT || 3000;

// Updated CORS Configuration to allow both local and deployed origins
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://draft-blogapp.vercel.app",
    // Add any other frontend domains that need access
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  exposedHeaders: ['Access-Control-Allow-Origin']
};

app.use(cors(corsOptions));

// Add preflight options handling for complex requests
app.options('*', cors(corsOptions));

// Body parser middleware
app.use(exp.json());

// Database connection
mongoose
  .connect(process.env.DBURL)
  .then(() => {
    app.listen(port, () => console.log(`Server listening on port ${port}...`));
    console.log("Database connection successful");
  })
  .catch((err) => console.log("Error in DB connection: ", err));

// API routes
app.use("/user-api", userApp);
app.use("/author-api", authorApp);
app.use("/admin-api", adminApp);

// Global error handling middleware
app.use((err, req, res, next) => {
  console.log("Error encountered:", err);
  res.status(500).send({ message: err.message });
});

// No need to export the app when running locally
module.exports = app;