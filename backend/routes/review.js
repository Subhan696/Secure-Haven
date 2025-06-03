const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createReviewValidation, updateReviewValidation } = require('../validations/reviewValidations');
const User = require('../models/User');

// Create a review
router.post('/', auth, validate(createReviewValidation), async (req, res) => {
  try {
    // Get name from authenticated user if not provided
    const { rating, comment } = req.body;
    const name = req.body.name || req.user.name;
    
    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Please provide a valid rating between 1 and 5' });
    }
    
    if (!comment) {
      return res.status(400).json({ message: 'Please provide a comment' });
    }
    
    const review = new Review({ 
      name, 
      rating, 
      comment,
      user: req.user.id // Link review to user
    });
    
    await review.save();
    res.status(201).json({ message: 'Review submitted successfully', review });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all reviews with pagination
router.get('/', async (req, res) => {
  try {
    // Apply pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const total = await Review.countDocuments();
    
    // Get reviews with pagination
    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    res.status(200).json({
      reviews,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a user's reviews
router.get('/me', auth, async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a review
router.put('/:id', auth, validate(updateReviewValidation), async (req, res) => {
  try {
    // Find the review first to check permissions
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if user is the owner of the review
    if (review.user && review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }
    
    // Update the review
    const { rating, comment } = req.body;
    
    // Validate input
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: 'Please provide a valid rating between 1 and 5' });
    }
    
    if (rating) review.rating = rating;
    if (comment) review.comment = comment;
    
    await review.save();
    
    res.status(200).json({ message: 'Review updated successfully', review });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a review
router.delete('/:id', auth, async (req, res) => {
  try {
    // Find the review first to check permissions
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if user is the owner of the review or an admin
    if (review.user && review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }
    
    // Delete the review
    await Review.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
