const express = require("express");
const router = express.Router();

const booksController = require("../controller/books");
const { userAuth } = require("../middlewares/userAuth");
const { checkRole } = require("../middlewares/checkRole");
const { upload } = require("../utils/cloudConfig");

// ADD BOOK
router.post(
  "/add",
  userAuth,
  checkRole(["admin", "librarian"]),
  upload.single("coverImage"),
  booksController.addNewBook
);

// STUDENT VIEW ISSUED BOOKS
router.get("/issued", userAuth, checkRole(["student"]), booksController.getIssuedBooks);

// ALL BOOKS
router.get("/", booksController.getAllBooks);

// ISSUE REQUEST LIST (Admin + Librarian)
router.get(
  "/issuedrequest",
  userAuth,
  checkRole(["admin", "librarian"]),
  booksController.getIssuedRequest
);

// APPROVE ISSUE REQUEST (IMPORTANT → only ONE route!)
router.put(
  "/approve/:borrowId",
  userAuth,
  checkRole(["admin", "librarian"]),
  booksController.approveIssue
);

// NEW BOOKS
router.get("/new", booksController.getLatestBooks);

// DELETE BOOK
router.delete(
  "/delete/:id",
  userAuth,
  checkRole(["admin", "librarian"]),
  booksController.deleteBook
);

// UPDATE BOOK
router.put(
  "/update/:id",
  userAuth,
  checkRole(["admin", "librarian"]),
  booksController.updateBook
);

// STUDENT REQUEST ISSUE
router.post(
  "/borrow/request-issue/:bookid",
  userAuth,
  checkRole(["student"]),
  booksController.reqIssueBook
);

// STUDENT RETURN
router.put("/return/:id", userAuth, checkRole(["student"]), booksController.returnBook);

// STUDENT REQUEST RETURN
router.put(
  "/returnrequest/:id",
  userAuth,
  checkRole(["student"]),
  booksController.requestReturnBook
);

// LAST ROUTE
router.get("/:id", booksController.getParticularBook);

module.exports = router;
