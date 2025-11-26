const express = require("express");
const router = express.Router();
const { booksController } = require("../controller/books");
const { userAuth } = require("../middlewares/userAuth");
const { checkRole } = require("../middlewares/checkRole");

// ADD BOOK
router.post(
  "/add",
  userAuth,
  checkRole(["admin", "librarian"]),
  booksController.addNewBook
);

// STUDENT ISSUED BOOKS
router.get(
  "/issued",
  userAuth,
  checkRole(["student", "user"]),
  booksController.getIssuedBooks
);

// PUBLIC ROUTES
router.get("/issuedrequest", booksController.getIssuedRequest);
router.get("/new", booksController.getLatestBooks);
router.get("/", booksController.getAllBooks);

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
  checkRole(["student", "user"]),
  booksController.reqIssueBook
);

/* ============================================
   ADMIN/LIBRARIAN APPROVE RETURN ★ FIXED ORDER
=============================================== */
router.put(
  "/return/:id",
  userAuth,
  checkRole(["admin", "librarian"]),
  booksController.returnBook
);

/* ============================================
   STUDENT REQUEST RETURN
=============================================== */
router.put(
  "/returnrequest/:id",
  userAuth,
  checkRole(["student", "user"]),
  booksController.requestReturnBook
);

// ADMIN/LIBRARIAN APPROVE ISSUE
router.put(
  "/approve/:requestId",
  userAuth,
  checkRole(["admin", "librarian"]),
  booksController.approveIssue
);

// MUST BE LAST — dynamic route
router.get("/:id", booksController.getParticularBook);

module.exports = router;
