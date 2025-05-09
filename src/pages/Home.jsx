import React from 'react';
import { Link } from 'react-router-dom';
import reviews from '../data/reviewsData';
import image from "../assets/vote.jpg";
import './Home.css';

const Home = () => {
  const featuredReviews = reviews.slice(0, 3); // show top 3 reviews

  return (
    <>
      {/* Hero Section */}
      <section className="home-section">
        <div className="home-content">
          <h2>Secure, Cloud-based Elections</h2>
          <p>
            Create an election for your school or organization in seconds. Your voters can vote from any location on any device.
          </p>
          <Link to="/signup" className="btn start-btn">
            Create a Free Election
          </Link>
        </div>

        <div className="home-image">
          <img
            src={image}
            alt="Online Voting Illustration"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h3>Why Choose Secure Haven?</h3>
        <div className="features-grid">
          <div className="feature-card">
            <h4>End-to-End Encryption</h4>
            <p>Your votes are protected with top-tier encryption protocols.</p>
          </div>
          <div className="feature-card">
            <h4>Real-Time Results</h4>
            <p>Get instant insights as soon as voting ends — no delays.</p>
          </div>
          <div className="feature-card">
            <h4>Mobile Friendly</h4>
            <p>Voters can participate easily from any device, anytime.</p>
          </div>
          <div className="feature-card">
            <h4>Fraud Detection</h4>
            <p>Our system flags suspicious activity automatically.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <h3>How It Works</h3>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">01</div>
            <h4>Create Your Election</h4>
          </div>
          <div className="step-card">
            <div className="step-number">02</div>
            <h4>Configure Ballot Questions</h4>
          </div>
          <div className="step-card">
            <div className="step-number">03</div>
            <h4>Add Voter List</h4>
          </div>
          <div className="step-card">
            <div className="step-number">04</div>
            <h4>Set Election Timeline</h4>
          </div>
          <div className="step-card">
            <div className="step-number">05</div>
            <h4>Launch Election</h4>
          </div>
          <div className="step-card">
            <div className="step-number">06</div>
            <h4>Monitor Results</h4>
          </div>
        </div>
        <div className="guide-link-container">
          <Link to="/user-guide" className="guide-link">
            View Complete User Guide →
          </Link>
        </div>
      </section>

      {/* Reviews Preview Section */}
      <section className="reviews-section">
        <h3>What People Are Saying</h3>
        <div className="review-list">
          {featuredReviews.map((review, index) => (
            <div className="review-card" key={index}>
              <p>"{review.text}"</p>
              <div className="review-stars">
                {'⭐'.repeat(review.stars)}
              </div>
              <span>{review.author}</span>
            </div>
          ))}
        </div>
        <p>
          <Link to="/reviews" className="btn view-all-reviews">
            View All Reviews
          </Link>
        </p>
      </section>
    </>
  );
};

export default Home;

