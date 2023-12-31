const mongoose = require("mongoose");

//create publication schema

const AuthorSchema = mongoose.Schema(
    {
        id: Number,
        name: String,
        books: [String]
    }
);

const AuthorModel = mongoose.model("authors",AuthorSchema);

module.exports = AuthorModel;