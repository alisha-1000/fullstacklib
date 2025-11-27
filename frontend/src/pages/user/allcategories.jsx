import React, { useState, useEffect } from "react";
import axios from "axios";
import { Server_URL } from "../../utils/config";
import "./allcategories.css";
import { Link } from "react-router-dom";
import Loader from "../../components/Preloader";
import { showErrorToast } from "../../utils/toasthelper";

export default function ViewAllCategories() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [categoryCounts, setCategoryCounts] = useState({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const url = Server_URL + "books";
      const response = await axios.get(url);

      if (response.data.error) {
        showErrorToast(response.data.message);
        return;
      }

      const fetchedBooks = response.data.books;
      setBooks(fetchedBooks);
      setFilteredBooks(fetchedBooks);

      const countMap = {};
      fetchedBooks.forEach((b) => {
        countMap[b.category] = (countMap[b.category] || 0) + 1;
      });

      setCategoryCounts(countMap);
    } catch (error) {
      showErrorToast("Failed to load categories.");
    } finally {
      setTimeout(() => setLoading(false), 250);
    }
  };

  const handleCategoryClick = (category) => {
    setActiveCategory(category);

    if (category === "All") {
      setFilteredBooks(books);
    } else {
      setFilteredBooks(books.filter((b) => b.category === category));
    }
  };

  // Get unique categories sorted alphabetically
  const categories = ["All", ...new Set(books.map((b) => b.category))].sort();

  // Helper: get one CLEAN image for category card
  const getCategoryImage = (category) => {
    const catBooks = books.filter((b) => b.category === category);
    const imgBook = catBooks.find((b) => b.coverImage && b.coverImage.trim() !== "");

    return imgBook?.coverImage || "https://via.placeholder.com/300x400?text=No+Image";
  };

  return (
    <div className="all-categories-container">
      <div className="all-categories-row">

        {/* SIDEBAR */}
        <aside className="all-categories-sidebar">
          <h5 className="all-categories-sidebar-title">Categories</h5>

          <ul className="all-categories-nav">
            {categories.map((category, index) => (
              <li
                key={index}
                className={`all-categories-nav-item ${
                  activeCategory === category ? "active" : ""
                }`}
                onClick={() => handleCategoryClick(category)}
              >
                {category}
              </li>
            ))}
          </ul>
        </aside>

        {/* MAIN CONTENT */}
        <main className="all-categories-main">
          <h2 className="all-categories-main-title">Explore All Categories</h2>

          {loading ? (
            <Loader />
          ) : filteredBooks.length > 0 ? (
            <div className="all-categories-grid">

              {[...new Set(filteredBooks.map((b) => b.category))].map((category, index) => (
                <div key={index} className="all-categories-card-wrapper">
                  <div className="all-categories-card shadow-sm">

                    <img
                      src={getCategoryImage(category)}
                      className="all-categories-card-img"
                      alt={category}
                    />

                    <div className="all-categories-card-body">
                      <h5 className="all-categories-card-title">{category}</h5>
                      <p className="text-muted">
                        Books: {categoryCounts[category] || 0}
                      </p>
                      <Link to="/books" className="all-categories-btn">
                        Explore
                      </Link>
                    </div>

                  </div>
                </div>
              ))}

            </div>
          ) : (
            <div className="all-categories-empty">
              <p>No books found in this category.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
