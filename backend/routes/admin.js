const express = require("express");
const router = express.Router();
const { adminController } = require("../controller/admin");
const { userAuth } = require("../middlewares/userAuth");
const { checkRole } = require("../middlewares/checkRole");

// ADMIN LOGIN
router.post("/login", adminController.login);

// ADD LIBRARIAN (only admin)
router.post(
  "/addlibrarian",
  userAuth,
  checkRole(["admin"]),
  adminController.addLibrarian
);

module.exports = router;
