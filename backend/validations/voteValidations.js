const { body } = require('express-validator');
const mongoose = require('mongoose');

/**
 * Validation rules for casting a vote
 */
const castVoteValidation = [
  body('election')
    .notEmpty().withMessage('Election ID is required')
    .custom(value => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid election ID format');
      }
      return true;
    }),
  
  // Validate the 'votes' array for multiple selections
  body('votes')
    .isArray({ min: 1 }).withMessage('Votes must be an array and cannot be empty'),
  
  // Validate each item in the 'votes' array
  body('votes.*.question')
    .notEmpty().withMessage('Question ID is required for each vote')
    .custom(value => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid question ID format');
      }
      return true;
    }),
  
  body('votes.*.option')
    .notEmpty().withMessage('Option ID is required for each vote')
    .custom(value => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid option ID format');
      }
      return true;
    })
];

module.exports = {
  castVoteValidation
};
