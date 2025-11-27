import React, { useEffect, useState } from "react";
import axios from "axios";
import { Server_URL } from "../../utils/config";
import "./profile.css";
import { getAuthToken } from "../../utils/auth";
import { showErrorToast, showSuccessToast } from "../../utils/toasthelper";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch profile data
  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${Server_URL}users/profile`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });

      setUser(response.data.user || null);
    } catch (error) {
      console.error("Error fetching profile:", error);
      showErrorToast("Failed to load profile");
    }
  };

  // Fetch issued books
  const fetchIssuedBooks = async () => {
    try {
      const response = await axios.get(`${Server_URL}books/issued`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });

      setIssuedBooks(response.data.issuedBooks || []);
    } catch (error) {
      console.error("Error fetching issued books:", error);
      showErrorToast("Unable to load issued books");
    }
  };

  // Return book
  const returnBook = async (borrowId) => {
    try {
      const response = await axios.put(
        `${Server_URL}books/returnrequest/${borrowId}`,
        {},
        { headers: { Authorization: `Bearer ${getAuthToken()}` } }
      );

      showSuccessToast(response.data.message);
      fetchIssuedBooks();
    } catch (error) {
      console.error("Error returning book:", error);
      showErrorToast(error.response?.data?.message || "Something went wrong!");
    }
  };

  // Load data on mount
  useEffect(() => {
    (async () => {
      await fetchProfile();
      await fetchIssuedBooks();
      setLoading(false);
    })();
  }, []);

  if (loading || !user)
    return <p className="loading text-center mt-5">Loading profile...</p>;

  return (
    <div className="profile-page">
      <div className="profile-container">

        {/* USER INFO */}
        <div className="profile-info">
          <img
            src="/images/default-avatar.png"
            alt="User Avatar"
            className="profile-avatar"
          />

          <h1>{user.name}</h1>

          <p>
            <strong>Email:</strong> {user.email}
          </p>

          <p>
            <strong>Role:</strong> {user.role}
          </p>

          <p>
            <strong>Total Books Issued:</strong> {issuedBooks.length}
          </p>
        </div>

        {/* ISSUED BOOKS */}
        <div className="issued-books">
          <h2>Issued Books</h2>

          {issuedBooks.length === 0 ? (
            <p>No books issued yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="profile-table">
                <thead>
                  <tr>
                    <th>Book Title</th>
                    <th>Issue Date</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Fine</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {issuedBooks.map((book) => (
                    <tr key={book._id}>
                      <td>{book.bookId?.title || "N/A"}</td>

                      <td>{new Date(book.issueDate).toLocaleDateString()}</td>

                      <td>{new Date(book.dueDate).toLocaleDateString()}</td>

                      <td>
                        <span
                          className={`status-badge ${
                            book.status === "Returned"
                              ? "returned"
                              : book.status === "Issued"
                              ? "issued"
                              : "pending"
                          }`}
                        >
                          {book.status}
                        </span>
                      </td>

                      <td>₹{book.fine || 0}</td>

                      <td>
                        {book.status === "Issued" ? (
                          <button
                            className="return-btn"
                            onClick={() => returnBook(book._id)}
                          >
                            Return Book
                          </button>
                        ) : (
                          <span className="text-success">✔ Returned</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

