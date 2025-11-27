const { Schema } = require("mongoose");

const BorrowSchema = new Schema(
  {
    bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    issueDate: { type: Date, default: null },
    dueDate: { type: Date, default: null },
    returnDate: { type: Date, default: null },
    fineAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Requested", "Issued", "Requested Return", "Returned"],
      default: "Requested"
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User", default: null }
  },
  { timestamps: true }
);

module.exports = { BorrowSchema };
