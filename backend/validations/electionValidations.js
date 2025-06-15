const { body } = require('express-validator');

/**
 * Validation rules for creating an election
 */
const createElectionValidation = [
  body('title')
    .notEmpty().withMessage('Title is required')
    .isString().withMessage('Title must be a string')
    .trim(),
  
  body('description')
    .optional()
    .isString().withMessage('Description must be a string')
    .trim(),
  
  body('startDate')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Start date must be a valid date')
    .custom((value, { req }) => {
      const startDate = new Date(value);
      if (startDate < new Date()) {
        throw new Error('Start date cannot be in the past');
      }
      return true;
    }),
  
  body('endDate')
    .notEmpty().withMessage('End date is required')
    .isISO8601().withMessage('End date must be a valid date')
    .custom((value, { req }) => {
      const endDate = new Date(value);
      const startDate = new Date(req.body.startDate);
      if (endDate <= startDate) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  
  body('candidates')
    .isArray().withMessage('Candidates must be an array')
    .custom(candidates => {
      if (candidates.length === 0) {
        throw new Error('At least one candidate is required');
      }
      return true;
    }),
  
  body('candidates.*.name')
    .notEmpty().withMessage('Candidate name is required')
    .isString().withMessage('Candidate name must be a string')
    .trim(),
  
  body('voters')
    .optional()
    .isArray().withMessage('Voters must be an array')
];

/**
 * Validation rules for updating an election
 */
const updateElectionValidation = [
  body('title')
    .optional()
    .isString().withMessage('Title must be a string')
    .trim(),
  
  body('description')
    .optional()
    .isString().withMessage('Description must be a string')
    .trim(),
  
  body('startDate')
    .optional()
    .isISO8601().withMessage('Start date must be a valid date'),
  
  body('endDate')
    .optional()
    .isISO8601().withMessage('End date must be a valid date')
    .custom((value, { req }) => {
      if (req.body.startDate) {
        const endDate = new Date(value);
        const startDate = new Date(req.body.startDate);
        if (endDate <= startDate) {
          throw new Error('End date must be after start date');
        }
      }
      return true;
    }),
  
  body('candidates')
    .optional()
    .isArray().withMessage('Candidates must be an array')
    .custom(candidates => {
      if (candidates && candidates.length === 0) {
        throw new Error('At least one candidate is required');
      }
      return true;
    }),
  
  body('candidates.*.name')
    .optional()
    .notEmpty().withMessage('Candidate name is required')
    .isString().withMessage('Candidate name must be a string')
    .trim(),
  
  body('voters')
    .optional()
    .isArray().withMessage('Voters must be an array'),

  body('status')
    .optional()
    .isString().withMessage('Status must be a string')
    .isIn(['draft', 'scheduled', 'live', 'completed', 'ended']).withMessage('Invalid election status')
];

/**
 * Validation rules for adding voters to an election
 */
const addVotersValidation = [
  body('voters')
    .isArray().withMessage('Voters must be an array')
    .notEmpty().withMessage('At least one voter ID is required')
];

module.exports = {
  createElectionValidation,
  updateElectionValidation,
  addVotersValidation
};
