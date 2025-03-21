const exp = require("express");
const app = exp();
require("dotenv").config();
const mongoose = require("mongoose");
const userApp = require("./APIs/userApi");
const authorApp = require("./APIs/authorApi");
const adminApp = require("./APIs/adminApi");
const cors = require("cors");
const port = process.env.PORT || 3000;

// CORS Configuration for local development
const corsOptions = {
  origin: "https://draft-blogapp.vercel.app", // Allow your local React app
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

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