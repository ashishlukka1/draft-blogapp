const mongoose = require("mongoose");

//define User or Author schema
const userAuthorSchema = new mongoose.Schema({
    role: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
       // required: true
    },
    email: {
        type: String,
        required: true,
        unique:true
    },
    profileImageUrl: {
        type: String,

    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { "strict": "throw" })


//create model for user author schema
const UserAuthor = mongoose.model('userauthor', userAuthorSchema)

//export
module.exports = UserAuthor;