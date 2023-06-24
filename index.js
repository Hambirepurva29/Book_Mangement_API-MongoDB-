require('dotenv').config();

const express = require("express");
const mongoose = require("mongoose");
var bodyParser = require("body-parser");
//database
const database = require("./database/database");

//Model
const BookModel = require("./database/book");
const AuthorModel = require("./database/author");
const PublicationModel = require("./database/publication");

//Initialization
const booky = express();

booky.use(bodyParser.urlencoded({extended: true}));  
booky.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URL).then(() => console.log("Connection eastiblished"));

/***********GET***********/
/*
Route          /
Description    Get all the books
Access         PUBLIC
Parameter      NONE
Methods        GET
*/
booky.get("/",async (req,res) => {
    const getAllBooks = await BookModel.find(); 
    return res.json(getAllBooks);
});
     
/*
Route          /is
Description    Get specific book on ISBN
Access         PUBLIC
Parameter      isbn
Methods        GET
*/
booky.get("/is/:isbn",async (req,res) => {

    const getSpecificBook = await BookModel.findOne({ISBN: req.params.isbn});
//Mongo db is not a logical language
//It understands only null
    if (!getSpecificBook) {
        return res.json({error: `No book found for the ISBN ${req.params.isbn}`});
    }
    return res.json({book: getSpecificBook});
});

/*
Route          /c
Description    Get specific book on category
Access         PUBLIC
Parameter      category
Methods        GET
*/
booky.get("/c/:category",async (req,res) => {
    const getSpecificBook = await BookModel.findOne({category: req.params.category});
    
    if (!getSpecificBook) {
        return res.json({error: `Nobook found for following category ${req.params.category}`});
    }

    return res.json({book: getSpecificBook});
});

/*
Route          /c
Description    Get specific book on category
Access         PUBLIC
Parameter      language
Methods        GET
*/
booky.get("/lang/:language",(req,res) => {
    const getSpecificBook = database.books.filter(
        (book) => book.language == req.params.language
    );

    if (getSpecificBook.length === 0) {
        return res.json({error: `No book found for the ISBN ${req.params.language}`});
    }
    return res.json({book: getSpecificBook});
});

/*
Route          /author
Description    Get all the authors
Access         PUBLIC
Parameter      NONE
Methods        GET
*/
booky.get("/author",async (req,res) => {
    const getAllAuthors = await AuthorModel.find(); 
    return res.json(getAllAuthors);
});

/*
Route            /author/id
Description    Get a list of authors based on books
Access         PUBLIC
Parameter      id
Methods        GET
*/
booky.get("/author/bookid/:id",(req,res) => {
    const getSpecificBook = database.author.filter(
        (author) => author.id == req.params.id
    );

    if (getSpecificBook.length === 0) {
        return res.json({error: `No author found for the book id ${req.params.id}`});
    }
    return res.json({book: getSpecificBook});
});

/*
Route          /author/id
Description    Get specific author
Access         PUBLIC
Parameter      isbn
Methods        GET
*/
booky.get("/author/book/:isbn",(req,res) => {
    const getSpecificBook = database.author.filter(
        (author) => author.books.includes(req.params.isbn)
    )

    if (getSpecificBook.length === 0) {
        return res.json({error: `No author found for the book id ${req.params.isbn}`});
    }
    return res.json({book: getSpecificBook});
});

/*
Route          /publications
Description    Get all publication 
Access         PUBLIC
Parameter      NONE
Methods        GET
*/

booky.get("/publications",async (req,res) => {
    const getAllPublications = await PublicationModel.find(); 
    return res.json(getAllPublications);
});

/*
Route          /publication/pubid
Description    Get specific publication 
Access         PUBLIC
Parameter      id
Methods        GET
*/
booky.get("/publication/pubid/:id",(req,res) => {
    const getSpecificBook = database.publication.filter(
        (publication) => publication.id == req.params.id
    );

    if (getSpecificBook.length === 0) {
        return res.json({error: `No author found for the book id ${req.params.id}`});
    }
    return res.json({book: getSpecificBook});
});

/*
Route          /publication/book
Description    Get a list of publicatiokn based on a book
Access         PUBLIC
Parameter      id
Methods        GET
*/
booky.get("/publication/book/:isbn",(req,res) => {
    const getSpecificBook = database.publication.filter(
        (publication) => publication.books.includes(req.params.isbn)
    )

    if (getSpecificBook.length === 0) {
        return res.json({error: `No author found for the book id ${req.params.isbn}`});
    }
    return res.json({book: getSpecificBook});
});


/***********POST*************/ 
/*
Route          /publication
Description    Add new book
Access         PUBLIC
Parameter      NONE
Methods        POST
*/
booky.post("/book/new",(req,res) => {
    const { newBook } = req.body;
    const addNewBook = BookModel.create(newBook);
    return res.json({
        books: addNewBook,
        message: "Book was added !!!"
    });
});

/*
Route          /author/new
Description    Add new author
Access         PUBLIC
Parameter      NONE
Methods        POST
*/
booky.post("/author/new",async (req,res) => {
    const { newAuthor }= req.body;
    const addNewAuthor = AuthorModel.create(newAuthor);
    return res.json({
        author: addNewAuthor,
        message: "New author is added successfully!!!"
    });
});

/*
Route          /publication/new
Description    Add new publication
Access         PUBLIC
Parameter      NONE
Methods        POST
*/
booky.post("/publication/new",(req,res) => {
    const newPublication = req.body;
    database.publication.push(newPublication);
    return res.json({updatedPublication: database.publication});
});

/********PUT*******/ 
/*
Route          /publication/update/book
Description    Update book on isbn
Access         PUBLIC
Parameter      isbn
Methods        PUT
*/
booky.put("/book/update/:isbn",async (req,res) => {
    const updatedBook =await BookModel.findOneAndUpdate(
        {
            ISBN: req.params.isbn
        },
        {
            title: req.body.bookTitle
        },
        {
            new: true
        }
    );
    return res.json({
        books: updatedBook
    });
}); 

/*
Route          /author/book/update/:
Description    Update /add new publication
Access         PUBLIC
Parameter      isbn
Methods        PUT
*/
booky.put("/author/book/update/:isbn",async (req,res) => {
    //Update book database
    const updatedBook =await BookModel.findOneAndUpdate(
        {
            ISBN: req.params.isbn
        },
        {
            $addToSet: {
                author  : req.body.newAuthor
            }
        },
        {
            new: true
        }
    );
    //Update author database 
    const updatedAuthor = await AuthorModel.findOneAndUpdate(
        {
            id: req.body.newAuthor
        },
        {
            $addToSet: {
                books: req.params.isbn
            }
        },
        {
            new: true
        }
    )
    
    return res.json({
        books: updatedBook,
        author: updatedAuthor,
        message: "Successfully added the author and updated the author.!!!"
    })
});








/*********DELETE*********/
/*
Route          /book/delete
Description    DELETE a book
Access         PUBLIC
Parameter      isbn
Methods        DELETE
*/
booky.delete("/book/delete/:isbn", async (req,res) => {
    const updatedBookDatabase = await BookModel.findOneAndDelete(
        { 
            ISBN: req.params.isbn
        }
    );
    return res.json({
        books: updatedBookDatabase
    });
});





















/*
Route          /book/delete
Description    DELETE a book
Access         PUBLIC
Parameter      isbn
Methods        DELETE
*/
booky.delete("/book/delete/:isbn",(req,res) => {
    const updatedBookDatabase = database.books.filter(
        (book) => book.ISBN !== req.params.isbn
    )
    database.books = updatedBookDatabase;

return res.json({books: database.books});
});

/*
Route          /book/delete
Description    DELETE a book
Access         PUBLIC
Parameter      isbn
Methods        DELETE
*/

booky.delete("/book/delete/author/:isbn/:authorId",(req,res) => {
    //UPDATE the book database 
    database.books.forEach( (book) => {
        if (book.ISBN === req.params.isbn) {
            const newAuthorList = book.author.filter(
                (eachAuthor) => eachAuthor !== parseInt(req.params.authorId)
            );
            book.author = newAuthorList;
            return;
        }
    });
    //UPDATE the author database
    database.author.forEach((eachAuthor) => {
        if(eachAuthor.id === parseInt(req.params.authorId)) {
            const newBookList = eachAuthor.books.filter(
                (eachBook) => eachBook !== req.params.isbn
            );
            eachAuthor.books = newBookList;
            return;
        }
    });

    return res.json({
            books: database.books,
            author: database.author,
            message: "Author was deleted!!!"
    });
});
booky.listen(3000,() => {
    console.log("Server is up and running");
}); 
 

