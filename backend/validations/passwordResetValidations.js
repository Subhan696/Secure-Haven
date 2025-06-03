const { body } = require('express-validator');

/**
 * Validation rules for requesting a password reset
 */
const requestResetValidation = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail()
];

/**
 * Validation rules for resetting a password
 */
const resetPasswordValidation = [
  body('token')
    .notEmpty().withMessage('Token is required')
    .isString().withMessage('Token must be a string'),
  
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters long')
    .matches(/[a-z]/).withMessage('New password must contain at least one lowercase letter')
    .matches(/[A-Z]/).withMessage('New password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('New password must contain at least one number')
];

module.exports = {
  requestResetValidation,
  resetPasswordValidation
};
