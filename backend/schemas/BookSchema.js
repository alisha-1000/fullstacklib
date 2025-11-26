const { Schema } = require("mongoose");

const BookSchema = new Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    category: { type: String, required: true },
    isbn: { type: String, unique: true, required: true },
    description: { type: String, required: true },
    availableCopies: { type: Number, required: true },
    totalCopies: { type: Number, required: true },

    // NOT REQUIRED NOW
    addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },

    coverImage: { type: String },

    // NOT REQUIRED NOW
    cloudinaryId: { type: String, required: false },

    price: { type: Number },
    createdAt: { type: Date, default: Date.now }
});

module.exports = { BookSchema };
