const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    stream: { type: String, default: null },
    year: { type: String, default: null },

    role: {
      type: String,
      enum: ["student", "librarian", "admin"],
      default: "student"   // ❗ FIXED — no "user"
    }
  },
  { timestamps: true }
);

const UserModel = mongoose.model("User", UserSchema);

module.exports = { UserModel };
