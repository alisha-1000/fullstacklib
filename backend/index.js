const mongoose = require("mongoose");
const app = require("./app");
require("dotenv").config();

const PORT = process.env.PORT || 5001;
const uri = process.env.MONGO_URI;

mongoose.connection.on("connected", () => {
  console.log("Connected to DB:", mongoose.connection.name);
});

async function startServer() {
  try {
    await mongoose.connect(uri);
    console.log("DB Connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
