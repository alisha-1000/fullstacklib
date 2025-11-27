import React, { useEffect, useState } from "react";
import axios from "axios";
import { Server_URL } from "../../utils/config";
import { showErrorToast, showSuccessToast } from "../../utils/toasthelper";

export default function ReturnRequest() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("authToken");
  const role = localStorage.getItem("role");

  // FETCH REQUESTS
  const fetchRequests = async () => {
    try {
      const url = Server_URL + "librarian/returnrequest";

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRequests(res.data.requests || []);
    } catch (err) {
      console.error("Fetch error:", err);
      showErrorToast("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // APPROVE REQUEST
  const approveRequest = async (id) => {
    try {
      const url = Server_URL + `librarian/approvereturnrequest/${id}`;

      const res = await axios.put(
        url,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showSuccessToast(res.data.message || "Request approved!");
      fetchRequests();
    } catch (err) {
      showErrorToast(
        err.response?.data?.message || "Failed to approve request"
      );
    }
  };

  // REJECT REQUEST
  const rejectRequest = async (id) => {
    try {
      const url = Server_URL + `librarian/rejectreturn/${id}`;

      const res = await axios.put(
        url,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showSuccessToast(res.data.message || "Request rejected!");
      fetchRequests();
    } catch (err) {
      showErrorToast("Failed to reject request");
    }
  };

  // STATUS BADGE
  const statusBadge = (status) => {
    const s = status?.toLowerCase();
    const map = {
      pending: "bg-warning",
      approved: "bg-success",
      rejected: "bg-danger",
      overdue: "bg-dark",
    };
    return <span className={`badge ${map[s] || "bg-secondary"}`}>{status}</span>;
  };

  // SAFE DATE FUNCTION
  const safeDate = (date) => {
    const d = new Date(date);
    return isNaN(d.getTime()) ? "N/A" : d.toLocaleDateString();
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">📚 Return Book Requests</h2>

      {/* LOADING */}
      {loading && (
        <div className="text-center py-4">
          <div className="spinner-border text-primary"></div>
          <p className="mt-2">Loading return requests...</p>
        </div>
      )}

      {/* EMPTY */}
      {!loading && requests.length === 0 && (
        <div className="alert alert-info text-center">
          No pending return requests.
        </div>
      )}

      {/* TABLE */}
      {!loading && requests.length > 0 && (
        <div className="table-responsive">
          <table className="table table-bordered table-hover shadow-sm">
            <thead className="table-primary text-center">
              <tr>
                <th>User Name</th>
                <th>Book Title</th>
                <th>Issued On</th>
                <th>Due Date</th>
                <th>Fine</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((req) => (
                <tr key={req._id}>
                  <td>{req.userId?.name || "N/A"}</td>
                  <td>{req.bookId?.title || "N/A"}</td>
                  <td>{safeDate(req.issueDate)}</td>
                  <td>{safeDate(req.dueDate)}</td>
                  <td>₹{req.fine ?? 0}</td>

                  <td className="text-center">{statusBadge(req.status)}</td>

                  <td className="text-center">
                    {/* Only librarian can approve/reject */}
                    {role === "librarian" && (
                      <>
                        <button
                          className="btn btn-success btn-sm me-2"
                          onClick={() => approveRequest(req._id)}
                        >
                          ✔ Approve
                        </button>

                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => rejectRequest(req._id)}
                        >
                          ✘ Reject
                        </button>
                      </>
                    )}

                    {/* Admin can view but cannot approve */}
                    {role === "admin" && (
                      <span className="text-muted">View Only</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
