const express = require("express");
const cors = require("cors");
require("dotenv").config();

const users = require("./routes/user");
const books = require("./routes/books");
const admin = require("./routes/admin");
const librarian = require("./routes/librarian");
const home = require("./routes/home");

const allowedOrigins = [
  "http://localhost:5173",
  "https://library-management-app-karan.vercel.app",
];

const app = express();

app.use(express.json());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use("/users", users);
app.use("/books", books);
app.use("/admin", admin);
app.use("/librarian", librarian);
app.use("/home", home);

app.get("/", (req, res) => {
  res.send("API is running...");
});

module.exports = app;

