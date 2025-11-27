const booksController = {};
const { BookModel } = require("../model/BookModel");
const { BorrowModel } = require("../model/BorrowModel");
const cloudinary = require("cloudinary").v2;
const calculateFine = require("../utils/fineCalculator");
const { clearCache } = require("../utils/cache");

/* ======================================================
   ADD NEW BOOK
====================================================== */
booksController.addNewBook = async (req, res) => {
  try {
    const { title, author, category, isbn, totalCopies, price, description } = req.body;
    const { id } = req.userInfo;

    const existingBook = await BookModel.findOne({ isbn });
    if (existingBook) {
      return res.status(400).json({ error: true, message: "Book with this ISBN already exists" });
    }

    const newBook = new BookModel({
      title,
      author,
      category,
      isbn,
      availableCopies: totalCopies,
      totalCopies,
      addedBy: id,
      coverImage: req.file ? req.file.path : "",
      cloudinaryId: req.file ? req.file.filename : "",
      price,
      description,
    });

    await newBook.save();
    clearCache("homeData");

    res.status(201).json({
      error: false,
      message: "Book added successfully",
      book: newBook,
    });
  } catch (error) {
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

/* ======================================================
   GET ALL BOOKS
====================================================== */
booksController.getAllBooks = async (req, res) => {
  try {
    const books = await BookModel.find().populate("addedBy", "name email role");

    res.status(200).json({
      error: false,
      message: "Books fetched successfully",
      books,
      totalBooks: books.length,
    });
  } catch (error) {
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

/* ======================================================
   GET LATEST BOOKS
====================================================== */
booksController.getLatestBooks = async (req, res) => {
  try {
    const books = await BookModel.find()
      .populate("addedBy", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      error: false,
      message: "Latest books fetched successfully",
      books,
    });
  } catch (error) {
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

/* ======================================================
   GET SINGLE BOOK DETAILS
====================================================== */
booksController.getParticularBook = async (req, res) => {
  try {
    const book = await BookModel.findById(req.params.id).populate("addedBy", "name email role");

    if (!book) return res.status(404).json({ message: "Book not found" });

    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/* ======================================================
   UPDATE BOOK
====================================================== */
booksController.updateBook = async (req, res) => {
  try {
    const book = await BookModel.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!book) return res.status(404).json({ message: "Book not found" });

    clearCache("homeData");

    res.status(200).json({
      message: "Book updated successfully",
      book,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/* ======================================================
   DELETE BOOK
====================================================== */
booksController.deleteBook = async (req, res) => {
  try {
    const book = await BookModel.findById(req.params.id);

    if (!book) return res.status(404).json({ error: true, message: "Book not found" });

    if (book.cloudinaryId) {
      await cloudinary.uploader.destroy(book.cloudinaryId);
    }

    await BookModel.findByIdAndDelete(req.params.id);
    clearCache("homeData");

    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/* ======================================================
   STUDENT - REQUEST ISSUE
====================================================== */
booksController.reqIssueBook = async (req, res) => {
  try {
    const userId = req.userInfo.id;
    const { bookid } = req.params;

    const book = await BookModel.findById(bookid);
    if (!book) return res.status(404).json({ error: true, message: "Book not found" });

    if (book.availableCopies < 1)
      return res.status(400).json({ error: true, message: "No available copies" });

    const borrow = new BorrowModel({
      bookId: bookid,
      userId,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: "Requested",
    });

    await borrow.save();

    res.status(200).json({
      error: false,
      message: "Request submitted. Wait for approval.",
      borrow,
    });
  } catch {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/* ======================================================
   STUDENT - VIEW ISSUED BOOKS
====================================================== */
booksController.getIssuedBooks = async (req, res) => {
  try {
    const userId = req.userInfo.id;

    const issuedBooks = await BorrowModel.find({
      userId,
      status: { $in: ["Issued", "Requested Return"] },
    })
      .populate("bookId")
      .populate("userId");

    const booksWithFine = issuedBooks.map((b) => ({
      ...b.toObject(),
      fine: calculateFine(b.dueDate, b.returnDate),
    }));

    res.json({
      error: false,
      message: "Issued books fetched",
      issuedBooks: booksWithFine,
    });
  } catch {
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

/* ======================================================
   STUDENT - REQUEST RETURN
====================================================== */
booksController.requestReturnBook = async (req, res) => {
  try {
    const borrow = await BorrowModel.findById(req.params.id);

    if (!borrow) return res.status(404).json({ message: "Borrow record not found" });

    if (borrow.status !== "Issued")
      return res.status(400).json({ message: "Cannot request return" });

    borrow.status = "Requested Return";
    await borrow.save();

    res.json({ message: "Return request submitted" });
  } catch {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/* ======================================================
   ADMIN/LIBRARIAN - APPROVE ISSUE REQUEST
====================================================== */
booksController.approveIssue = async (req, res) => {
  try {
    const { borrowId } = req.params;

    const borrow = await BorrowModel.findById(borrowId);
    if (!borrow) return res.status(404).json({ error: true, message: "Borrow request not found" });

    if (borrow.status !== "Requested")
      return res.status(400).json({ error: true, message: "Already processed" });

    borrow.status = "Issued";
    borrow.issueDate = new Date();
    borrow.dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    borrow.approvedBy = req.userInfo.id;

    await borrow.save();

    await BookModel.findByIdAndUpdate(borrow.bookId, { $inc: { availableCopies: -1 } });

    res.json({ error: false, message: "Issue request approved successfully", borrow });
  } catch {
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

/* ======================================================
   GET REQUESTED ISSUE LIST (ADMIN + LIBRARIAN)
====================================================== */
booksController.getIssuedRequest = async (req, res) => {
  try {
    const requestedBooks = await BorrowModel.find({ status: "Requested" })
      .populate("bookId")
      .populate("userId")
      .sort({ issueDate: -1 });

    res.status(200).json({
      error: false,
      message: "Requested issue list fetched",
      requestedBooks,
      totalRequestedBooks: requestedBooks.length,
    });
  } catch {
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

booksController.returnBook = async (req, res) => {
  try {
    const borrow = await BorrowModel.findById(req.params.id);

    if (!borrow) {
      return res.status(404).json({ message: "Borrow record not found" });
    }

    if (borrow.status !== "Requested Return") {
      return res.status(400).json({ message: "Not eligible for return" });
    }

    borrow.status = "Returned";
    borrow.returnDate = new Date();
    borrow.approvedBy = req.userInfo.id;

    await borrow.save();

    // Increase book count
    await BookModel.findByIdAndUpdate(borrow.bookId, {
      $inc: { availableCopies: 1 },
    });

    res.json({ message: "Book returned successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


/* ======================================================
   EXPORT CONTROLLER
====================================================== */
module.exports = booksController;
