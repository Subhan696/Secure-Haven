const express = require('express');
const router = express.Router();
const Vote = require('../models/Vote');
const Election = require('../models/Election');
const User = require('../models/User');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validate = require('../middleware/validate');
const { castVoteValidation } = require('../validations/voteValidations');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Voter login with email and voter key
router.post('/login', async (req, res) => {
  try {
    const { email, voterKey } = req.body;
    
    if (!email || !voterKey) {
      return res.status(400).json({ message: 'Please provide email and voter key' });
    }
    
    console.log('=== VOTER LOGIN ATTEMPT ===');
    console.log('Attempting voter login with:', { email: email.toLowerCase(), voterKey });
    
    // First check if the voter exists in any election regardless of status
    // Use a more flexible query that's case-insensitive for the voter key
    console.log('Looking for voter with email:', email.toLowerCase(), 'and key:', voterKey);
    
    // Generate the expected voter key using the same algorithm as the frontend
    const expectedVoterKey = generateVoterKey(email.toLowerCase());
    console.log('Expected voter key based on email:', expectedVoterKey);
    
    // Helper function to generate consistent voter keys - MUST MATCH the frontend implementation
    function generateVoterKey(email) {
      // Use a secret salt for additional security - MUST MATCH the frontend salt
      const salt = 'secure-haven-salt-2024';
      
      // Simple hash function that matches the frontend implementation
      function hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash).toString(16).toUpperCase();
      }
      
      // Create a hash of the email + salt
      const hash = hashString(email + salt);
      
      // Take first 8 characters and ensure it's padded to 8 characters
      // This is critical for consistent key generation
      let key = hash.substring(0, 8);
      
      // Pad with zeros if less than 8 characters
      while (key.length < 8) {
        key = '0' + key;
      }
      
      return key;
    }
    
    // Find all elections with this voter's email first
    const allElections = await Election.find({
      'voters.email': email.toLowerCase()
    });
    
    console.log('Found', allElections.length, 'elections with this voter email');
    
    // Manually check for the voter key to handle case sensitivity
    let voterExists = null;
    for (const election of allElections) {
      console.log('Checking election:', election._id.toString(), 'status:', election.status);
      console.log('Voters in this election:', election.voters.length);
      
      // Print each voter for debugging
      election.voters.forEach((v, i) => {
        console.log(`Voter ${i}:`, {
          email: v.email,
          key: v.voterKey,
          emailMatch: v.email === email.toLowerCase(),
          keyMatch: v.voterKey === voterKey || (v.voterKey && v.voterKey.toUpperCase() === voterKey.toUpperCase())
        });
      });
      
      // Find matching voter with more flexible comparison
      const matchingVoter = election.voters.find(v => {
        // Handle case where voter might not have all fields
        if (!v || !v.email) return false;
        
        // Case-insensitive email comparison
        const emailMatch = v.email.toLowerCase() === email.toLowerCase();
        if (!emailMatch) return false;
        
        // If email matches but voter has no key, check if the provided key matches the expected key
        if (!v.voterKey) {
          // Generate the expected key for this voter
          const generatedKey = generateVoterKey(v.email.toLowerCase());
          console.log('Voter has no stored key. Generated key:', generatedKey);
          return voterKey === generatedKey || voterKey.toUpperCase() === generatedKey.toUpperCase();
        }
        
        // Try multiple key matching strategies
        // 1. Exact match
        if (v.voterKey === voterKey) {
          console.log('Exact key match found');
          return true;
        }
        
        // 2. Case-insensitive match
        if (v.voterKey && voterKey && v.voterKey.toUpperCase() === voterKey.toUpperCase()) {
          console.log('Case-insensitive key match found');
          return true;
        }
        
        // 3. Check if provided key matches what would be generated
        const generatedKey = generateVoterKey(v.email.toLowerCase());
        if (voterKey === generatedKey || voterKey.toUpperCase() === generatedKey.toUpperCase()) {
          console.log('Generated key match found');
          return true;
        }
        
        console.log('No key match found for voter:', v.email);
        console.log('Stored key:', v.voterKey);
        console.log('Provided key:', voterKey);
        console.log('Generated key:', generatedKey);
        
        return false;
      });
      
      if (matchingVoter) {
        console.log('Found matching voter:', matchingVoter);
        voterExists = election;
        break;
      }
    }
    
    if (!voterExists) {
      console.log('No election found with these voter credentials');
      return res.status(401).json({ 
        message: 'Invalid voter credentials. Please check your email and voter key.' 
      });
    }
    
    console.log('Voter found in election:', voterExists._id, 'with status:', voterExists.status);
    
    // Check if the election the voter belongs to is active/live
    // console.log('Checking election status:', voterExists.status);
    
    // // Accept multiple status values that indicate an active election
    // const activeStatuses = ['live', 'active', 'Live', 'Active'];
    // if (!activeStatuses.includes(voterExists.status)) {
    //   console.log('Election is not active. Current status:', voterExists.status);
    //   return res.status(401).json({
    //     message: `The election is not currently active (status: ${voterExists.status}). Please try again when the election is live.`
    //   });
    // }
    
    console.log('Election is active and voter can log in')
    
    // Use the election we found
    const election = voterExists;
    
    // Validate election timing
    // const now = new Date();
    // if (now < new Date(election.startDate)) {
    //   return res.status(400).json({ message: 'Election has not started yet' });
    // }
    // if (now > new Date(election.endDate)) {
    //   return res.status(400).json({ message: 'Election has ended' });
    // }
    
    // Create a token for the voter
    const token = jwt.sign(
      { 
        id: email, // Use email as ID since voters don't have user accounts
        email,
        role: 'voter',
        electionId: election._id
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(200).json({
      message: 'Voter login successful',
      token,
      electionId: election._id,
      election: {
        title: election.title,
        startDate: election.startDate,
        endDate: election.endDate
      }
    });
  } catch (err) {
    console.error('Voter login error:', err);
    res.status(500).json({ message: 'Server error during voter login' });
  }
});

// Cast a vote (authenticated users only)
router.post('/', auth, validate(castVoteValidation), async (req, res, next) => {
  try {
    console.log('Received vote submission:', JSON.stringify(req.body, null, 2));
    console.log('Authenticated user:', req.user);
    
    const { election: electionId, votes } = req.body;
    const voter = req.user.id; // Get voter ID from authenticated user
    
    // Validate input
    if (!electionId) {
      console.error('Missing election ID in request');
      return res.status(400).json({ message: 'Election ID is required' });
    }
    
    if (!votes || !Array.isArray(votes) || votes.length === 0) {
      console.error('Missing or invalid votes in request');
      return res.status(400).json({ message: 'At least one vote is required' });
    }
    
    // Check if election exists
    const election = await Election.findById(electionId);
    if (!election) {
      console.error(`Election not found with ID: ${electionId}`);
      return res.status(404).json({ message: 'Election not found' });
    }
    
    console.log(`Found election: ${election.title} (${election._id})`);
    
    // Check election status
    const now = new Date();
    const startDate = new Date(election.startDate);
    const endDate = new Date(election.endDate);
    
    if (now < startDate) {
      console.error(`Election has not started yet. Starts at: ${startDate}`);
      return res.status(400).json({ 
        message: `Election has not started yet. It will begin on ${startDate.toLocaleString()}` 
      });
    }
    
    if (now > endDate) {
      console.error(`Election has ended. Ended at: ${endDate}`);
      return res.status(400).json({ 
        message: 'Election has ended. Voting is no longer allowed.' 
      });
    }
    
    // Check if election is active
    const isActive = ['live', 'active'].includes(election.status?.toLowerCase());
    if (!isActive) {
      console.error(`Election is not active. Status: ${election.status}`);
      return res.status(400).json({ 
        message: 'This election is not currently active. Please check back later.' 
      });
    }
    
    // Check if user is authorized to vote in this election
    const voterEmail = req.user.email?.toLowerCase();
    const isVoter = election.voters.some(v => {
      const voterEmailMatch = v.email?.toLowerCase() === voterEmail;
      const voterIdMatch = v._id?.toString() === voter || v.toString() === voter;
      return voterEmailMatch || voterIdMatch;
    });
    
    if (!isVoter && req.user.role !== 'admin') {
      console.error(`User ${voter} is not authorized to vote in election ${election._id}`);
      return res.status(403).json({ 
        message: 'You are not authorized to vote in this election. Please check if you are registered as a voter.' 
      });
    }
    
    // Validate each vote
    for (const vote of votes) {
      const { question: questionId, option: optionId } = vote;
    
      // Find the question
      const question = election.questions.find(q => q._id.toString() === questionId);
      if (!question) {
        return res.status(400).json({ 
          message: `Invalid question ID: ${questionId}` 
        });
      }
      
      // Find the option
      const option = question.options.find(o => o._id.toString() === optionId);
      if (!option) {
      return res.status(400).json({ 
          message: `Invalid option ID: ${optionId} for question: ${questionId}` 
      });
      }
    }
    
    // Find the voter in the election's voters list to get their ID
    console.log('Looking for voter in election.voters:', {
      voterEmail,
      voterId: voter,
      votersList: election.voters
    });
    
    const voterInElection = election.voters.find(v => {
      const emailMatch = v.email?.toLowerCase() === voterEmail?.toLowerCase();
      const idMatch = v._id?.toString() === voter?.toString() || v.toString() === voter?.toString();
      console.log('Voter check:', { v, emailMatch, idMatch });
      return emailMatch || idMatch;
    });
    
    if (!voterInElection) {
      console.error(`Voter not found in election ${electionId} voters list`, {
        voterEmail,
        voterId: voter,
        availableVoters: election.voters.map(v => ({
          _id: v._id?.toString(),
          email: v.email,
          id: v.id,
          toString: v.toString()
        }))
      });
      return res.status(400).json({ 
        success: false,
        message: 'Voter not found in this election. Please contact the administrator.' 
      });
    }
    
    // Prevent double voting - check by both voter ID and email
    const existingVote = await Vote.findOne({
      $and: [
        { election: electionId },
        {
          $or: [
            { voter: voterInElection._id || voterInElection },
            { 'voter.email': voterEmail }
          ]
        }
      ]
    });
    
    if (existingVote) {
      console.error(`User ${voterEmail} has already voted in election ${electionId}`);
      return res.status(400).json({ 
        message: 'You have already voted in this election. Only one vote per user is allowed.' 
      });
    }
    
    try {
      // Create new vote with proper voter identification
      const voteData = {
        election: electionId,
        votes: votes,
        voterEmail: voterEmail
      };
      
      // Handle different voter ID formats
      if (voterInElection._id) {
        voteData.voter = voterInElection._id;
      } else if (voterInElection.id) {
        voteData.voter = voterInElection.id;
      } else if (mongoose.Types.ObjectId.isValid(voterInElection)) {
        voteData.voter = voterInElection;
      } else {
        // If we can't determine a proper ID, use the email as a fallback
        voteData.voter = voterEmail;
      }
      
      console.log('Creating vote with data:', JSON.stringify(voteData, null, 2));
      
      // Create and save the vote in one step
      const vote = await Vote.create(voteData);
      console.log('Vote saved successfully:', vote);
      
      // Update the election's votes array
      await Election.findByIdAndUpdate(
        electionId,
        { $addToSet: { votes: vote._id } },
        { new: true }
      );
      
      return res.status(201).json({
        success: true,
        message: 'Vote recorded successfully',
        voteId: vote._id
      });
    } catch (saveError) {
      console.error('Error saving vote:', {
        message: saveError.message,
        name: saveError.name,
        code: saveError.code,
        keyPattern: saveError.keyPattern,
        keyValue: saveError.keyValue,
        errors: saveError.errors,
        stack: saveError.stack
      });
      
      // Handle duplicate key error (already voted)
      if (saveError.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'You have already voted in this election.'
        });
      }
      
      // Handle validation errors
      if (saveError.name === 'ValidationError') {
        const errors = Object.values(saveError.errors).map(e => e.message);
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors
        });
      }
      
      // For any other error
      return res.status(500).json({
        success: false,
        message: 'Failed to process your vote. Please try again.',
        error: process.env.NODE_ENV === 'development' ? saveError.message : undefined
      });
    }
  } catch (err) {
    console.error('Vote casting error - Full error:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
      code: err.code,
      errors: err.errors,
      request: {
        body: req.body,
        user: req.user,
        params: req.params,
        query: req.query
      }
    });
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    // Handle duplicate key errors
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate vote detected. You have already voted in this election.'
      });
    }
    
    // Handle CastError (invalid ObjectId, etc)
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid ${err.path}: ${err.value}`
      });
    }
    
    // For other errors, send a generic error message
    res.status(500).json({ 
      success: false,
      message: 'Failed to process your vote. Please try again.',
      error: process.env.NODE_ENV === 'development' ? {
        message: err.message,
        stack: err.stack,
        name: err.name
      } : undefined
    });
  }
});

// Get all votes for an election (admin or election creator only)
router.get('/election/:electionId', auth, async (req, res) => {
  try {
    // Find the election first to check permissions
    const election = await Election.findById(req.params.electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }
    
    // Check if user is admin or creator
    const isAdmin = req.user.role === 'admin';
    const isCreator = election.createdBy.toString() === req.user.id;
    
    if (!isAdmin && !isCreator) {
      return res.status(403).json({ message: 'Not authorized to view all votes for this election' });
    }
    
    // Get votes with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const total = await Vote.countDocuments({ election: req.params.electionId });
    
    // Get votes with pagination
    const votes = await Vote.find({ election: req.params.electionId })
      .populate('voter', 'name email')
      .sort({ votedAt: -1 })
      .skip(skip)
      .limit(limit);
    
    res.status(200).json({
      votes,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get voting history for a user (authenticated user or admin only)
router.get('/user/:userId', auth, async (req, res) => {
  try {
    // Check if user is requesting their own voting history or is an admin
    if (req.user.id !== req.params.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this voting history' });
    }
    
    // Get votes with detailed election info
    const votes = await Vote.find({ voter: req.params.userId })
      .populate({
        path: 'election',
        select: 'title description startDate endDate candidates'
      })
      .sort({ votedAt: -1 });
    
    // Format the response to include more details
    const formattedVotes = votes.map(vote => {
      const voteObj = vote.toObject();
      
      // Add election status
      if (voteObj.election) {
        const now = new Date();
        let status = 'upcoming';
        if (now >= voteObj.election.startDate && now <= voteObj.election.endDate) {
          status = 'active';
        } else if (now > voteObj.election.endDate) {
          status = 'past';
        }
        voteObj.election.status = status;
      }
      
      return voteObj;
    });
    
    res.status(200).json(formattedVotes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get current user's voting history
router.get('/me/history', auth, async (req, res) => {
  try {
    // Get votes with detailed election info using voter's email
    const votes = await Vote.find({ voterEmail: req.user.email })
      .populate({
        path: 'election',
        select: 'title description startDate endDate questions status', // Added status to selection
      })
      .sort({ votedAt: -1 });
    
    // Format the response to include more details and resolved vote choices
    const formattedVotes = votes.map(vote => {
      const voteObj = vote.toObject();
      
      // Add election status if not already present
      if (voteObj.election && !voteObj.election.status) {
        const now = new Date();
        let status = 'upcoming';
        if (now >= voteObj.election.startDate && now <= voteObj.election.endDate) {
          status = 'active';
        } else if (now > voteObj.election.endDate) {
          status = 'past';
        }
        voteObj.election.status = status;
      }
      
      // Resolve question and option text for each vote entry
      const resolvedChoices = voteObj.votes.map(singleVote => {
        const question = voteObj.election?.questions.find(q => q._id.equals(singleVote.question));
        const option = question?.options.find(o => o._id.equals(singleVote.option));
        
        return {
          questionId: singleVote.question,
          questionText: question?.text || 'Unknown Question',
          optionId: singleVote.option,
          optionText: option?.text || 'Unknown Option'
        };
      });

      voteObj.resolvedChoices = resolvedChoices;
      return voteObj;
    });
    
    res.status(200).json(formattedVotes);
  } catch (err) {
    console.error('Error fetching voting history:', err);
    res.status(500).json({ message: 'Failed to fetch voting history' });
  }
});

// Check if user has voted in an election
router.get('/check/:electionId', auth, async (req, res) => {
  try {
    const { electionId } = req.params;
    const voterId = req.user.id;
    
    // Check if election exists
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }
    
    // Find if user has already voted
    const vote = await Vote.findOne({ 
      election: electionId, 
      $or: [
        { voter: voterId },
        { 'voter._id': voterId },
        { 'voter.email': req.user.email?.toLowerCase() }
      ]
    });
    
    res.status(200).json({
      success: true,
      hasVoted: !!vote,
      vote: vote || null
    });
  } catch (err) {
    console.error('Error checking vote status:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error checking vote status',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;
