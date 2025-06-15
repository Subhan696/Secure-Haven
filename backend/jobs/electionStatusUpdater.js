const Election = require('../models/Election');
const Vote = require('../models/Vote');
const mongoose = require('mongoose');

/**
 * Ensures election options are in the correct format { _id, text }
 * @param {Object} election - The election document
 */
function ensureCorrectOptionsFormat(election) {
  if (!election.questions || !Array.isArray(election.questions)) return;

  election.questions.forEach(question => {
    if (!question.options || !Array.isArray(question.options)) return;

    question.options = question.options.map(option => {
      // If option is already in correct format, return as is
      if (option && typeof option === 'object' && option.text) {
        return option;
      }

      // If option is a string or malformed object, convert to correct format
      const text = typeof option === 'string' ? option : 
                  (option && typeof option === 'object' && option.value) ? option.value :
                  JSON.stringify(option);

      return {
        _id: new mongoose.Types.ObjectId(),
        text: text
      };
    });
  });
}

/**
 * Updates election statuses based on time and votes
 * - Elections past their end date with votes -> 'completed'
 * - Elections past their end date with no votes -> 'ended'
 */
async function updateElectionStatuses() {
  try {
    console.log('Running election status update job...');
    const now = new Date();
    
    // Find all live elections that have passed their end date
    const expiredElections = await Election.find({
      status: 'live',
      endDate: { $lt: now }
    });
    
    console.log(`Found ${expiredElections.length} expired elections to update`);
    
    // Process each expired election
    for (const election of expiredElections) {
      // Ensure options are in correct format before any save operation
      ensureCorrectOptionsFormat(election);

      // Check if any votes were cast
      const voteCount = await Vote.countDocuments({ election: election._id });
      
      // Set status based on vote count
      const newStatus = voteCount > 0 ? 'completed' : 'ended';
      
      console.log(`Updating election ${election._id} from 'live' to '${newStatus}' (${voteCount} votes)`);
      
      // Update the election status
      election.status = newStatus;
      await election.save();
    }
    
    console.log('Election status update job completed');
  } catch (error) {
    console.error('Error updating election statuses:', error);
  }
}

module.exports = { updateElectionStatuses };
