const { validationResult } = require('express-validator');

/**
 * Middleware to validate request data using express-validator
 * @param {Array} validations - Array of express-validator validation rules
 * @returns {Function} Express middleware function
 */
const validate = (validation) => {
  return async (req, res, next) => {
    try {
      // If it's a Joi schema
      if (validation && typeof validation.validate === 'function') {
        const { error } = validation.validate(req.body);
        if (error) {
          return res.status(400).json({
            message: 'Validation failed',
            errors: error.details.map(d => ({ message: d.message }))
          });
        }
        return next();
      }

      // If it's an array of express-validator functions
      if (Array.isArray(validation)) {
        await Promise.all(validation.map(v => v.run(req)));
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        return next();
      }

      // If nothing matches, just call next
      return next();
    } catch (err) {
      console.error('Validation error:', err);
      return res.status(500).json({ message: 'Server error during validation' });
    }
  };
};

module.exports = validate;
