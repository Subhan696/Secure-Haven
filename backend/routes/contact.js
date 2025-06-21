const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// Contact form validation
const contactValidation = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
    .trim(),
  
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('subject')
    .notEmpty().withMessage('Subject is required')
    .isLength({ min: 5, max: 100 }).withMessage('Subject must be between 5 and 100 characters')
    .trim(),
  
  body('message')
    .notEmpty().withMessage('Message is required')
    .isLength({ min: 10, max: 1000 }).withMessage('Message must be between 10 and 1000 characters')
    .trim()
];

// Submit contact form
router.post('/submit', contactValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, subject, message } = req.body;

    // Log the contact form submission (in a real app, you'd send an email)
    console.log('Contact form submission:', {
      name,
      email,
      subject,
      message,
      timestamp: new Date().toISOString()
    });

    // TODO: In a production environment, you would:
    // 1. Send an email to your support team
    // 2. Send a confirmation email to the user
    // 3. Store the message in a database
    // 4. Integrate with a ticketing system

    // For now, we'll simulate a successful submission
    res.status(200).json({
      message: 'Thank you for your message! We will get back to you within 24 hours.',
      success: true
    });

  } catch (err) {
    console.error('Contact form error:', err);
    res.status(500).json({ 
      message: 'Failed to submit contact form. Please try again later.',
      success: false
    });
  }
});

module.exports = router; 