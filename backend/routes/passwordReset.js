const express = require('express');
const router = express.Router();
const PasswordResetRequest = require('../models/PasswordResetRequest');
const User = require('../models/User');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const validate = require('../middleware/validate');
const { requestResetValidation, resetPasswordValidation } = require('../validations/passwordResetValidations');

// Request a password reset
router.post('/request', validate(requestResetValidation), async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validate input
    if (!email) {
      return res.status(400).json({ message: 'Please provide an email address' });
    }
    
    // For security reasons, always return success even if user doesn't exist
    // This prevents user enumeration attacks
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ 
        message: 'If your email is registered, you will receive a password reset link' 
      });
    }
    
    // Invalidate any existing reset tokens for this user
    await PasswordResetRequest.updateMany(
      { user: user._id, used: false },
      { used: true }
    );
    
    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour
    
    // Save the new reset request
    const resetRequest = new PasswordResetRequest({ 
      user: user._id, 
      token, 
      expiresAt 
    });
    await resetRequest.save();
    
    // In a real app: send email with reset link here
    // For development, return the token in the response
    console.log(`Password reset token for ${email}: ${token}`);
    
    res.status(200).json({ 
      message: 'If your email is registered, you will receive a password reset link',
      // Remove this in production
      token: process.env.NODE_ENV === 'production' ? undefined : token
    });
  } catch (err) {
    console.error('Password reset request error:', err);
    res.status(500).json({ message: 'Server error processing your request' });
  }
});

// Reset password
router.post('/reset', validate(resetPasswordValidation), async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    // Validate input
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Please provide token and new password' });
    }
    
    // Password strength validation
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }
    
    // Find valid reset request
    const resetRequest = await PasswordResetRequest.findOne({ 
      token, 
      used: false, 
      expiresAt: { $gt: new Date() } 
    });
    
    if (!resetRequest) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    
    // Find the user
    const user = await User.findById(resetRequest.user);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Hash the new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    
    // Mark the reset request as used
    resetRequest.used = true;
    await resetRequest.save();
    
    // Invalidate all other reset tokens for this user
    await PasswordResetRequest.updateMany(
      { user: user._id, used: false },
      { used: true }
    );
    
    res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Password reset error:', err);
    res.status(500).json({ message: 'Server error processing your request' });
  }
});

// Validate reset token (for frontend to check if token is valid before showing reset form)
router.get('/validate/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }
    
    const resetRequest = await PasswordResetRequest.findOne({ 
      token, 
      used: false, 
      expiresAt: { $gt: new Date() } 
    });
    
    if (!resetRequest) {
      return res.status(400).json({ 
        valid: false, 
        message: 'Invalid or expired token' 
      });
    }
    
    res.status(200).json({ 
      valid: true, 
      message: 'Token is valid' 
    });
  } catch (err) {
    console.error('Token validation error:', err);
    res.status(500).json({ message: 'Server error validating token' });
  }
});

module.exports = router;
