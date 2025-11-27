const mongoose = require("mongoose");
const { BorrowSchema } = require("../schemas/BorrowSchema");

const BorrowModel = mongoose.model("Borrow", BorrowSchema);

module.exports = { BorrowModel };
