const exp = require("express");
const authorApp = exp.Router();
const expressAsyncHandler = require("express-async-handler");
const createUserOrAuthor = require("./createUserOrAuthor");
const Article = require("../models/articleModel");
const { requireAuth, clerkMiddleware } = require("@clerk/express");
require("dotenv").config();

// Route to create a new author
authorApp.post("/author", expressAsyncHandler(createUserOrAuthor));

// Route to create a new article
authorApp.post(
  "/article",
  expressAsyncHandler(async (req, res) => {
    // Extract the new article object from the request body
    const newArticleObj = req.body;
    const newArticle = new Article(newArticleObj);

    // Save the new article to the database
    const articleObj = await newArticle.save();

    // Send response confirming article creation
    res.status(201).send({ message: "article published", payload: articleObj });
  })
);

// Route to fetch all active articles (requires authentication)
authorApp.get(
  "/articles",
  requireAuth({ signInUrl: "unauthorized" }),
  expressAsyncHandler(async (req, res) => {
    // Retrieve all active articles from the database
    const listOfArticles = await Article.find({ isArticleActive: true });

    // Send response with the list of articles
    res.status(200).send({ message: "articles", payload: listOfArticles });
  })
);

// Route to handle unauthorized access attempts
authorApp.get("/unauthorized", (req, res) => {
  res.send({ message: "Unauthorized request" });
});

// Route to modify an existing article by its article ID (requires authentication)
authorApp.put(
  "/article/:articleId",
  requireAuth({ signInUrl: "unauthorized" }),
  expressAsyncHandler(async (req, res) => {
    // Extract modified article data from request body
    const modifiedArticle = req.body;

    // Update the article in the database using its ID
    const latestArticle = await Article.findByIdAndUpdate(
      modifiedArticle._id,
      { ...modifiedArticle },
      { returnOriginal: false }
    );

    // Send response confirming the article update
    res
      .status(200)
      .send({ message: "article modified", payload: latestArticle });
  })
);

// Route to soft delete or restore an article by its article ID
authorApp.put(
  "/articles/:articleId",
  expressAsyncHandler(async (req, res) => {
    // Extract modified article data from request body
    const modifiedArticle = req.body;

    // Update the article's active status in the database
    const latestArticle = await Article.findByIdAndUpdate(
      modifiedArticle._id,
      { ...modifiedArticle },
      { returnOriginal: false }
    );

    // Send response confirming the article deletion/restoration
    res
      .status(200)
      .send({ message: "article deleted or restored", payload: latestArticle });
  })
);

// Export the router module for use in the main application
module.exports = authorApp;
