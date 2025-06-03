const { body } = require('express-validator');

/**
 * Validation rules for creating a review
 */
const createReviewValidation = [
  body('name')
    .optional()
    .isString().withMessage('Name must be a string')
    .trim(),
  
  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  
  body('comment')
    .notEmpty().withMessage('Comment is required')
    .isString().withMessage('Comment must be a string')
    .trim()
];

/**
 * Validation rules for updating a review
 */
const updateReviewValidation = [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  
  body('comment')
    .optional()
    .isString().withMessage('Comment must be a string')
    .trim()
];

module.exports = {
  createReviewValidation,
  updateReviewValidation
};
