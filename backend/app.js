const express = require("express");
const cors = require("cors");
require("dotenv").config();

const users = require("./routes/user");
const books = require("./routes/books");
const admin = require("./routes/admin");
const librarian = require("./routes/librarian");
const home = require("./routes/home");

const app = express();

// Parse environment CORS origins (comma-separated list)
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",")
  : ["http://localhost:5173"];  // fallback

app.use(express.json());

// Dynamic CORS Handler
 app.use(
  cors({
    origin(origin, callback) {
      // Allow server-to-server, Postman, curl, etc.
      if (!origin) return callback(null, true);

      // Allow ALL localhost ports
      if (origin.startsWith("http://localhost")) {
        return callback(null, true);
      }

      // Allow origins defined in .env (production)
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("❌ Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Handle OPTIONS preflight correctly
app.options("*", cors());

app.use("/users", users);
app.use("/books", books);
app.use("/admin", admin);
app.use("/librarian", librarian);
app.use("/home", home);

app.get("/", (req, res) => {
  res.send("API is running...");
});

module.exports = app;
