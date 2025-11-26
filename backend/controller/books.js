const booksController = {};
const { BookModel } = require("../model/BookModel");
const { BorrowModel } = require("../model/BorrowModel");
const cloudinary = require("cloudinary").v2;
const calculateFine = require("../utils/fineCalculator");
const { clearCache } = require("../utils/cache");

/* ======================================================
   ADD NEW BOOK (Admin + Librarian)
====================================================== */
booksController.addNewBook = async (req, res) => {
  try {
    const {
      title,
      author,
      category,
      isbn,
      totalCopies,
      price,
      description
    } = req.body;

    const { id } = req.userInfo;

    const existingBook = await BookModel.findOne({ isbn });
    if (existingBook) {
      return res.status(400).json({
        error: true,
        message: "Book with this ISBN already exists"
      });
    }

    let coverImageUrl = null;
    let cloudinaryId = null;

    if (req.file) {
      coverImageUrl = req.file.path;
      cloudinaryId = req.file.filename;
    }

    const newBook = new BookModel({
      title,
      author,
      category,
      isbn,
      availableCopies: totalCopies,
      totalCopies,
      addedBy: id,
      price,
      description
    });

    if (coverImageUrl) newBook.coverImage = coverImageUrl;
    if (cloudinaryId) newBook.cloudinaryId = cloudinaryId;

    await newBook.save();
    clearCache("homeData");

    res.status(201).json({
      error: false,
      message: "Book added successfully",
      book: newBook
    });

  } catch (error) {
    console.error("Add Book Error:", error);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

/* ======================================================
   GET ALL BOOKS
====================================================== */
booksController.getAllBooks = async (req, res) => {
  try {
    const books = await BookModel.find().populate("addedBy", "name email role");

    if (!books.length)
      return res.json({ error: true, message: "No Books Found" });

    res.status(200).json({
      error: false,
      message: "Books fetched successfully",
      books,
      totalBooks: books.length
    });

  } catch (error) {
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

/* ======================================================
   GET ISSUED REQUESTS
====================================================== */
booksController.getIssuedRequest = async (req, res) => {
  try {
    const requestedBooks = await BorrowModel.find({ status: "Requested" });

    res.status(200).json({
      error: false,
      message: "Books fetched successfully",
      requestedBooks,
      totalRequestedBooks: requestedBooks.length
    });

  } catch (error) {
    res.status(500).json({ error: true, message: "Internal Server Error" });
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

    if (!books.length)
      return res.json({ error: true, message: "No Books Found" });

    const totalCategories = new Set(books.map(b => b.category)).size;

    const issuedBooks = await BorrowModel.find({
      bookId: { $in: books.map(b => b._id) },
      status: "Issued"
    }).populate("userId");

    const totalActiveStudents = new Set(
      issuedBooks.map(b => b.userId._id.toString())
    ).size;

    res.status(200).json({
      error: false,
      message: "Books fetched successfully",
      books,
      totalBooks: books.length,
      totalCategories,
      totalActiveStudents
    });

  } catch (error) {
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

/* ======================================================
   GET PARTICULAR BOOK
====================================================== */
booksController.getParticularBook = async (req, res) => {
  try {
    const book = await BookModel.findById(req.params.id)
      .populate("addedBy", "name email role");

    if (!book)
      return res.status(404).json({ message: "Book not found" });

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
    const {
      title,
      author,
      category,
      availableCopies,
      totalCopies,
      price,
      description
    } = req.body;

    const updatedBook = await BookModel.findByIdAndUpdate(
      req.params.id,
      { title, author, category, availableCopies, totalCopies, price, description },
      { new: true }
    );

    if (!updatedBook)
      return res.status(404).json({ message: "Book not found" });

    clearCache("homeData");

    res.status(200).json({
      message: "Book updated successfully",
      book: updatedBook
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

    if (!book)
      return res.status(404).json({ error: true, message: "Book not found" });

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
   REQUEST ISSUE BOOK (Student)
====================================================== */
booksController.reqIssueBook = async (req, res) => {
  try {
    const userId = req.userInfo.id;
    const { bookid } = req.params;

    const book = await BookModel.findById(bookid);
    if (!book)
      return res.status(404).json({ message: "Book not found" });

    if (book.availableCopies < 1)
      return res.status(400).json({ message: "No available copies" });

    const count = await BorrowModel.countDocuments({
      userId,
      status: { $in: ["Requested", "Issued"] }
    });

    if (count >= 4)
      return res.status(400).json({ message: "Limit of 4 books reached" });

    const existing = await BorrowModel.findOne({
      userId,
      bookId: bookid,
      status: { $in: ["Requested", "Issued"] }
    });

    if (existing)
      return res.status(400).json({ message: "Already requested/issued" });

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const borrow = new BorrowModel({
      bookId: bookid,
      userId,
      issueDate: new Date(),
      dueDate,
      status: "Requested"
    });

    await borrow.save();

    res.status(200).json({
      error: false,
      message: "Book request submitted",
      borrow
    });

  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/* ======================================================
   GET ISSUED BOOKS (Student)
====================================================== */
booksController.getIssuedBooks = async (req, res) => {
  try {
    const userId = req.userInfo.id;

    const issuedBooks = await BorrowModel.find({
      userId,
      returnDate: null,
      status: { $in: ["Issued", "Requested Return"] }
    })
      .populate("bookId", "title author category isbn price coverImage")
      .populate("userId", "name email role")
      .sort({ issueDate: -1 });

    const booksWithFine = issuedBooks.map(book => ({
      ...book.toObject(),
      fine: calculateFine(book.dueDate, book.returnDate)
    }));

    res.json({
      error: false,
      message: "Issued books fetched",
      issuedBooks: booksWithFine
    });

  } catch (error) {
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

/* ======================================================
   REQUEST RETURN (Student)
====================================================== */
booksController.requestReturnBook = async (req, res) => {
  try {
    const borrow = await BorrowModel.findById(req.params.id);

    if (!borrow)
      return res.status(404).json({ message: "Borrow record not found" });

    if (borrow.userId.toString() !== req.userInfo.id.toString())
      return res.status(403).json({ message: "Unauthorized" });

    if (borrow.status !== "Issued")
      return res.status(400).json({
        message: "Only issued books can be requested for return"
      });

    borrow.status = "Requested Return";
    await borrow.save();

    res.status(200).json({ message: "Return request submitted" });

  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/* ======================================================
   RETURN BOOK (Admin + Librarian)
====================================================== */
booksController.returnBook = async (req, res) => {
  try {
    const borrow = await BorrowModel.findById(req.params.id);

    if (!borrow)
      return res.status(404).json({ message: "Borrow record not found" });

    // IMPORTANT — status check
    if (borrow.status !== "Requested Return") {
      return res.status(400).json({
        error: true,
        message: "Return can only be approved when status is 'Requested Return'"
      });
    }

    borrow.status = "Returned";
    borrow.returnDate = new Date();
    borrow.approvedBy = req.userInfo.id;
    await borrow.save();

    await BookModel.findByIdAndUpdate(borrow.bookId, {
      $inc: { availableCopies: 1 }
    });

    res.json({ error: false, message: "Book returned successfully" });

  } catch (error) {
    console.error("Return error:", error);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

/* ======================================================
   APPROVE ISSUE REQUEST (Admin + Librarian)
====================================================== */
booksController.approveIssue = async (req, res) => {
  try {
    const requestId = req.params.requestId;

    const request = await BorrowModel.findById(requestId);
    if (!request)
      return res.status(404).json({ error: true, message: "Request not found" });

    if (request.status !== "Requested")
      return res.status(400).json({
        error: true,
        message: "Request already approved or invalid"
      });

    request.status = "Issued";
    request.approvedBy = req.userInfo.id;
    await request.save();

    await BookModel.findByIdAndUpdate(request.bookId, {
      $inc: { availableCopies: -1 }
    });

    res.json({
      error: false,
      message: "Issue request approved",
      request
    });

  } catch (err) {
    console.error("Approve Issue Error:", err);
    res.status(500).json({ error: true, message: "Server Error" });
  }
};

module.exports = { booksController };
