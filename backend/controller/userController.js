const { UserModel } = require("../model/UserModel");
const { ContactModel } = require("../model/ContactModel");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OtpModel } = require("../model/OtpModel");

const JWT_SECRET = "12345@abcd12";

const userController = {};

// =======================================================================
// USER REGISTRATION (ROLE AUTO-DETECT)
// =======================================================================
userController.userRegistration = async (req, res) => {
  try {
    const { name, email, password, stream, year } = req.body;

    // Check if email exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Password hashing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Auto role assign based on email domain
    let role = "student";
    if (email.endsWith("@admin.com")) role = "admin";
    else if (email.endsWith("@librarian.com")) role = "librarian";

    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword,
      stream: stream || null,
      year: year || null,
      role,
    });

    await newUser.save();

    return res.status(201).json({
      message: "User registered successfully",
      role,
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// =======================================================================
// LOGIN (ADMIN SECURITY + LIBRARIAN SUPPORT)
// =======================================================================
userController.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await UserModel.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    // Match password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    // Admin security
    if (email.endsWith("@admin.com") && user.role !== "admin") {
      return res.status(403).json({
        message: "You are not allowed to login as admin",
      });
    }

    // Librarian security
    if (email.endsWith("@librarian.com") && user.role !== "librarian") {
      return res.status(403).json({
        message: "You are not allowed to login as librarian",
      });
    }

    // JWT payload
    const payload = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });

    return res.json({
      message: "Login successful",
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// =======================================================================
// GET ALL USERS (FIXED student / librarian / admin counting)
// =======================================================================
userController.getUsers = async (req, res) => {
  try {
    const user = await UserModel.find({}, "-password");
    const totalUser = user.length;

    res.status(200).json({
      error: false,
      message: "Users fetched successfully",
      user,
      totalUser,
    });
  } catch (error) {
    console.error("GET USERS ERROR:", error);
    res.status(500).json({
      error: true,
      message: "Internal server error",
    });
  }
};

// =======================================================================
// USER PROFILE
// =======================================================================
userController.profile = async (req, res) => {
  try {
    const { id } = req.userInfo;

    const user = await UserModel.findById(id).select("-password");
    if (!user)
      return res.status(404).json({ error: true, message: "User not found" });

    return res.json({
      error: false,
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    console.error("PROFILE ERROR:", error);
    res.status(500).json({ error: true, message: "Internal server error" });
  }
};

// =======================================================================
// CONTACT FORM
// =======================================================================
userController.addContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message)
      return res.status(400).json({ error: "All fields required" });

    const newContact = new ContactModel({ name, email, subject, message });
    await newContact.save();

    res.status(200).json({
      success: true,
      message: "Message sent! We will contact you soon.",
    });
  } catch (error) {
    console.error("CONTACT ERROR:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// =======================================================================
// OTP / RESET PASSWORD (NO CHANGES)
// =======================================================================

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

userController.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await OtpModel.findOneAndUpdate(
      { email },
      { otp, createdAt: new Date() },
      { upsert: true, new: true }
    );

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP for Password Reset",
      html: `<p>Your OTP is <strong>${otp}</strong>. Valid for 10 minutes.</p>`,
    });

    res.json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

userController.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record = await OtpModel.findOne({ email });
    if (!record || record.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    const age = (Date.now() - record.createdAt) / (1000 * 60);
    if (age > 10) return res.status(400).json({ message: "OTP expired" });

    res.json({ message: "OTP verified" });
  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

userController.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await UserModel.findOneAndUpdate({ email }, { password: hashedPassword });
    await OtpModel.deleteOne({ email });

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { userController };
