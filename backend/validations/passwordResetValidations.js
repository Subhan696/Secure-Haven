const Joi = require('joi');

/**
 * Validation rules for requesting a password reset
 */
const requestResetValidation = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  })
});

/**
 * Validation rules for resetting a password
 */
const resetPasswordValidation = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  verificationCode: Joi.string().length(6).required().messages({
    'string.length': 'Verification code must be 6 digits',
    'any.required': 'Verification code is required'
  }),
  newPassword: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'any.required': 'New password is required'
  })
});

module.exports = {
  requestResetValidation,
  resetPasswordValidation
};
