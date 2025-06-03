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
  
  body('candidate')
    .notEmpty().withMessage('Candidate is required')
    .isString().withMessage('Candidate must be a string')
    .trim()
];

module.exports = {
  castVoteValidation
};
