import React, { useState, useEffect } from 'react';
import { FiStar, FiSend } from 'react-icons/fi';
import reviewsData from '../data/reviewsData';
import './Reviews.css';

const LOCAL_KEY = 'secureHavenUserReviews';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({ 
    text: '', 
    stars: 5, 
    author: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api.get('/reviews')
      .then(res => setReviews(res.data))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      const stored = localStorage.getItem(LOCAL_KEY);
      if (stored) {
        setReviews([...reviewsData, ...JSON.parse(stored)]);
      } else {
        setReviews(reviewsData);
      }
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
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
    
    // Validation
    if (!form.text.trim() || form.text.length < 10) {
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

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    
    const newReview = {
      text: form.text.trim(),
      stars: Number(form.stars),
      author: form.author.trim(),
      date: new Date().toISOString(),
      isVerified: false
    };

    const updatedReviews = [...reviews, newReview];
    setReviews(updatedReviews);
    
    // Save to localStorage, excluding the default reviews
    const userReviews = updatedReviews.filter(
      r => !reviewsData.some(d => d.text === r.text && d.author === r.author)
    );
    api.post('/reviews', form)
  .then(() => setSuccess('Thank you for your review!'))
  .catch(() => setSuccess('Failed to submit review.'));
setForm({ text: '', stars: 5, author: '', email: '' });
    
    setForm({ text: '', stars: 5, author: '', email: '' });
    setSuccess('Thank you for your review!');
    setIsSubmitting(false);
    
    // Clear success message after 5 seconds
    setTimeout(() => setSuccess(''), 5000);
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
          <label htmlFor="review-text">Your Review</label>
          <textarea
            id="review-text"
            name="text"
            value={form.text}
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
            <article className="review-card" key={`${review.author}-${index}`}>
              <div className="review-header">
                <div className="review-meta">
                  <div className="review-stars">
                    <StarRating rating={review.stars} />
                    <span className="rating-number">{review.stars}.0</span>
                  </div>
                  {review.date && (
                    <time className="review-date" dateTime={review.date}>
                      {formatDate(review.date)}
                    </time>
                  )}
                </div>
                {review.isVerified && (
                  <span className="verified-badge" title="Verified user">
                    Verified
                  </span>
                )}
              </div>
              <p>{review.text}</p>
              <footer className="review-footer">
                <div>
                  <span className="review-author">{review.author}</span>
                  {review.role && (
                    <span className="review-role">{review.role}</span>
                  )}
                </div>
              </footer>
            </article>
          ))
        ) : (
          <p className="no-reviews">No reviews yet. Be the first to review!</p>
        )}
      </div>
    </section>
  );
};

export default Reviews;
