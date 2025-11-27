import React, { useEffect, useState } from "react";
import axios from "axios";
import { Server_URL } from "../../utils/config";
import { showErrorToast, showSuccessToast } from "../../utils/toasthelper";

export default function ReturnRequest() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const url = Server_URL + "librarian/returnrequest";

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      setRequests(response.data.requests || []);
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const approve = async (id) => {
    try {
      const url = Server_URL + "librarian/approvereturnrequest/" + id;

      await axios.put(
        url,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
        }
      );

      showSuccessToast("Return Approved!");
      fetchRequests();
    } catch (err) {
      showErrorToast("Failed to approve request");
    }
  };

  const reject = async (id) => {
    try {
      const url = Server_URL + "librarian/rejectreturn/" + id;

      await axios.put(
        url,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
        }
      );

      showSuccessToast("Request Rejected");
      fetchRequests();
    } catch (err) {
      showErrorToast("Failed to reject");
    }
  };

  const badge = (status) => {
    switch (status) {
      case "Requested Return":
        return <span className="badge bg-warning text-dark">Requested Return</span>;
      case "Returned":
        return <span className="badge bg-success">Returned</span>;
      case "Issued":
        return <span className="badge bg-secondary">Issued</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const safeDate = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return isNaN(d.getTime()) ? "N/A" : d.toLocaleDateString();
  };

  // Calculate fine (same as backend)
  const calcFine = (dueDate) => {
    if (!dueDate) return 0;

    const today = new Date();
    const due = new Date(dueDate);

    if (today <= due) return 0;

    const diffDays = Math.ceil((today - due) / (1000 * 60 * 60 * 24));

    return diffDays * 5; // ₹5 per day rule
  };

  return (
    <div className="container mt-5 mb-5">
      <h3 className="mb-4">
        📚 <b>Return Request</b>
      </h3>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : requests.length === 0 ? (
        <div className="alert alert-info text-center">No return requests</div>
      ) : (
        <div className="table-responsive shadow rounded">
          <table className="table table-bordered table-hover">
            <thead className="table-primary text-center">
              <tr>
                <th>User</th>
                <th>Book</th>
                <th>Issued On</th>
                <th>Due Date</th>
                <th>Fine</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((req) => (
                <tr key={req._id} className="text-center align-middle">
                  <td>{req.userId?.name}</td>
                  <td>{req.bookId?.title}</td>
                  <td>{safeDate(req.issueDate)}</td>
                  <td>{safeDate(req.dueDate)}</td>
                  <td>₹{calcFine(req.dueDate)}</td>

                  <td>{badge(req.status)}</td>

                  <td>
                    {req.status === "Requested Return" ? (
                      <>
                        <button
                          className="btn btn-success btn-sm me-2"
                          onClick={() => approve(req._id)}
                        >
                          ✔ Approve
                        </button>

                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => reject(req._id)}
                        >
                          ✘ Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-muted">No actions</span>
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
