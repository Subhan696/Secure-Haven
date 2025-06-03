const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Election = require('../models/Election');
const Vote = require('../models/Vote');
const User = require('../models/User');

// Get available elections for the current voter
router.get('/available', auth, async (req, res) => {
  try {
    // Get the current user's email from the token
    const userEmail = req.user.email.toLowerCase();
    
    // Find elections where the current user is a voter and the election is active
    const now = new Date();
    
    const elections = await Election.find({
      'voters.email': userEmail,
      status: { $in: ['live', 'active', 'Live', 'Active'] },
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).select('-voters -candidates -questions -createdAt -updatedAt -__v');
    
    res.status(200).json(elections);
  } catch (err) {
    console.error('Error fetching available elections:', err);
    res.status(500).json({ message: 'Server error while fetching available elections' });
  }
});
const validate = require('../middleware/validate');
const {
  createElectionValidation,
  updateElectionValidation,
  addVotersValidation
} = require('../validations/electionValidations');

// Helper function to generate consistent voter keys
function generateVoterKey(email) {
  // Use a secret salt for additional security
  const salt = 'secure-haven-salt-2024';
  
  // Simple hash function
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
  let key = hash.substring(0, 8);
  
  // Pad with zeros if less than 8 characters
  while (key.length < 8) {
    key = '0' + key;
  }
  
  return key;
}

// Create a new election
router.post('/', auth, async (req, res) => {
  try {
    console.log('Creating election with data:', JSON.stringify(req.body, null, 2));
    console.log('User ID:', req.user.id);
    
    // Extract data from request body
    const { 
      title, 
      description, 
      startDate, 
      endDate, 
      timezone,
      questions,
      voters,
      status
    } = req.body;
    
    console.log('Questions:', JSON.stringify(questions, null, 2));
    console.log('Voters:', JSON.stringify(voters, null, 2));
    
    // Validate required fields
    if (!title || !startDate || !endDate) {
      return res.status(400).json({ message: 'Please provide title, start date, and end date' });
    }
    
    // Set creator to current user
    const createdBy = req.user.id;
    
    // Process voters to match the schema
    const processedVoters = Array.isArray(voters) ? await Promise.all(voters.map(async voter => {
      // If voter is already in the correct format, return it as is
      if (voter && typeof voter === 'object' && voter.name && voter.email) {
        // If voter key is missing, generate a consistent one
        if (!voter.voterKey) {
          voter.voterKey = generateVoterKey(voter.email);
        }
        return voter;
      }
      
      // If voter is just an email string, create a proper voter object
      if (typeof voter === 'string') {
        const email = voter;
        const name = email.split('@')[0]; // Use part before @ as name
        
        // Generate a consistent voter key based on email
        const voterKey = generateVoterKey(email);
        
        return {
          name,
          email,
          voterKey
        };
      }
      return null;
    })).then(results => results.filter(Boolean)) : [];
    
    // Helper function to generate consistent voter keys
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
      
      // Take first 8 characters for a shorter key
      return hash.substring(0, 8);
    }
    
    console.log('Processed voters:', processedVoters);
    
    // Create election with the structure from the frontend
    const electionData = { 
      title, 
      description: description || '',
      startDate, 
      endDate,
      timezone: timezone || 'UTC',
      createdBy,
      questions: questions || [],
      voters: processedVoters,
      status: status || 'draft'
    };
    
    console.log('Final election data to save:', JSON.stringify(electionData, null, 2));
    
    try {
      const election = new Election(electionData);
      const savedElection = await election.save();
      console.log('Election created successfully:', savedElection);
      res.status(201).json({ message: 'Election created', election: savedElection });
    } catch (saveErr) {
      console.error('Error saving election:', saveErr);
      if (saveErr.name === 'ValidationError') {
        // Handle validation errors
        const validationErrors = Object.keys(saveErr.errors).map(field => ({
          field,
          message: saveErr.errors[field].message
        }));
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: validationErrors 
        });
      }
      throw saveErr;
    }
  } catch (err) {
    console.error('Election creation error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get all elections (with optional filtering)
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    // If user is not admin, only show elections they created or are voters in
    if (req.user.role !== 'admin') {
      query = {
        $or: [
          { createdBy: req.user.id },
          { voters: req.user.id }
        ]
      };
    }
    
    // Apply filters if provided
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex }
      ];
    }
    
    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const total = await Election.countDocuments(query);
    
    // Get elections with pagination
    const elections = await Election.find(query)
      .populate('createdBy', 'name email')
      .populate('voters', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    res.status(200).json({
      elections,
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

// Get a specific election by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const election = await Election.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('votes');
      
    console.log('Retrieved election with ID:', req.params.id);
    console.log('Election status:', election ? election.status : 'not found');
    console.log('Voters count:', election ? election.voters.length : 0);
    if (election && election.voters.length > 0) {
      console.log('First few voters:', election.voters.slice(0, 3));
    }
    
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }
    
    // Log the election data before sending it
    console.log('Sending election data with status:', election.status);
    
    // Ensure status is included in the response
    const electionData = election.toObject();
    if (!electionData.status) {
      electionData.status = 'draft'; // Default to draft if status is missing
    }
    
    // Add calculated time-based status as a separate field
    const now = new Date();
    let timeStatus = 'upcoming';
    if (now >= election.startDate && now <= election.endDate) {
      timeStatus = 'active';
    } else if (now > election.endDate) {
      timeStatus = 'past';
    }
    
    // Return election with both original status and calculated timeStatus
    res.status(200).json({
      ...electionData,
      timeStatus
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update an election (admin or creator only)
router.put('/:id', auth, validate(updateElectionValidation), async (req, res) => {
  try {
    // Find the election first to check permissions
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }
    
    // Check if user is admin or creator
    const isAdmin = req.user.role === 'admin';
    const isCreator = election.createdBy.toString() === req.user.id;
    
    if (!isAdmin && !isCreator) {
      return res.status(403).json({ message: 'Not authorized to update this election' });
    }
    
    // Update fields
    const updatedFields = {};
    const allowedFields = ['title', 'description', 'startDate', 'endDate', 'timezone', 'status'];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updatedFields[field] = req.body[field];
      }
    });
    
    // Update the election
    const updatedElection = await Election.findByIdAndUpdate(
      req.params.id,
      { $set: updatedFields },
      { new: true }
    );
    
    res.status(200).json({ message: 'Election updated', election: updatedElection });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete an election (admin or creator only)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Find the election first to check permissions
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }
    
    // Check if user is admin or creator
    const isAdmin = req.user.role === 'admin';
    const isCreator = election.createdBy.toString() === req.user.id;
    
    if (!isAdmin && !isCreator) {
      return res.status(403).json({ message: 'Not authorized to delete this election' });
    }
    
    // Delete the election
    await Election.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: 'Election deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get election results
router.get('/:id/results', auth, async (req, res) => {
  try {
    // Find the election
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }
    
    // Get votes for this election
    const votes = await Vote.find({ election: req.params.id });
    
    // Calculate results
    const results = {};
    
    // Initialize results object with all candidates
    election.candidates.forEach(candidate => {
      results[candidate.name] = 0;
    });
    
    // Count votes for each candidate
    votes.forEach(vote => {
      if (results[vote.candidate] !== undefined) {
        results[vote.candidate]++;
      }
    });
    
    // Return results
    res.status(200).json({
      electionId: election._id,
      title: election.title,
      totalVotes: votes.length,
      results
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add voters to an election (admin or creator only)
router.post('/:id/voters', auth, async (req, res) => {
  try {
    console.log('Adding voter to election:', req.params.id);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    // Find the election first to check permissions
    // Use let instead of const so we can reassign it later
    let election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }
    
    // Check if user is admin or creator
    const isAdmin = req.user.role === 'admin';
    const isCreator = election.createdBy.toString() === req.user.id;
    
    if (!isAdmin && !isCreator) {
      return res.status(403).json({ message: 'Not authorized to update voters for this election' });
    }
    
    // Process the voter data
    let voterToAdd;
    
    // Handle different voter data formats
    if (req.body.email) {
      // Single voter object format
      const email = req.body.email.trim().toLowerCase();
      const name = req.body.name || email.split('@')[0];
      
      // Always generate voter key on the backend to ensure consistency
      const voterKey = generateVoterKey(email);
      console.log('Generated voter key for', email, ':', voterKey);
      
      voterToAdd = { name, email, voterKey };
    } else {
      return res.status(400).json({ message: 'Please provide voter email' });
    }
    
    console.log('Voter to add:', voterToAdd);
    
    // Check if voter already exists - use a more reliable check
    const voterExists = election.voters.some(v => {
      // Normalize email for comparison
      const voterEmail = typeof v === 'object' ? v.email.toLowerCase() : (typeof v === 'string' ? v.toLowerCase() : '');
      return voterEmail === voterToAdd.email.toLowerCase();
    });
    
    if (voterExists) {
      return res.status(400).json({ message: 'Voter already exists in this election' });
    }
    
    // Add the voter to the election - ensure it's properly formatted
    console.log('Before adding voter, election has', election.voters.length, 'voters');
    
    // Ensure voter has all required fields
    const formattedVoter = {
      name: voterToAdd.name || voterToAdd.email.split('@')[0],
      email: voterToAdd.email.toLowerCase(),
      voterKey: voterToAdd.voterKey
    };
    
    console.log('Formatted voter to add:', formattedVoter);
    
    // Save the election with the new voter using findByIdAndUpdate to ensure it's saved
    try {
      // Use findByIdAndUpdate with $addToSet to avoid duplicates
      const updatedElection = await Election.findByIdAndUpdate(
        election._id,
        { $addToSet: { voters: formattedVoter } },
        { new: true, runValidators: true }
      );
      
      if (!updatedElection) {
        console.error('Failed to update election - not found');
        return res.status(404).json({ message: 'Election not found after update attempt' });
      }
      
      console.log('Election updated successfully with new voter');
      console.log('Updated election now has', updatedElection.voters.length, 'voters');
      
      // Update our local reference
      election = updatedElection;
    } catch (saveErr) {
      console.error('Error saving election with new voter:', saveErr);
      return res.status(500).json({ message: 'Error saving voter to database: ' + saveErr.message });
    }
    
    console.log('Updated election voters:', election.voters);
    
    // Return updated election
    res.status(200).json({ 
      message: 'Voter added successfully', 
      voters: election.voters,
      election: election
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Remove a voter from an election (admin or creator only)
router.delete('/:id/voters/:voterEmail', auth, async (req, res) => {
  try {
    console.log('Removing voter from election:', req.params.id);
    console.log('Voter email:', req.params.voterEmail);
    
    // Find the election first to check permissions
    let election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }
    
    // Check if user is admin or creator
    const isAdmin = req.user.role === 'admin';
    const isCreator = election.createdBy.toString() === req.user.id;
    
    if (!isAdmin && !isCreator) {
      return res.status(403).json({ message: 'Not authorized to remove voters from this election' });
    }
    
    const voterEmail = req.params.voterEmail;
    
    // Check if the voter exists in the election
    const voterExists = election.voters.some(v => 
      (typeof v === 'object' && v.email === voterEmail) || 
      (typeof v === 'string' && v === voterEmail)
    );
    
    if (!voterExists) {
      return res.status(404).json({ message: 'Voter not found in this election' });
    }
    
    // Remove voter from election
    election.voters = election.voters.filter(v => {
      if (typeof v === 'object') {
        return v.email !== voterEmail;
      }
      if (typeof v === 'string') {
        return v !== voterEmail;
      }
      return true;
    });
    
    console.log('Updated voters after removal:', election.voters);
    
    await election.save();
    
    // Return updated election
    res.status(200).json({ 
      message: 'Voter removed successfully', 
      voters: election.voters,
      election: election
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update election status (launch/end election) - admin or creator only
router.put('/:id/status', auth, async (req, res) => {
  try {
    console.log('Updating election status:', req.params.id);
    console.log('New status:', req.body.status);
    
    // Find the election first to check permissions
    let election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }
    
    // Check if user is admin or creator
    const isAdmin = req.user.role === 'admin';
    const isCreator = election.createdBy.toString() === req.user.id;
    
    if (!isAdmin && !isCreator) {
      return res.status(403).json({ message: 'Not authorized to update this election status' });
    }
    
    // Validate status
    const { status } = req.body;
    if (!status || !['draft', 'scheduled', 'live', 'ended'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be one of: draft, scheduled, live, ended' });
    }
    
    // Update election status
    election.status = status;
    
    // If launching election, make sure it has questions and voters
    if (status === 'live' || status === 'scheduled') {
      if (!election.questions || election.questions.length === 0) {
        return res.status(400).json({ message: 'Cannot launch election without questions' });
      }
      
      if (!election.voters || election.voters.length === 0) {
        return res.status(400).json({ message: 'Cannot launch election without voters' });
      }
      
      // Validate election timing
      const now = new Date();
      const startDate = new Date(election.startDate);
      const endDate = new Date(election.endDate);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ message: 'Invalid start or end date' });
      }
      
      if (endDate <= startDate) {
        return res.status(400).json({ message: 'End date must be after start date' });
      }
      
      // For live elections, check if the current time is within the election period
      if (status === 'live') {
        if (now > endDate) {
          return res.status(400).json({ message: 'Cannot launch election that has already ended' });
        }
      }
    }
    
    // Save the updated election
    await election.save();
    
    // Return updated election
    res.status(200).json({
      message: `Election ${status === 'live' ? 'launched' : status === 'ended' ? 'ended' : 'updated'} successfully`,
      election: election
    });
  } catch (err) {
    console.error('Error updating election status:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
