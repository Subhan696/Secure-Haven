const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  election: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Election', 
    required: true 
  },
  voter: { 
    type: mongoose.Schema.Types.Mixed, 
    required: true 
  },
  voterEmail: { 
    type: String, 
    required: true 
  },
  candidate: { 
    type: String, 
    required: true 
  },
  votedAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Vote', voteSchema);
