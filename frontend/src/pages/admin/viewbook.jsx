import { useState, useEffect } from "react";
import axios from "axios";
import { Server_URL } from "../../utils/config";
import { showErrorToast, showSuccessToast } from "../../utils/toasthelper";
import "./viewbook.css";

const ViewBooks = () => {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "",
    isbn: "",
    price: "",
    totalCopies: "",
    coverImage: null,
  });

  const categories = ["Fiction", "Non-fiction", "Science", "History"]; // FIXED SAFE OPTIONS

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await axios.get(Server_URL + "books", {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });
      setBooks(response.data.books);
    } catch (error) {
      console.error("Fetch Error:", error.response?.data?.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;

    try {
      await axios.delete(`${Server_URL}books/delete/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });
      showSuccessToast("Book deleted successfully!");
      fetchBooks();
    } catch (error) {
      showErrorToast("Failed to delete book!");
    }
  };

  const handleEdit = (book) => {
    setSelectedBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      category: book.category,
      isbn: book.isbn,
      price: book.price,
      totalCopies: book.totalCopies,
      coverImage: null,
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    if (e.target.name === "coverImage") {
      setFormData({ ...formData, coverImage: e.target.files[0] });
      return;
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      if (!selectedBook) return;

      const updatedData = new FormData();

      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== "")
          updatedData.append(key, formData[key]);
      });

      updatedData.append("id", selectedBook._id);

      await axios.put(
        `${Server_URL}books/update/${selectedBook._id}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      showSuccessToast("Book updated successfully!");
      setShowModal(false);
      fetchBooks();
    } catch (error) {
      showErrorToast(error.response?.data?.message || "Failed to update book!");
      console.log("Update Error:", error);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="admin-book-heading">📖 Manage Library Books</h2>

      <div className="row">
        {books.length > 0 ? (
          books.map((book) => (
            <div key={book._id} className="col-lg-3 col-md-4 col-sm-6 mb-4">
              <div className="card book-card">
                <div className="book-image-wrapper">
                  <img
                    src={book.coverImage || "https://via.placeholder.com/200"}
                    alt={book.title}
                    className="book-image"
                  />
                </div>

                <div className="card-body">
                  <h5 className="card-title">{book.title}</h5>
                  <p className="book-author">{book.author}</p>
                  <p className="book-category">📚 {book.category}</p>
                  <p className="book-isbn">🔢 ISBN: {book.isbn}</p>
                  <p className="book-price">💰 ₹{book.price}</p>
                </div>

                <div className="card-footer text-center">
                  <button
                    className="btn edit-btn me-2"
                    onClick={() => handleEdit(book)}
                  >
                    ✏ Edit
                  </button>
                  <button
                    className="btn delete-btn"
                    onClick={() => handleDelete(book._id)}
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <h5 className="text-center text-muted py-4">No books found.</h5>
        )}
      </div>

      {/* ------------------ EDIT MODAL ------------------ */}
      {showModal && selectedBook && (
        <div className="modal d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content shadow">

              <div className="modal-header bg-primary text-white">
                <h5>Edit Book</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>

              <div className="modal-body p-4">
                <form>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Title</label>
                    <input
                      type="text"
                      name="title"
                      className="form-control"
                      value={formData.title}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Author</label>
                    <input
                      type="text"
                      name="author"
                      className="form-control"
                      value={formData.author}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Category</label>
                    <select
                      name="category"
                      className="form-select"
                      value={formData.category}
                      onChange={handleChange}
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat, i) => (
                        <option key={i} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">ISBN</label>
                      <input
                        type="text"
                        name="isbn"
                        className="form-control"
                        value={formData.isbn}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">Price (₹)</label>
                      <input
                        type="number"
                        name="price"
                        className="form-control"
                        value={formData.price}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Total Copies</label>
                    <input
                      type="number"
                      name="totalCopies"
                      className="form-control"
                      value={formData.totalCopies}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Update Cover Image</label>
                    <input
                      type="file"
                      name="coverImage"
                      className="form-control"
                      onChange={handleChange}
                    />
                  </div>

                  {formData.coverImage && (
                    <img
                      src={URL.createObjectURL(formData.coverImage)}
                      alt="Preview"
                      className="img-preview mt-2"
                      style={{ width: "150px", borderRadius: "6px" }}
                    />
                  )}
                </form>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-success" onClick={handleUpdate}>
                  Update
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ViewBooks;
