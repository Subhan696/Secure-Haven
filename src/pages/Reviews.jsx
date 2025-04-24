import React from 'react';
import reviews from '../data/reviewsData'; // ✅ Same source
import './Reviews.css';

const Reviews = () => (
  <section className="reviews-page">
    <h2>User Feedback & Ratings</h2>
    <div className="review-list">
      {reviews.map((review, index) => (
        <div className="review-card" key={index}>
          <p>"{review.text}"</p>
          <div className="review-stars">{'⭐'.repeat(review.stars)}</div>
          <span>{review.author}</span>
        </div>
      ))}
    </div>
  </section>
);

export default Reviews;
