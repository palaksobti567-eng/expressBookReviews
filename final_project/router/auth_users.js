const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// true if this username is registered
const isValid = (username) => {
  return users.some(user => user.username === username);
};

// true if username and password match a registered user
const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

// Task 7: login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const accessToken = jwt.sign({ data: username }, "access", { expiresIn: 60 * 60 });
  req.session.authorization = { accessToken, username };
  return res.status(200).json({ message: "User successfully logged in" });
});

// Task 8: add or modify a review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found for this ISBN" });
  }
  if (!review) {
    return res.status(400).json({ message: "Review text is required as a query parameter" });
  }

  books[isbn].reviews[username] = review;
  return res.status(200).json({
    message: `Review for book ${isbn} added/updated successfully`,
    reviews: books[isbn].reviews
  });
});

// Task 9: delete your own review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found for this ISBN" });
  }
  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: "You have no review on this book" });
  }

  delete books[isbn].reviews[username];
  return res.status(200).json({
    message: `Review for book ${isbn} by ${username} deleted`,
    reviews: books[isbn].reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;