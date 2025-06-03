const { body } = require('express-validator');

/**
 * Validation rules for user registration
 */
const registerValidation = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .isString().withMessage('Name must be a string')
    .trim(),
  
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),
  
  body('role')
    .optional()
    .isIn(['admin', 'voter']).withMessage('Role must be either admin or voter')
];

/**
 * Validation rules for user login
 */
const loginValidation = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
];

/**
 * Validation rules for updating user profile
 */
const updateProfileValidation = [
  body('name')
    .optional()
    .isString().withMessage('Name must be a string')
    .trim(),
  
  body('email')
    .optional()
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail()
];

/**
 * Validation rules for changing password
 */
const changePasswordValidation = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters long')
    .matches(/[a-z]/).withMessage('New password must contain at least one lowercase letter')
    .matches(/[A-Z]/).withMessage('New password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('New password must contain at least one number')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    })
];

module.exports = {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation
};
