const mongoose = require("mongoose");


//create author schema
const authorDataSchema = new mongoose.Schema({
    nameOfAuthor: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    profileImageUrl: {
        type: String,

    }
}, { "strict": "throw" })

//create user comment schema
const userCommentSchema = new mongoose.Schema({
    nameOfUser: {
        type: String,
        required: true
    },
    comment: {
        type: String,
        required: true
    }
}, { "strict": "throw" })

//create Article schema
const atricleSchema = new mongoose.Schema({
    authorData: authorDataSchema,

    articleId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    dateOfCreation: {
        type: String,
        required: true
    },
    dateOfModification: {
        type: String,
        required: true
    },
    comments: [userCommentSchema],
    isArticleActive: {
        type: Boolean,
        required: true
    }



}, { "strict": "throw" })


//create model for article
const Article = mongoose.model('article', atricleSchema)

//export
module.exports = Article;