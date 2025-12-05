require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// Connect DB
connectDB();

// Middlewares
app.use(cors());

app.use(express.json());

// -------------------- ROUTES --------------------

// Admin routes
app.use("/admin", require("./routes/admin"));

// Librarian routes (IMPORTANT)
app.use("/librarian", require("./routes/librarian"));

// Books routes
app.use("/books", require("./routes/books"));

app.get("/healthz", (req, res) => {
  res.status(200).send("OK");
});


// User routes
app.use("/users", require("./routes/user"));

// Home route
app.use("/home", require("./routes/home"));

// REMOVE THIS — NOT NEEDED
// app.use("/api", require("./routes/borrow"));
// ------------------------------------------------

// Server
const PORT = process.env.PORT || 5001;



app.listen(PORT,(error)=>{
  if(error){
    console.log(error)
  }
  console.log("server is running on port:5000")
})
// 
module.exports=app;
