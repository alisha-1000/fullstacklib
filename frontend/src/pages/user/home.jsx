import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Server_URL } from "../../utils/config";
import "./home.css";
import { Link } from "react-router-dom";
import {
  FiBook,
  FiSearch,
  FiClock,
  FiUser,
  FiCalendar,
  FiBookOpen
} from "react-icons/fi";
import Preloader from "../../components/Preloader";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);

  const [stats, setStats] = useState({
    totalCategories: 0,
    totalBooks: 0,
    totalActiveStudents: 0
  });

  const [loading, setLoading] = useState(true);

  // =======================
  // Fetch Home Page Data
  // =======================
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const { data } = await axios.get(Server_URL + "home");

      if (!data.error) {
        setStats({
          totalCategories: data.stats?.totalCategories || 0,
          totalBooks: data.stats?.totalBooks || 0,
          totalActiveStudents: data.stats?.totalActiveStudents || 0
        });

        setCategories(data.categories || []);
        setNewArrivals(data.newArrivals || []);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setTimeout(() => setLoading(false), 300); // smooth transition
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <Preloader />;

  return (
    <div className="library-homepage">

      {/* ============================
          HERO SECTION 
      ============================ */}
      <header className="hero-section">
        <div className="hero-overlay"></div>

        <div className="container hero-content">
          <h1 className="hero-title fade-in">
            Welcome to College Central Library
          </h1>

          <p className="hero-subtitle fade-in-delay">
            Access textbooks, academic journals & research materials
          </p>

          <div className="hero-buttons fade-in-delay-2">
            <Link to="/books" className="btn btn-primary hero-btn">
              <FiBookOpen size={18} />
              Browse Collections
            </Link>
          </div>
        </div>
      </header>

      {/* ============================
          STATISTICS
      ============================ */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">

            <div className="stat-cardhome">
              <FiSearch className="stat-icon" />
              <h3>{stats.totalCategories}+</h3>
              <p>Total Categories</p>
            </div>

            <div className="stat-cardhome">
              <FiBook className="stat-icon" />
              <h3>{stats.totalBooks}+</h3>
              <p>Total Books</p>
            </div>

            <div className="stat-cardhome">
              <FiUser className="stat-icon" />
              <h3>{stats.totalActiveStudents}</h3>
              <p>Active Students</p>
            </div>

          </div>
        </div>
      </section>

      {/* ============================
          CATEGORIES 
      ============================ */}
      <section className="categories-section">
        <div className="container">
          <h2 className="section-title">Browse by Categories</h2>
          <p className="section-subtitle">Explore resources by subjects</p>

          <div className="categories-grid">
            {categories.map((cat, index) => (
              <div key={index} className="category-card fade-up">
                <div className="category-img-container">
                  <img
                    src={
                      cat.coverImage ||
                      "https://via.placeholder.com/400x500?text=No+Image"
                    }
                    alt={cat.category}
                  />
                </div>

                <div className="category-info">
                  <h3>{cat.category}</h3>
                  <p>Books: {cat.count}</p>

                  <Link
                    to={`/books?category=${encodeURIComponent(cat.category)}`}
                    className="btn btn-outline"
                  >
                    View Collection
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/category" className="btn btn-view-all">
              View All Categories
            </Link>
          </div>
        </div>
      </section>

      {/* ============================
          NEW ARRIVALS
      ============================ */}
      <section className="na-section">
        <div className="na-container">
          <h2 className="na-heading">New Arrivals</h2>
          <p className="na-subheading">
            Recently added books in our collection
          </p>

          <div className="na-grid-container">
            {newArrivals.length === 0 ? (
              <p className="text-muted">No new arrivals</p>
            ) : (
              newArrivals.map((book) => (
                <Link
                  to={`/bookdetails/${book._id}`}
                  key={book._id}
                  className="na-book-item fade-up"
                >
                  <div className="na-cover-wrapper">
                    <img
                      src={
                        book.coverImage ||
                        "https://via.placeholder.com/300x400?text=No+Image"
                      }
                      alt={book.title}
                      className="na-cover-image"
                    />
                  </div>

                  <div className="na-book-info">
                    <h3 className="na-book-title">{book.title}</h3>
                    <p className="na-book-author">{book.author}</p>
                    <span className="na-book-category">{book.category}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ============================
          LIBRARY HOURS
      ============================ */}
      <section className="hours-section">
        <div className="container">
          <h2 className="section-title">Library Hours</h2>

          <div className="hours-grid">
            <div className="hours-card">
              <FiClock className="hours-icon" />
              <h3>Regular Hours</h3>
              <p>Mon - Fri: 8:00 AM - 8:00 PM</p>
              <p>Saturday: 10:00 AM - 5:00 PM</p>
              <p>Sunday: Closed</p>
            </div>

            <div className="hours-card">
              <FiCalendar className="hours-icon" />
              <h3>Exam Period</h3>
              <p>Mon - Sun: 7:00 AM - 11:00 PM</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
