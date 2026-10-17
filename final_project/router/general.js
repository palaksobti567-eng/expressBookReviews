const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

const BASE_URL = "http://localhost:5000";

// Our routes reply with a JSON string, so Axios may give back text. This turns it into an object.
const parse = (data) => (typeof data === "string" ? JSON.parse(data) : data);

// Sends a clean error to the user, keeping Axios's status code (e.g. 404) when there is one.
const sendError = (res, error) => {
  const status = error.response ? error.response.status : 500;
  const body = error.response ? parse(error.response.data) : { message: error.message };
  return res.status(status).json(body);
};
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
public_users.get('/async/books', async (req, res) => {
    try {
      const response = await axios.get(`${BASE_URL}/`);
      return res.status(200).send(JSON.stringify(parse(response.data), null, 4));
    } catch (error) {
      return sendError(res, error);
    }
  });
// Get book review
public_users.get('/async/isbn/:isbn', (req, res) => {
    axios.get(`${BASE_URL}/isbn/${req.params.isbn}`)
      .then(response => {
        return res.status(200).send(JSON.stringify(parse(response.data), null, 4));
      })
      .catch(error => sendError(res, error));
  });
public_users.get('/async/author/:author', async (req, res) => {
    try {
      const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(req.params.author)}`);
      return res.status(200).send(JSON.stringify(parse(response.data), null, 4));
    } catch (error) {
      return sendError(res, error);
    }
  });
public_users.get('/async/title/:title',async (req,res) =>{
    axios.get(`${BASE_URL}/title/${encodeURIComponent(req.params.title)}`)
    .then(response => {
      return res.status(200).send(JSON.stringify(parse(response.data), null, 4));
    })
    .catch(error => sendError(res, error));
})
module.exports.general = public_users;
```