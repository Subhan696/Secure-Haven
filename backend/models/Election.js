const mongoose = require('mongoose');

// Options are simple strings in the frontend
const optionSchema = String;

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: [optionSchema]
});

const voterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  voterKey: { type: String }
});

const electionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  timezone: { type: String, default: 'UTC' },
  status: { type: String, enum: ['draft', 'scheduled', 'live', 'ended'], default: 'draft' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  questions: [questionSchema],
  voters: [voterSchema],
  votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vote' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Election', electionSchema);
