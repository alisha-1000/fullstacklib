const express = require("express");
const router = express.Router();

const { checkRole } = require("../middlewares/checkRole");
const { userAuth } = require("../middlewares/userAuth");

// FIXED IMPORT
const { userController } = require("../controller/userController");

// ======================
// User Routes
// ======================

// Get all users (public or admin use depending on your design)
router.get("/", userController.getUsers);

// Register new user
router.post("/register", userController.userRegistration);

// Login
router.post("/login", userController.login);

// User Profile (Protected)
router.get("/profile", userAuth, checkRole("user"), userController.profile);

// Contact Form
router.post("/contact", userController.addContact);

// Forgot Password
router.post("/forgot-password", userController.forgotPassword);

// Verify OTP
router.post("/verify-otp", userController.verifyOTP);

// Reset Password
router.post("/reset-password", userController.resetPassword);

module.exports = router;
