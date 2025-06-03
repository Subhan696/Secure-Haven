const Election = require('../models/Election');
const Vote = require('../models/Vote');

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
