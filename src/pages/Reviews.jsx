import React, { useState, useEffect } from 'react';
import { FiStar, FiSend } from 'react-icons/fi';
import api from '../utils/api';
import './Reviews.css';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({ 
    comment: '',
    stars: 5, 
    author: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        setError('');
        const response = await api.get('/reviews');
        setReviews(response.data.reviews || []);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError(err.response?.data?.message || 'Failed to load reviews. Please try again.');
        setReviews([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.comment.trim() || form.comment.length < 10) {
      setError('Please write a detailed review (at least 10 characters)');
      return;
    }
    
    if (!form.author.trim()) {
      setError('Please provide your name');
      return;
    }
    
    if (!form.email || !validateEmail(form.email)) {
      setError('Please provide a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const newReviewData = {
        comment: form.comment.trim(),
        rating: Number(form.stars),
        author: form.author.trim(),
        email: form.email.trim(),
      };

      const response = await api.post('/reviews', newReviewData);
      setReviews(prevReviews => [...prevReviews, response.data.review]);
      setSuccess('Thank you for your review!');
      setForm({ comment: '', stars: 5, author: '', email: '' });
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const StarRating = ({ rating, onRate, interactive = false }) => (
    <div className="star-input">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star ${star <= rating ? 'selected' : ''} ${interactive ? 'interactive' : ''}`}
          onClick={interactive ? () => onRate(star) : null}
          onKeyDown={interactive ? (e) => e.key === 'Enter' && onRate(star) : null}
          aria-label={`${star} star${star !== 1 ? 's' : ''}${interactive ? ', click to rate' : ''}`}
          tabIndex={interactive ? 0 : -1}
        >
          <FiStar />
        </button>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <section className="reviews-page">
        <div className="loading-spinner">Loading reviews...</div>
      </section>
    );
  }

  return (
    <section className="reviews-page">
      <h2>Share Your Experience</h2>
      <p className="section-description">
        We value your feedback! Please share your thoughts about your experience with Secure Haven.
      </p>
      
      <form className="review-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="review-comment">Your Review</label>
          <textarea
            id="review-comment"
            name="comment"
            value={form.comment}
            onChange={handleChange}
            placeholder="Share details about your experience..."
            rows={4}
            disabled={isSubmitting}
            aria-describedby="review-help"
          />
          <small id="review-help" className="form-help">
            Minimum 10 characters
          </small>
        </div>
        
        <div className="form-group">
          <label>Rating</label>
          <StarRating 
            rating={form.stars} 
            onRate={(stars) => setForm(prev => ({ ...prev, stars }))} 
            interactive={true} 
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="author">Your Name</label>
            <input
              id="author"
              type="text"
              name="author"
              value={form.author}
              onChange={handleChange}
              placeholder="Harry"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email (optional, for verification)</label>
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="your@email.com"
              disabled={isSubmitting}
            />
          </div>
        </div>
        
        <button 
          type="submit" 
          className="submit-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="button-loading">Submitting...</span>
          ) : (
            <>
              <FiSend className="button-icon" />
              Submit Review
            </>
          )}
        </button>
        
        {error && <div className="form-error" role="alert">{error}</div>}
        {success && <div className="form-success" role="status">{success}</div>}
      </form>
      
      <div className="reviews-header">
        <h3>What Our Users Say</h3>
        <p className="reviews-count">{reviews.length} reviews</p>
      </div>
      
      <div className="review-list">
        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <div key={review._id || index} className="review-card">
              <div className="review-header">
                <StarRating rating={review.rating} />
                <span className="review-author">{review.name || 'Anonymous'}</span>
              </div>
              <p className="review-text">"{review.comment}"</p>
              <div className="review-date">Reviewed on {formatDate(review.createdAt)}</div>
            </div>
          ))
        ) : (
          <p className="no-reviews">No reviews yet. Be the first to review!</p>
        )}
      </div>
    </section>
  );
};

export default Reviews;
