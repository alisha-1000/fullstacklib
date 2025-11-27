const { BorrowModel } = require("../model/BorrowModel");
const { BookModel } = require("../model/BookModel");

const librarianController = {};

/* ======================================================
   📘 1. BOOK ISSUED LIST (Admin + Librarian)
====================================================== */
librarianController.bookIssued = async (req, res) => {
  try {
    const issued = await BorrowModel.find({
      status: { $in: ["Issued", "Requested Return"] }
    })
      .populate("bookId")
      .populate("userId")
      .sort({ issueDate: -1 });

    res.json({ error: false, issued });
  } catch (error) {
    console.log("BOOK ISSUED ERROR:", error);
    res.status(500).json({ error: true, message: "Server Error" });
  }
};

/* ======================================================
   📗 2. ISSUE REQUEST LIST
====================================================== */
librarianController.issueRequest = async (req, res) => {
  try {
    const requests = await BorrowModel.find({ status: "Requested" })
      .populate("bookId")
      .populate("userId");

    res.json({ error: false, requests });
  } catch (error) {
    console.log("ISSUE REQUEST ERROR:", error);
    res.status(500).json({ error: true, message: "Server Error" });
  }
};

/* ======================================================
   📕 3. RETURN REQUEST LIST
====================================================== */
librarianController.returnRequest = async (req, res) => {
  try {
    const requests = await BorrowModel.find({
      status: "Requested Return"
    })
      .populate("bookId")
      .populate("userId");

    res.json({ error: false, requests });
  } catch (error) {
    console.log("RETURN REQUEST ERROR:", error);
    res.status(500).json({ error: true, message: "Server Error" });
  }
};

/* ======================================================
   ✔ 4. APPROVE ISSUE REQUEST
====================================================== */
librarianController.approveRequest = async (req, res) => {
  try {
    const request = await BorrowModel.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Not found" });

    if (request.status !== "Requested") {
      return res.status(400).json({ message: "Already processed" });
    }

    request.status = "Issued";
    request.approvedBy = req.userInfo.id;
    request.issueDate = new Date();
    request.dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    await request.save();

    await BookModel.findByIdAndUpdate(request.bookId, {
      $inc: { availableCopies: -1 }
    });

    res.json({ message: "Issue request approved" });
  } catch (error) {
    console.log("APPROVE REQUEST ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ======================================================
   ✔ 5. APPROVE RETURN REQUEST
====================================================== */
librarianController.approveReturnRequest = async (req, res) => {
  try {
    const request = await BorrowModel.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Not found" });

    if (request.status !== "Requested Return") {
      return res.status(400).json({
        message: "Only return requests can be approved"
      });
    }

    request.status = "Returned";
    request.returnDate = new Date();
    request.approvedBy = req.userInfo.id;

    await request.save();

    await BookModel.findByIdAndUpdate(request.bookId, {
      $inc: { availableCopies: +1 }
    });

    res.json({ message: "Book return approved" });
  } catch (error) {
    console.log("APPROVE RETURN ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ======================================================
   ✖ 6. REJECT RETURN REQUEST
====================================================== */
librarianController.rejectReturnRequest = async (req, res) => {
  try {
    const request = await BorrowModel.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Not found" });

    if (request.status !== "Requested Return") {
      return res.status(400).json({
        message: "Cannot reject, invalid status"
      });
    }

    request.status = "Issued";
    await request.save();

    res.json({ message: "Return request rejected" });
  } catch (error) {
    console.log("REJECT RETURN ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ======================================================
   📙 7. BORROWED BOOKS LIST
====================================================== */
librarianController.borrowedBooks = async (req, res) => {
  try {
    const borrowed = await BorrowModel.find({
      status: { $in: ["Issued", "Requested Return"] }
    })
      .populate("bookId")
      .populate("userId")
      .sort({ issueDate: -1 });

    res.json({ error: false, borrowed });
  } catch (error) {
    console.log("BORROWED BOOKS ERROR:", error);
    res.status(500).json({ error: true, message: "Server Error" });
  }
};

module.exports = { librarianController };
