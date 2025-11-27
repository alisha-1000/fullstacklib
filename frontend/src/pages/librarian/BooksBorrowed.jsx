import React, { useEffect, useState } from "react";
import axios from "axios";
import { Server_URL } from "../../utils/config";

export default function BooksBorrowed() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBorrowed = async () => {
    try {
      const url = Server_URL + "librarian/borrowedbooks";

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });

      setData(res.data.borrowed || []);
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowed();
  }, []);

  const badge = (status) => {
    switch (status) {
      case "Issued":
        return <span className="badge bg-success">Issued</span>;
      case "Requested Return":
        return <span className="badge bg-warning text-dark">Requested Return</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const safeDate = (d) => {
    if (!d) return "N/A";
    return new Date(d).toLocaleDateString();
  };

  return (
    <div className="container mt-5 mb-5">
      <h3 className="mb-4">
        📘 <b>Books Borrowed</b>
      </h3>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : data.length === 0 ? (
        <div className="alert alert-info text-center">No borrowed books</div>
      ) : (
        <div className="table-responsive shadow rounded">
          <table className="table table-bordered table-hover">
            <thead className="table-primary text-center">
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
              {data.map((item, index) => (
                <tr key={index} className="text-center align-middle">
                  <td>{index + 1}</td>
                  <td>{item.bookId?.title || "N/A"}</td>
                  <td>{item.userId?.name || "N/A"}</td>
                  <td>{item.userId?.email || "N/A"}</td>
                  <td>{safeDate(item.issueDate)}</td>
                  <td>{safeDate(item.dueDate)}</td>
                  <td>{badge(item.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
