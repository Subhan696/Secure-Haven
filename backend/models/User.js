const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'voter'], default: 'voter' },
  createdAt: { type: Date, default: Date.now },
  // Add more fields as needed (e.g., votingHistory, etc.)
});

module.exports = mongoose.model('User', userSchema);
