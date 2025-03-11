const UserAuthor = require("../models/userAuthorModel");

// Function to create a new User or Author
async function createUserOrAuthor(req, res) {
  // Extract user or author details from the request body
  const newUserAuthor = req.body;

  // Check if a user with the same email already exists in the database
  const userInDb = await UserAuthor.findOne({ email: newUserAuthor.email });

  // If the user or author already exists
  if (userInDb !== null) {
    // Verify if the provided role matches the existing user's role
    if (newUserAuthor.role === userInDb.role) {
      // Send response confirming the existing user with the correct role
      res.status(200).send({ message: newUserAuthor.role, payload: userInDb });
    } else {
      // Send response indicating an invalid role mismatch
      res.status(200).send({ message: "Invalid role" });
    }
  } else {
    // If the user does not exist, create a new user/author
    let newUser = new UserAuthor(newUserAuthor);
    let newUserOrAuthorDoc = await newUser.save();

    // Send response confirming the creation of a new user/author
    res
      .status(201)
      .send({ message: newUserOrAuthorDoc.role, payload: newUserOrAuthorDoc });
  }
}

// Export the function for use in other modules
module.exports = createUserOrAuthor;
