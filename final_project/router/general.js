const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (users.some(user => user.username === username)) {
    return res.status(409).json({ message: "Username already exists" });
  }
  users.push({ username, password });
  return res.status(201).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn], null, 4));
  }
  return res.status(404).json({ message: "Book not found for this ISBN" });
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author.toLowerCase();
  const matches = Object.keys(books)
    .filter(key => books[key].author.toLowerCase() === author)
    .map(key => ({ isbn: key, title: books[key].title, reviews: books[key].reviews }));
  if (matches.length > 0) {
    return res.status(200).send(JSON.stringify({ booksbyauthor: matches }, null, 4));
  }
  return res.status(404).json({ message: "No books found for this author" });
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title.toLowerCase();
  const matches = Object.keys(books)
    .filter(key => books[key].title.toLowerCase() === title)
    .map(key => ({ isbn: key, author: books[key].author, reviews: books[key].reviews }));
  if (matches.length > 0) {
    return res.status(200).send(JSON.stringify({ booksbytitle: matches }, null, 4));
  }
  return res.status(404).json({ message: "No book found for this title" });
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found for this ISBN" });
  }
  return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
});

module.exports.general = public_users;
```