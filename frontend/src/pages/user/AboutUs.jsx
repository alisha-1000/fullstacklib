import React from 'react';
import { Link } from 'react-router-dom';
import { FiBook, FiUsers, FiAward, FiClock, FiMapPin } from 'react-icons/fi';
import './about.css';

const AboutUs = () => {
  return (
    <div className="about-page">

      {/* HERO SECTION */}
      <section className="about-hero-section">
        <div className="about-container">
          <h1 className="about-hero-title">About Our College Library</h1>
          <p className="about-hero-subtitle">
            Discover the heart of academic excellence at our institution
          </p>
        </div>
      </section>

      {/* MISSION SECTION */}
      <section className="about-mission-section">
        <div className="about-container about-flex">
          <div className="about-mission-text">
            <h2 className="about-section-title">Our Mission</h2>
            <p className="about-mission-paragraph">
              The College Library is dedicated to supporting the academic and
              research needs of our students and faculty. We provide equitable
              access to information resources, foster literacy, and maintain an
              environment that encourages learning and intellectual growth.
            </p>
            <p className="about-mission-paragraph">
              We align with the institution’s commitment to academic excellence
              through state-of-the-art services and comprehensive resources.
            </p>
          </div>

          <div className="about-mission-image">
            <img
              src="/assets/libraryinterior.jpg"
              alt="College Library Interior"
              className="about-mission-img"
            />
          </div>
        </div>
      </section>

      {/* HISTORY SECTION */}
      <section className="about-history-section">
        <div className="about-container">
          <h2 className="about-section-title">Our History</h2>

          <div className="about-timeline">
            {[
              {
                year: "1965",
                title: "Foundation",
                desc: "Established with 2,000 books to support the newly founded college."
              },
              {
                year: "1992",
                title: "Expansion",
                desc: "Relocated to a larger space to accommodate more students and resources."
              },
              {
                year: "2010",
                title: "Digital Transformation",
                desc: "Introduced digital catalog system and e-resources."
              },
              {
                year: "2022",
                title: "Modernization",
                desc: "Renovated with tech-integrated study spaces."
              }
            ].map((event, i) => (
              <div className="about-timeline-item" key={i}>
                <div className="about-timeline-year">{event.year}</div>
                <div className="about-timeline-content">
                  <h3 className="about-timeline-event">{event.title}</h3>
                  <p className="about-timeline-description">{event.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BY THE NUMBERS SECTION */}
      <section className="about-stats-section">
        <div className="about-container">
          <h2 className="about-stats-title">By the Numbers</h2>

          <div className="about-stats-grid">
            <div className="about-stat-card">
              <FiBook size={40} className="about-stat-icon" />
              <h3 className="about-stat-number">85,000+</h3>
              <p className="about-stat-label">Print Volumes</p>
            </div>

            <div className="about-stat-card">
              <FiUsers size={40} className="about-stat-icon" />
              <h3 className="about-stat-number">15,000+</h3>
              <p className="about-stat-label">Active Users</p>
            </div>

            <div className="about-stat-card">
              <FiAward size={40} className="about-stat-icon" />
              <h3 className="about-stat-number">50+</h3>
              <p className="about-stat-label">Academic Journals</p>
            </div>

            <div className="about-stat-card">
              <FiClock size={40} className="about-stat-icon" />
              <h3 className="about-stat-number">100+</h3>
              <p className="about-stat-label">Weekly Hours Open</p>
            </div>
          </div>
        </div>
      </section>

      {/* FACILITIES SECTION */}
      <section className="about-facilities-section">
        <div className="about-container">
          <h2 className="about-section-title">Our Facilities</h2>

          <div className="about-facilities-grid">
            {[
              {
                img: "/assets/readingroom.webp",
                title: "Main Reading Room",
                desc: "Quiet study space with seating for 200 students."
              },
              {
                img: "/assets/computerlab.jpeg",
                title: "Computer Lab",
                desc: "40 workstations with high-speed internet and academic tools."
              },
              {
                img: "/assets/groupstudyroom.jpeg",
                title: "Group Study Rooms",
                desc: "12 rooms equipped with whiteboards and display screens."
              }
            ].map((facility, i) => (
              <div className="about-facility-card" key={i}>
                <img
                  src={facility.img}
                  alt={facility.title}
                  className="about-facility-img"
                />
                <h3 className="about-facility-name">{facility.title}</h3>
                <p className="about-facility-description">{facility.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="about-cta-section">
        <div className="about-container">
          <h2 className="about-cta-title">Experience Our Library</h2>
          <p className="about-cta-subtitle">
            Visit us today and explore all our resources
          </p>

          <div className="about-cta-buttons">
            <Link to="/" className="about-btn about-btn-primary">
              <FiMapPin className="about-icon" /> Explore Books
            </Link>

            <Link to="/contactus" className="about-btn about-btn-secondary">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default AboutUs;
