require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// Connect DB
connectDB();

// Middlewares
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

app.use("/admin", require("./routes/admin"));
app.use("/api", require("./routes/borrow"));



// ROUTES
app.use("/home", require("./routes/home"));
app.use("/users", require("./routes/user"));
   // 🔥 REQUIRED
app.use("/books", require("./routes/books"));    // 🔥 REQUIRED

// Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log("Server running on PORT", PORT));
