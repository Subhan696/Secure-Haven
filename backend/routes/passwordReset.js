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
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ 
        message: 'If your email is registered, you will receive a verification code' 
      });
    }
    
    // Invalidate any existing reset requests for this user
    await PasswordResetRequest.updateMany(
      { user: user._id, used: false },
      { used: true }
    );
    
    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    // Save the new reset request
    const resetRequest = new PasswordResetRequest({ 
      user: user._id, 
      verificationCode,
      expiresAt 
    });
    await resetRequest.save();
    
    // In a real app: send email with verification code here
    // For development, log the code
    console.log(`Password reset verification code for ${email}: ${verificationCode}`);
    
    res.status(200).json({ 
      message: 'If your email is registered, you will receive a verification code',
      // Remove this in production
      verificationCode: process.env.NODE_ENV === 'production' ? undefined : verificationCode
    });
  } catch (err) {
    console.error('Password reset request error:', err);
    res.status(500).json({ message: 'Server error processing your request' });
  }
});

// Reset password
router.post('/reset', validate(resetPasswordValidation), async (req, res) => {
  try {
    const { email, verificationCode, newPassword } = req.body;
    
    // Validate input
    if (!email || !verificationCode || !newPassword) {
      return res.status(400).json({ message: 'Please provide email, verification code, and new password' });
    }
    
    // Password strength validation
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }
    
    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find valid reset request
    const resetRequest = await PasswordResetRequest.findOne({ 
      user: user._id,
      verificationCode,
      used: false, 
      expiresAt: { $gt: new Date() } 
    });
    
    if (!resetRequest) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }
    
    // Hash the new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    
    // Mark the reset request as used
    resetRequest.used = true;
    await resetRequest.save();
    
    // Invalidate all other reset requests for this user
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

// Validate verification code
router.post('/validate-code', async (req, res) => {
  try {
    const { email, verificationCode } = req.body;
    
    if (!email || !verificationCode) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const resetRequest = await PasswordResetRequest.findOne({ 
      user: user._id,
      verificationCode,
      used: false, 
      expiresAt: { $gt: new Date() } 
    });
    
    if (!resetRequest) {
      return res.status(400).json({ 
        valid: false, 
        message: 'Invalid or expired verification code' 
      });
    }
    
    res.status(200).json({ 
      valid: true, 
      message: 'Verification code is valid' 
    });
  } catch (err) {
    console.error('Code validation error:', err);
    res.status(500).json({ message: 'Server error validating code' });
  }
});

module.exports = router;
