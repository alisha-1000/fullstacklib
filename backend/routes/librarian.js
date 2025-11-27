const express = require("express");
const router = express.Router();

const { librarianController } = require("../controller/librarian");
const { userAuth } = require("../middlewares/userAuth");
const { checkRole } = require("../middlewares/checkRole");

// Book Issued List
router.get(
  "/bookissued",
  userAuth,
  checkRole(["admin", "librarian"]),
  librarianController.bookIssued
);

// Issue Request List
router.get(
  "/issuerequest",
  userAuth,
  checkRole("librarian"),
  librarianController.issueRequest
);

// Return Request List
router.get(
  "/returnrequest",
  userAuth,
  checkRole("librarian"),
  librarianController.returnRequest
);

// Approve Issue Request
router.put(
  "/approverequest/:id",
  userAuth,
  checkRole("librarian"),
  librarianController.approveRequest
);

// Approve Return Request
router.put(
  "/approvereturnrequest/:id",
  userAuth,
  checkRole("librarian"),
  librarianController.approveReturnRequest
);

// Reject Return Request  (REQUIRED FOR FRONTEND)
router.put(
  "/rejectreturn/:id",
  userAuth,
  checkRole("librarian"),
  librarianController.rejectReturnRequest
);

// Borrowed Books List (REQUIRED FOR ADMIN PANEL)
router.get(
  "/borrowedbooks",
  userAuth,
  checkRole(["admin", "librarian"]),
  librarianController.borrowedBooks
);

module.exports = router;
