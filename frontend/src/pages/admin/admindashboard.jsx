import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import "chart.js/auto";
import { Server_URL } from "../../utils/config";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [selectedSection, setSelectedSection] = useState("dashboard");
  const [user, setUser] = useState([]);
  const [lib, setLib] = useState([]);
  const [books, setBooks] = useState([]);
  const [latestBooks, setLatestBooks] = useState([]);
  const [totalUser, setTotalUser] = useState(0);
  const [totalLib, setTotalLib] = useState(0);
  const [totalBooks, setTotalBooks] = useState(0);
  const [borrowedBooks, setBorrowedBooks] = useState(0);
  const [occupancyPercent, setOccupancyPercent] = useState(0);
  const [categoryData, setCategoryData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          "#3498db",
          "#f39c12",
          "#9b59b6",
          "#e74c3c",
          "#2ecc71",
        ],
      },
    ],
  });

  const role = localStorage.getItem("role");

  // ---------------- USERS ----------------
  async function getUsers() {
    try {
      const result = await axios.get(Server_URL + "users");
      const { user } = result.data;

      const students = user.filter((u) => u.role === "student");
      const librarians = user.filter((u) => u.role === "librarian");

      setUser(students);
      setLib(librarians);

      setTotalUser(students.length);
      setTotalLib(librarians.length);
    } catch (err) {
      console.log("Error fetching users");
    }
  }

  // ---------------- BOOKS ----------------
  async function getBooks() {
    try {
      const result = await axios.get(Server_URL + "books");
      const { books, totalBooks } = result.data;

      setBooks(books);
      setTotalBooks(totalBooks);

      const categoryCount = books.reduce((acc, book) => {
        acc[book.category] = (acc[book.category] || 0) + 1;
        return acc;
      }, {});

      setCategoryData({
        labels: Object.keys(categoryCount),
        datasets: [
          {
            data: Object.values(categoryCount),
            backgroundColor: [
              "#3498db",
              "#f39c12",
              "#9b59b6",
              "#e74c3c",
              "#2ecc71",
            ],
          },
        ],
      });

      const borrowed = books.reduce(
        (acc, book) => acc + (book.totalCopies - book.availableCopies),
        0
      );
      setBorrowedBooks(borrowed);

      const totalCopies = books.reduce(
        (acc, b) => acc + b.totalCopies,
        0
      );
      setOccupancyPercent(totalCopies ? Math.round((borrowed / totalCopies) * 100) : 0);
    } catch (err) {
      console.log("Error fetching books");
    }
  }

  // ------------ Latest Books --------------
  async function getLatestBooks() {
    try {
      const result = await axios.get(Server_URL + "books/new");
      setLatestBooks(result.data.books || []);
    } catch (err) {
      console.log("Error fetching latest");
    }
  }

  // Load everything
  useEffect(() => {
    getUsers();
    getBooks();
    getLatestBooks();
  }, []);

  const handleSectionChange = (sec) => setSelectedSection(sec);

  return (
    <div className="admin-dashboard">
      <div className="row g-0">

        {/* ---------- SIDEBAR ---------- */}
        <nav className="col-md-3 col-lg-2 admin-sidebar">
          <h4 className="admin-sidebar-title">
            📌 {role === "admin" ? "Admin Panel" : "Librarian Panel"}
          </h4>

          <ul className="admin-nav">
            <li className="admin-nav-item">
              <button
                className={`admin-nav-btn ${selectedSection === "dashboard" ? "active" : ""}`}
                onClick={() => handleSectionChange("dashboard")}
              >
                📊 Dashboard
              </button>
            </li>

            <li className="admin-nav-item">
              <button
                className={`admin-nav-btn ${selectedSection === "users" ? "active" : ""}`}
                onClick={() => handleSectionChange("users")}
              >
                👥 Users
              </button>
            </li>

            {role === "admin" && (
              <li className="admin-nav-item">
                <button
                  className={`admin-nav-btn ${selectedSection === "librarians" ? "active" : ""}`}
                  onClick={() => handleSectionChange("librarians")}
                >
                  📚 Librarians
                </button>
              </li>
            )}

            <li className="admin-nav-item">
              <button
                className={`admin-nav-btn ${selectedSection === "books" ? "active" : ""}`}
                onClick={() => handleSectionChange("books")}
              >
                📖 Books
              </button>
            </li>
          </ul>
        </nav>

        {/* ---------- MAIN CONTENT ---------- */}
        <main className="col-md-9 col-lg-10 admin-main">
          {/* -------- Dashboard Section -------- */}
          {selectedSection === "dashboard" && (
            <>
              <h2 className="admin-section-title">📊 Dashboard Overview</h2>

              <div className="stats-grid">
                <div className="stat-card books">
                  <h3>Total Books</h3>
                  <p>{totalBooks}</p>
                </div>

                <div className="stat-card users">
                  <h3>Total Users</h3>
                  <p>{totalUser}</p>
                </div>

                {role === "admin" && (
                  <div className="stat-card librarians">
                    <h3>Total Librarians</h3>
                    <p>{totalLib}</p>
                  </div>
                )}

                <div className="stat-card borrowed">
                  <h3>Books Borrowed</h3>
                  <p>{borrowedBooks}</p>
                </div>
              </div>

              <div className="progress-grid">
                <div className="progress-card">
                  <h3>Books Issued</h3>
                  <div className="progress-container">
                    <div
                      className="progress-bar"
                      style={{ width: `${occupancyPercent}%` }}
                    >
                      {occupancyPercent}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="chart-activity-grid">
                <div className="chart-card">
                  <h3>Category Distribution</h3>
                  <div style={{ height: "250px" }}>
                    <Pie
                      data={categoryData}
                      options={{
                        plugins: {
                          legend: {
                            position: "bottom",
                            labels: {
                              padding: 20,
                              usePointStyle: true,
                            },
                          },
                        },
                        maintainAspectRatio: false,
                      }}
                    />
                  </div>
                </div>

                <div className="activity-card">
                  <h3>Recent Addition</h3>

                  <div className="activity-list">
                    {latestBooks.slice(0, 4).map((book, idx) => (
                      <div key={idx} className="activity-item">
                        <div className="activity-icon">📚</div>
                        <div className="activity-text">
                          <strong>{book.title}</strong>{" "}
                          {book.addedBy?.name && <>added by {book.addedBy.name}</>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* -------- Users Section -------- */}
          {selectedSection === "users" && (
            <>
              <h2 className="admin-section-title">👥 Users Management</h2>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Stream</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.map((u, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>{u.stream}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* -------- Librarians Section -------- */}
          {selectedSection === "librarians" && role === "admin" && (
            <>
              <h2 className="admin-section-title">📚 Librarians Management</h2>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lib.map((u, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>{u.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* -------- Books Section -------- */}
          {selectedSection === "books" && (
            <>
              <h2 className="admin-section-title">📖 Books Inventory</h2>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Category</th>
                      <th>Total Copies</th>
                      <th>Available</th>
                    </tr>
                  </thead>
                  <tbody>
                    {books.map((b, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>{b.title}</td>
                        <td>{b.author}</td>
                        <td>{b.category}</td>
                        <td>{b.totalCopies}</td>
                        <td>{b.availableCopies}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
