import React, { useEffect, useState } from "react";
import axios from "axios";

function BooksBorrowed() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5001/borrow/borrowed-books") // ✅ Correct route
      .then((res) => {
        setData(res.data.borrowed || []);
      })
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  return (
    <div className="admin-container">
      <h2 className="page-title">Borrowed Books</h2>

      <table className="admin-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Book</th>
            <th>User</th>
            <th>Email</th>
            <th>Issue Date</th>
            <th>Due Date</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {data.length > 0 ? (
            data.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.bookId?.title}</td>
                <td>{item.userId?.name}</td>
                <td>{item.userId?.email}</td>
                <td>{new Date(item.issueDate).toLocaleDateString()}</td>
                <td>{new Date(item.dueDate).toLocaleDateString()}</td>
                <td>{item.status}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                No borrowed books found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default BooksBorrowed;
