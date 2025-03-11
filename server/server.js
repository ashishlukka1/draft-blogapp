const exp = require("express");
const app = exp();
require('dotenv').config();
const mongoose = require("mongoose");
const userApp = require("./APIs/userApi");
const authorApp = require("./APIs/authorApi");
const adminApp = require("./APIs/adminApi");
const cors = require('cors');

app.use(cors());

const port = process.env.PORT || 4000;

// Establish database connection
console.log("DBURL from env:", process.env.DBURL);
mongoose.connect(process.env.DBURL)
    .then(() => {
        app.listen(port, () => console.log(`Server is running on port ${port}...`));
        console.log("Database connection successful");
    })
    .catch(err => console.log("Database connection failed: ", err));

// Middleware for parsing JSON request bodies
app.use(exp.json());

// Register API routes
app.use('/user-api', userApp);  // Routes for user-related operations
app.use("/author-api", authorApp);  // Routes for author-related operations
app.use('/admin-api', adminApp);  // Routes for admin-related operations

// Global error handling middleware
app.use((err, req, res, next) => {
    console.log("Error encountered in Express error handler:", err);
    res.status(500).send({ message: err.message });
});

module.exports = app;
