import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api'; // Import api utility
import image from "../assets/vote.jpg";
import './Home.css';

const Home = () => {
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewsError, setReviewsError] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoadingReviews(true);
        setReviewsError('');
        // Fetch reviews from the backend, maybe limit to 3 or 5 here directly if API supports, or after fetch.
        const response = await api.get('/reviews?limit=3'); // Fetching a limited number of reviews
        setReviews(response.data.reviews || []);
      } catch (err) {
        console.error('Error fetching reviews for homepage:', err);
        setReviewsError('Failed to load reviews. Please try again later.');
        setReviews([]);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, []);

  // Helper for star rendering (can be moved to a component if reused much)
  const StarRating = ({ rating }) => (
    <div className="review-stars">
      {[...Array(5)].map((_, i) => (
        <span key={i} className={i < rating ? 'star selected' : 'star'}>★</span>
      ))}
      <span className="rating-number">{rating}.0</span>
    </div>
  );

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

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
        {loadingReviews ? (
          <div className="loading-spinner">Loading reviews...</div>
        ) : reviewsError ? (
          <div className="error-message">{reviewsError}</div>
        ) : reviews.length === 0 ? (
          <p className="no-reviews">No reviews yet. Be the first to share your experience!</p>
        ) : (
          <div className="review-list">
            {reviews.map((review) => (
              <div className="review-card" key={review._id}>
                <div className="review-header">
                  <div className="review-meta">
                    <StarRating rating={review.rating} /> {/* Use review.rating */}
                    {review.createdAt && (
                      <time className="review-date" dateTime={review.createdAt}>
                        {formatDate(review.createdAt)}
                      </time>
                    )}
                  </div>
                </div>
                <p>"{review.comment}"</p> {/* Use review.comment */}
                <footer className="review-footer">
                  <div>
                    <span className="review-author">{review.name || 'Anonymous'}</span> {/* Use review.name */}
                  </div>
                </footer>
              </div>
            ))}
          </div>
        )}
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

