const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Election = require('../models/Election');
const Vote = require('../models/Vote');
const User = require('../models/User');
const mongoose = require('mongoose');
const { sendVoterKeyEmail } = require('../utils/mailer');

// Helper function to update election status
async function updateElectionStatus(election) {
  const now = new Date();
  let newStatus = election.status;

  console.log(`[updateElectionStatus] Processing election: ${election.title} (${election._id})`);
  console.log(`[updateElectionStatus] Initial status: ${election.status}`);
  console.log(`[updateElectionStatus] Current time: ${now.toISOString()}`);
  console.log(`[updateElectionStatus] Start Date: ${election.startDate ? new Date(election.startDate).toISOString() : 'N/A'}`);
  console.log(`[updateElectionStatus] End Date: ${election.endDate ? new Date(election.endDate).toISOString() : 'N/A'}`);

  // Convert date strings to Date objects for comparison
  const startDate = new Date(election.startDate);
  const endDate = new Date(election.endDate);

  // Only allow automatic transitions if the election is not explicitly set to draft
  // If the election was previously live and is now draft, respect the draft status.
  if (election.status !== 'draft') {
    console.log(`[updateElectionStatus] Election is NOT draft, proceeding with automatic checks.`);
    // Check for transition from draft/scheduled to live
    if (election.status === 'draft' || election.status === 'scheduled') {
      if (now >= startDate && now < endDate) {
        newStatus = 'live';
        console.log(`[updateElectionStatus] Transitioning from ${election.status} to LIVE (now >= startDate && now < endDate)`);
      } else if (now < startDate) {
        newStatus = 'scheduled';
        console.log(`[updateElectionStatus] Transitioning from ${election.status} to SCHEDULED (now < startDate)`);
      }
    }

    // Check for transition from live to ended/completed
    if (now >= endDate && (newStatus === 'live' || newStatus === 'scheduled')) {
      console.log(`[updateElectionStatus] Checking for ENDED/COMPLETED transition (now >= endDate).`);
      const voteCount = await Vote.countDocuments({ election: election._id });
      console.log(`[updateElectionStatus] Vote count for ${election._id}: ${voteCount}`);
      if (voteCount > 0) {
        newStatus = 'completed';
        console.log(`[updateElectionStatus] Transitioning to COMPLETED (votes > 0)`);
      } else {
        newStatus = 'ended';
        console.log(`[updateElectionStatus] Transitioning to ENDED (no votes)`);
      }
    }
  } else {
    console.log(`[updateElectionStatus] Election is already DRAFT. Skipping automatic status checks.`);
  }

  // Update if status has changed
  if (election.status !== newStatus) {
    console.log(`[updateElectionStatus] Election ${election.title} (${election._id}) status changing from ${election.status} to ${newStatus} (saving to DB)`);
    election.status = newStatus;
    await election.save();
    console.log(`[updateElectionStatus] Election ${election.title} (${election._id}) status updated to ${newStatus} in DB.`);
  } else {
    console.log(`[updateElectionStatus] No status change needed for ${election.title} (${election._id}). Status remains ${election.status}.`);
  }

  return election;
}

// Get available elections for voters
router.get('/available', auth, async (req, res) => {
  try {
    // For voters, only show elections they are a voter in AND are 'live'
    const userEmail = req.user.email;

    let elections = await Election.find({
      'voters.email': userEmail,
      status: 'live' // Only show live elections on the dashboard
    })
      .populate('createdBy', 'name email')
      .sort({ startDate: 1 });

    // Update statuses for fetched elections
    elections = await Promise.all(
      elections.map(election => updateElectionStatus(election))
    );

    // For each election, check if the current user has voted
    const electionsWithVoteStatus = await Promise.all(elections.map(async (election) => {
      const existingVote = await Vote.findOne({
        election: election._id,
        voterEmail: userEmail
      });
      const hasVoted = !!existingVote;
      const electionObject = election.toObject();
      electionObject.hasVoted = hasVoted;

      // START: Add vote calculation for each election in the list
      const allVotesForElection = await Vote.find({ election: election._id });
      const uniqueVotersCount = new Set(allVotesForElection.map(vote => vote.voterEmail)).size;
      const totalRegisteredVoters = election.voters.length;
      const participationPercentage = totalRegisteredVoters > 0 ? (uniqueVotersCount / totalRegisteredVoters) * 100 : 0;

      const questionsWithResults = election.questions.map(question => {
        const optionsWithResults = question.options.map(option => {
          let voteCount = 0;
          allVotesForElection.forEach(userVote => {
            userVote.votes.forEach(singleVote => {
              if (singleVote.question.equals(question._id) && singleVote.option.equals(option._id)) {
                voteCount++;
              }
            });
          });
          return { ...option.toObject(), voteCount };
        });
        return { ...question.toObject(), options: optionsWithResults };
      });

      electionObject.totalVotes = allVotesForElection.length; // Total ballots cast
      electionObject.totalRegisteredVoters = totalRegisteredVoters;
      electionObject.voterParticipation = {
        totalVoters: totalRegisteredVoters,
        votedVoters: uniqueVotersCount,
        percentage: participationPercentage,
      };
      electionObject.questions = questionsWithResults; // Attach results to questions
      // END: Add vote calculation for each election in the list

      return electionObject;
    }));

    res.status(200).json({
      elections: electionsWithVoteStatus
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
    
    // After processing voters, process questions/options to ensure each option is an object with _id and text
    const processedQuestions = Array.isArray(questions) ? questions.map(q => {
      // If options are strings, convert to objects with unique _id and text
      const processedOptions = Array.isArray(q.options) ? q.options.map(opt => {
        if (typeof opt === 'object' && opt.text && opt._id) {
          return opt;
        }
        // If already an object but missing _id/text, fix it
        if (typeof opt === 'object') {
          return {
            _id: opt._id || new mongoose.Types.ObjectId(),
            text: opt.text || opt.name || opt.value || String(opt)
          };
        }
        // If string, convert
        return {
          _id: new mongoose.Types.ObjectId(),
          text: opt
        };
      }) : [];
      return {
        ...q,
        options: processedOptions
      };
    }) : [];
    
    console.log('Processed voters:', processedVoters);
    
    // Create election with the structure from the frontend
    const electionData = { 
      title, 
      description: description || '',
      startDate, 
      endDate,
      timezone: timezone || 'UTC',
      createdBy,
      questions: processedQuestions,
      voters: processedVoters,
      status: status || 'draft'
    };
    
    console.log('Final election data to save:', JSON.stringify(electionData, null, 2));
    
    try {
      const election = new Election(electionData);
      const savedElection = await election.save();
      console.log('Election created successfully:', savedElection);
      
      // Emit event
      req.app.get('io').emit('electionListUpdated');

      // Send voter key emails to all voters
      try {
        if (Array.isArray(savedElection.voters)) {
          for (const voter of savedElection.voters) {
            if (voter.email && voter.voterKey) {
              await sendVoterKeyEmail(voter.email, voter.voterKey);
            }
          }
        }
      } catch (emailErr) {
        console.error('Failed to send one or more voter key emails:', emailErr);
        // Optionally, you can return a warning in the response
      }

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

    if (req.user.role === 'admin') {
      // Only show elections created by this admin
      query = { createdBy: req.user.id };
    } else {
      // For voters, show elections they are a voter in
      query = { 'voters.email': req.user.email };
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
    let elections = await Election.find(query)
      .populate('createdBy', 'name email')
      .populate('voters', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Update statuses for fetched elections
    elections = await Promise.all(
      elections.map(election => updateElectionStatus(election))
    );

    // For each election, check if the current user has voted
    const userEmail = req.user.email;
    const electionsWithVoteStatus = await Promise.all(elections.map(async (election) => {
      const existingVote = await Vote.findOne({
        election: election._id,
        voterEmail: userEmail
      });
      const hasVoted = !!existingVote;
      const electionObject = election.toObject();
      electionObject.hasVoted = hasVoted;

      // START: Add vote calculation for each election in the list
      const allVotesForElection = await Vote.find({ election: election._id });
      const uniqueVotersCount = new Set(allVotesForElection.map(vote => vote.voterEmail)).size;
      const totalRegisteredVoters = election.voters.length;
      const participationPercentage = totalRegisteredVoters > 0 ? (uniqueVotersCount / totalRegisteredVoters) * 100 : 0;

      const questionsWithResults = election.questions.map(question => {
        const optionsWithResults = question.options.map(option => {
          let voteCount = 0;
          allVotesForElection.forEach(userVote => {
            userVote.votes.forEach(singleVote => {
              if (singleVote.question.equals(question._id) && singleVote.option.equals(option._id)) {
                voteCount++;
              }
            });
          });
          return { ...option.toObject(), voteCount };
        });
        return { ...question.toObject(), options: optionsWithResults };
      });

      electionObject.totalVotes = allVotesForElection.length; // Total ballots cast
      electionObject.totalRegisteredVoters = totalRegisteredVoters;
      electionObject.voterParticipation = {
        totalVoters: totalRegisteredVoters,
        votedVoters: uniqueVotersCount,
        percentage: participationPercentage,
      };
      electionObject.questions = questionsWithResults; // Attach results to questions
      // END: Add vote calculation for each election in the list

      return electionObject;
    }));

    res.status(200).json({
      elections: electionsWithVoteStatus,
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
    const electionId = req.params.id;
    const election = await Election.findById(electionId)
      .populate('createdBy', 'name email')
      .populate('voters', 'name email');

    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    // Update status for the fetched election
    const updatedElection = await updateElectionStatus(election);

    // Check if the current user has voted in this election
    const userEmail = req.user.email;
    const existingVote = await Vote.findOne({
      election: electionId,
      voterEmail: userEmail
    });

    const hasVoted = !!existingVote;

    // Fetch all votes for this election to calculate results
    const allVotesForElection = await Vote.find({ election: electionId });

    // Get unique voters who have cast votes
    const uniqueVoters = new Set(allVotesForElection.map(vote => vote.voterEmail));
    const totalVoters = updatedElection.voters.length;
    const voterParticipation = totalVoters > 0 ? (uniqueVoters.size / totalVoters) * 100 : 0;

    // Calculate vote counts for each option within each question
    const questionsWithResults = updatedElection.questions.map(question => {
      const optionsWithResults = question.options.map(option => {
        let voteCount = 0;
        allVotesForElection.forEach(userVote => {
          userVote.votes.forEach(singleVote => {
            if (singleVote.question.equals(question._id) && singleVote.option.equals(option._id)) {
              voteCount++;
            }
          });
        });
        return { ...option.toObject(), voteCount };
      });
      return { ...question.toObject(), options: optionsWithResults };
    });

    // Get voter details with their votes
    const voterDetails = await Promise.all(updatedElection.voters.map(async (voter) => {
      const voterVote = allVotesForElection.find(vote => vote.voterEmail === voter.email);
      const resolvedChoices = voterVote ? voterVote.votes.map(singleVote => {
        const question = updatedElection.questions.find(q => q._id.equals(singleVote.question));
        const option = question?.options.find(o => o._id.equals(singleVote.option));
        return {
          questionId: singleVote.question,
          questionText: question?.text || 'Unknown Question',
          optionId: singleVote.option,
          optionText: option?.text || 'Unknown Option'
        };
      }) : [];
      
      return {
        ...voter.toObject(),
        hasVoted: !!voterVote,
        votedAt: voterVote?.votedAt,
        choices: resolvedChoices
      };
    }));

    // Add hasVoted status, processed questions, and voter details to the election object
    const electionWithVoteStatus = updatedElection.toObject();
    electionWithVoteStatus.hasVoted = hasVoted;
    electionWithVoteStatus.questions = questionsWithResults;
    electionWithVoteStatus.voterDetails = voterDetails;
    electionWithVoteStatus.voterParticipation = {
      totalVoters,
      votedVoters: uniqueVoters.size,
      percentage: voterParticipation
    };
    electionWithVoteStatus.totalVotes = allVotesForElection.length;

    res.status(200).json(electionWithVoteStatus);
  } catch (err) {
    console.error('Error fetching election by ID:', err);
    res.status(500).json({ message: 'Server error' });
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

    // Define states where editing is NOT allowed for details
    const nonEditableStates = ['live', 'completed'];

    // Check if the request is *only* trying to revert status to 'draft'
    const isRevertingToDraft = Object.keys(req.body).length === 1 && req.body.status === 'draft';
    
    // If the election is in a non-editable state AND it's not a request to revert to draft,
    // AND there are other fields being updated (not just status)
    if (nonEditableStates.includes(election.status) && !isRevertingToDraft) {
        const nonStatusFields = Object.keys(req.body).filter(key => key !== 'status');
        if (nonStatusFields.length > 0) {
            return res.status(403).json({ message: 'Election settings can only be changed when the election is in draft, scheduled, or ended status.' });
        }
    }

    // Check if questions are being modified and if there are existing votes
    if (req.body.questions) {
      // Check if there are any existing votes for this election
      const existingVotes = await Vote.findOne({ election: req.params.id });
      
      if (existingVotes) {
        // Compare the new questions with existing questions to detect option changes
        const hasOptionChanges = req.body.questions.some((newQuestion, index) => {
          const existingQuestion = election.questions[index];
          if (!existingQuestion) return true; // New question added
          
          // Check if question text changed
          if (newQuestion.text !== existingQuestion.text) return true;
          
          // Check if options changed (compare by text and count)
          if (newQuestion.options.length !== existingQuestion.options.length) return true;
          
          // Check if any option text changed
          const existingOptionTexts = existingQuestion.options.map(opt => opt.text).sort();
          const newOptionTexts = newQuestion.options.map(opt => opt.text).sort();
          
          return !existingOptionTexts.every((text, i) => text === newOptionTexts[i]);
        });
        
        if (hasOptionChanges) {
          return res.status(400).json({ 
            message: 'Cannot modify questions or options after voting has started. This would invalidate existing votes and compromise data integrity. Please revert the election to draft status first if you need to make changes.',
            code: 'VOTES_EXIST'
          });
        }
        }
    }
    
    // Update fields
    const updatedFields = {};
    const allowedFields = ['title', 'description', 'startDate', 'endDate', 'timezone', 'status', 'questions', 'voters'];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'questions') {
          // Process questions to ensure proper format
          const processedQuestions = req.body.questions.map(q => {
            // Process options to ensure proper format
            const processedOptions = q.options.map(opt => {
              if (typeof opt === 'object' && opt.text && opt._id) {
                return opt;
              }
              // If already an object but missing _id/text, fix it
              if (typeof opt === 'object') {
                return {
                  _id: opt._id || new mongoose.Types.ObjectId(),
                  text: opt.text || opt.name || opt.value || String(opt)
                };
              }
              // If string, convert
              return {
                _id: new mongoose.Types.ObjectId(),
                text: opt
              };
            });
            return {
              ...q,
              options: processedOptions
            };
          });
          updatedFields[field] = processedQuestions;
        } else if (field === 'voters') {
          // Only allow direct voter updates if the voters array is explicitly provided and it's not a bulk upload
          // This is mostly for the individual add/edit/delete from settings page
          updatedFields[field] = req.body[field];
        } else {
          updatedFields[field] = req.body[field];
        }
      }
    });
    
    console.log('Updating election with fields:', JSON.stringify(updatedFields, null, 2));
    
    // Update the election
    const updatedElection = await Election.findByIdAndUpdate(
      req.params.id,
      { $set: updatedFields },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');
    
    if (!updatedElection) {
      return res.status(404).json({ message: 'Election not found after update' });
    }
    
    console.log('Election updated successfully:', updatedElection);
    
    // Emit event
    req.app.get('io').emit('electionListUpdated');
    
    res.status(200).json({ message: 'Election updated', election: updatedElection });
  } catch (err) {
    console.error('Error updating election:', err);
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
    
    // Emit event
    req.app.get('io').emit('electionListUpdated');
    
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

    // Send voter key email after successful addition
    try {
      await sendVoterKeyEmail(formattedVoter.email, formattedVoter.voterKey);
    } catch (emailErr) {
      console.error('Failed to send voter key email:', emailErr);
      // Optionally, you can return a warning in the response
    }
    
    console.log('Updated election voters:', election.voters);
    
    // Emit event
    req.app.get('io').emit('electionListUpdated');
    
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

// Delete a voter from an election
router.delete('/:id/voters/:voterEmail', auth, async (req, res) => {
  try {
    const { id: electionId, voterEmail } = req.params;
    
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }
    
    // Authorization: only creator or admin can remove voters
    if (election.createdBy.toString() !== req.user.id) {
      const user = await User.findById(req.user.id);
      if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to remove voters from this election' });
    }
    }

    // Prevent removal for live/completed elections
    if (election.status !== 'draft' && election.status !== 'scheduled') {
      return res.status(400).json({ message: `Cannot remove voters from an election that is ${election.status}.` });
    }
    
    // Check if the voter has already voted
    const existingVote = await Vote.findOne({ election: electionId, voterEmail: voterEmail });
    if (existingVote) {
      return res.status(400).json({ message: 'Cannot remove a voter who has already cast a vote.' });
    }

    const voterExists = election.voters.some(v => 
      v.email.toLowerCase() === voterEmail.toLowerCase()
    );
    
    if (!voterExists) {
      return res.status(404).json({ message: 'Voter not found in this election' });
    }
    
    // Remove voter from election
    election.voters = election.voters.filter(v =>
      v.email.toLowerCase() !== voterEmail.toLowerCase()
    );

    await election.save();

    // Emit event
    req.app.get('io').emit('electionListUpdated');

    res.status(200).json({
      message: 'Voter removed successfully',
      voters: election.voters,
      election: election
    });
  } catch (err) {
    console.error('Error removing voter:', err);
    res.status(500).json({ message: 'Server error while removing voter' });
  }
});

// Update a voter's details (e.g., email)
router.put('/:id/voters/:voterId', auth, async (req, res) => {
  const { id: electionId, voterId } = req.params;
  const { newEmail } = req.body;

  if (!newEmail || !newEmail.trim()) {
    return res.status(400).json({ message: 'New email is required' });
  }

  const trimmedEmail = newEmail.trim().toLowerCase();

  try {
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    // Authorization: only creator or admin can edit
    if (election.createdBy.toString() !== req.user.id) {
      const user = await User.findById(req.user.id);
      if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to update voters for this election' });
      }
    }
    
    // Prevent edits after election has started
    if (election.status !== 'draft' && election.status !== 'scheduled') {
      return res.status(400).json({ message: `Cannot update voters for an election that is ${election.status}.` });
      }

    // Check if the new email already exists in the voter list (for a different voter)
    const existingVoterWithNewEmail = election.voters.find(v => v.email === trimmedEmail && v._id.toString() !== voterId);
    if (existingVoterWithNewEmail) {
      return res.status(409).json({ message: 'A voter with this email already exists in the election.' });
    }

    // Find the voter to update
    const voterToUpdate = election.voters.find(v => v._id.toString() === voterId);
    if (!voterToUpdate) {
      return res.status(404).json({ message: 'Voter not found in this election' });
    }

    // Check if the voter has already voted
    const existingVote = await Vote.findOne({ election: electionId, voterEmail: voterToUpdate.email });
    if (existingVote) {
      return res.status(400).json({ message: 'Cannot update a voter who has already cast a vote.' });
    }

    // Update voter details
    voterToUpdate.email = trimmedEmail;
    voterToUpdate.name = trimmedEmail.split('@')[0]; // Also update name for consistency
    
    await election.save();
    
    // Emit event
    req.app.get('io').emit('electionListUpdated');

    res.status(200).json({ 
      message: 'Voter updated successfully',
      voters: election.voters,
    });

  } catch (err) {
    console.error('Error updating voter:', err);
    res.status(500).json({ message: 'Server error while updating voter' });
  }
});

// Launch an election
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
    const { status: requestedStatus } = req.body;
    if (!requestedStatus || !['draft', 'scheduled', 'live', 'ended'].includes(requestedStatus)) {
      return res.status(400).json({ message: 'Invalid status. Must be one of: draft, scheduled, live, ended' });
    }

    // Handle explicit request to set status to 'draft'
    if (requestedStatus === 'draft') {
      console.log(`Backend: Explicit request to set election ${election._id} to draft from ${election.status}.`);
      election.status = 'draft';
      await election.save();
      console.log(`Backend: Election ${election._id} successfully saved as draft.`);
      
      // Emit event
      req.app.get('io').emit('electionListUpdated');

      return res.status(200).json({
        message: 'Election status set to Draft successfully',
        election: election
      });
    }

    // For 'live' or 'scheduled' requests, perform validations and potential overrides
    let finalStatusToSet = requestedStatus; // Initialize with requested status

    if (requestedStatus === 'live' || requestedStatus === 'scheduled') {
      if (!election.questions || election.questions.length === 0) {
        console.log('Backend: Cannot launch election without questions.');
        return res.status(400).json({ message: 'Cannot launch election without questions' });
      }

      if (!election.voters || election.voters.length === 0) {
        console.log('Backend: Cannot launch election without voters.');
        return res.status(400).json({ message: 'Cannot launch election without voters' });
      }

      // Validate election timing
      const now = new Date();
      const startDate = new Date(election.startDate);
      const endDate = new Date(election.endDate);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.log('Backend: Invalid start or end date.');
        return res.status(400).json({ message: 'Invalid start or end date' });
      }

      if (endDate <= startDate) {
        console.log('Backend: End date must be after start date.');
        return res.status(400).json({ message: 'End date must be after start date' });
      }

      // Special handling for requested 'live' status
      if (requestedStatus === 'live') {
        if (now > endDate) {
          console.log('Backend: Cannot launch election that has already ended.');
          return res.status(400).json({ message: 'Cannot launch election that has already ended' });
        }
        // If requested to go live but start date is in future, change to scheduled
        if (now < startDate) {
          console.log('Backend: Overriding requested live status to scheduled as start date is in future.');
          finalStatusToSet = 'scheduled';
        }
      }
    }

    // Set the election status based on validations/overrides (for live/scheduled/ended requests)
    console.log(`Backend: Setting election ${election._id} status to ${finalStatusToSet}.`);
    election.status = finalStatusToSet;
    await election.save();
    console.log(`Backend: Election ${election._id} successfully saved with status ${finalStatusToSet}.`);
    
    // Emit event
    req.app.get('io').emit('electionListUpdated');

    res.status(200).json({
      message: `Election ${finalStatusToSet === 'live' ? 'launched' : finalStatusToSet === 'ended' ? 'ended' : 'updated'} successfully`,
      election: election
    });
  } catch (err) {
    console.error('Error updating election status:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
