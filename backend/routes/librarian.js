const express = require("express");
const router = express.Router();

const { librarianController } = require("../controller/librarian");
const { userAuth } = require("../middlewares/userAuth");
const { checkRole } = require("../middlewares/checkRole");

/* --------------------------------------------------
   ISSUE REQUEST LIST (Student requested issue)
-------------------------------------------------- */
router.get(
  "/issuerequest",
  userAuth,
  checkRole(["librarian", "admin"]),
  librarianController.issueRequest
);

/* --------------------------------------------------
   APPROVE ISSUE REQUEST
-------------------------------------------------- */
router.put(
  "/approverequest/:id",
  userAuth,
  checkRole(["librarian", "admin"]),
  librarianController.approveRequest
);

/* --------------------------------------------------
   RETURN REQUEST LIST
-------------------------------------------------- */
router.get(
  "/returnrequest",
  userAuth,
  checkRole(["librarian", "admin"]),
  librarianController.returnRequest
);

/* --------------------------------------------------
   APPROVE RETURN REQUEST
-------------------------------------------------- */
router.put(
  "/approvereturnrequest/:id",
  userAuth,
  checkRole(["librarian", "admin"]),
  librarianController.approveReturnRequest
);

/* --------------------------------------------------
   REJECT RETURN REQUEST
-------------------------------------------------- */
router.put(
  "/rejectreturn/:id",
  userAuth,
  checkRole(["librarian", "admin"]),
  librarianController.rejectReturnRequest
);

/* --------------------------------------------------
   BORROWED BOOKS
-------------------------------------------------- */
router.get(
  "/borrowedbooks",
  userAuth,
  checkRole(["librarian", "admin"]),
  librarianController.borrowedBooks
);

module.exports = router;
