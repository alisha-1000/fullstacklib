const express = require("express");
const router = express.Router();

const { booksController } = require("../controller/books");
const { userAuth } = require("../middlewares/userAuth");
const { checkRole } = require("../middlewares/checkRole");

// ADD NEW BOOK (only admin or librarian)
router.post(
  "/add",
  userAuth,
  checkRole(["admin", "librarian"]),
  booksController.addNewBook
);

// GET ALL BOOKS (dashboard + home)
router.get("/", booksController.getAllBooks);

// GET LATEST BOOKS
router.get("/new", booksController.getLatestBooks);

// GET A PARTICULAR BOOK
router.get("/:id", booksController.getParticularBook);

// UPDATE BOOK
router.put(
  "/update/:id",
  userAuth,
  checkRole(["admin", "librarian"]),
  booksController.updateBook
);

// DELETE BOOK
router.delete(
  "/delete/:id",
  userAuth,
  checkRole(["admin", "librarian"]),
  booksController.deleteBook
);

// STUDENT — REQUEST ISSUE
router.post(
  "/req-issue/:bookid",
  userAuth,
  checkRole("student"),
  booksController.reqIssueBook
);

// STUDENT — VIEW ISSUED BOOKS
router.get(
  "/issued",
  userAuth,
  checkRole("student"),
  booksController.getIssuedBooks
);

// STUDENT — REQUEST RETURN
router.put(
  "/request-return/:id",
  userAuth,
  checkRole("student"),
  booksController.requestReturnBook
);

// ADMIN — DIRECT RETURN APPROVAL (rarely used)
router.put(
  "/return/:id",
  userAuth,
  checkRole(["admin"]),
  booksController.returnBook
);

// APPROVE ISSUE REQUEST (rarely used)
router.put(
  "/approve/:requestId",
  userAuth,
  checkRole(["admin", "librarian"]),
  booksController.approveIssue
);

module.exports = router;
