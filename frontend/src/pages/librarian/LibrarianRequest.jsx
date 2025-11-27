import React, { useEffect, useState } from "react";
import axios from "axios";
import { Server_URL } from "../../utils/config";
import { showSuccessToast, showErrorToast } from "../../utils/toasthelper";

export default function LibrarianRequest() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const url = Server_URL + "librarian/issuerequest";

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
      });

      setRequests(res.data.requests || []);
      setLoading(false);
    } catch (err) {
      console.error("Fetch Error:", err);
      showErrorToast("Failed to load requests");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const approveRequest = async (id) => {
    try {
      const url = Server_URL + "librarian/approverequest/" + id;

      await axios.put(
        url,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } }
      );

      showSuccessToast("Approved Successfully");
      fetchRequests();
    } catch (err) {
      showErrorToast("Approval Failed");
    }
  };

  const badge = (status) => {
    if (status === "Requested")
      return <span className="badge bg-warning text-dark">Requested</span>;

    return <span className="badge bg-secondary">{status}</span>;
  };

  const safeDate = (date) => {
    if (!date) return "—";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString();
  };

  return (
    <div className="container mt-5 mb-5">
      <h3 className="mb-4">
        📚 <b>Pending Book Requests</b>
      </h3>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : requests.length === 0 ? (
        <div className="alert alert-info text-center">No pending requests</div>
      ) : (
        <div className="table-responsive shadow rounded">
          <table className="table table-bordered table-hover">
            <thead className="table-primary text-center">
              <tr>
                <th>User Name</th>
                <th>Book Title</th>
                <th>Requested On</th>
                <th>Current Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((req, index) => (
                <tr key={index} className="text-center align-middle">
                  <td>{req.userId?.name}</td>
                  <td>{req.bookId?.title}</td>
                  <td>{safeDate(req.issueDate)}</td>
                  <td>{badge(req.status)}</td>

                  <td>
                    <button
                      className="btn btn-success btn-sm px-3"
                      onClick={() => approveRequest(req._id)}
                    >
                      ✓ Approve
                    </button>
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
