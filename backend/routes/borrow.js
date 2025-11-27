const express = require("express");
const router = express.Router();
const { BorrowModel } = require("../model/BorrowModel");

// GET: borrowed books list
router.get("/borrowed-books", async (req, res) => {
  try {
    const borrowed = await BorrowModel.find({
      status: { $in: ["Issued", "Requested Return"] }
    })
      .populate("bookId")
      .populate("userId")
      .sort({ issueDate: -1 });

    res.status(200).json({
      error: false,
      borrowed,
    });
  } catch (error) {
    console.log("BORROW LIST ERROR:", error);
    res.status(500).json({
      error: true,
      message: "Server Error",
    });
  }
});

module.exports = router;

