const mongoose = require('mongoose');
const Election = require('./models/Election');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Function to generate voter key - same as frontend
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
  
  // Take first 8 characters for a shorter key
  return hash.substring(0, 8);
}

async function testVoterLogin() {
  try {
    // Get all elections
    const elections = await Election.find({});
    console.log(`Found ${elections.length} elections`);
    
    // Print details of each election
    for (const election of elections) {
      console.log(`\nElection: ${election.title} (ID: ${election._id})`);
      console.log(`Status: ${election.status}`);
      console.log(`Voters: ${election.voters.length}`);
      
      // Print details of each voter
      if (election.voters.length > 0) {
        console.log('\nVoters in this election:');
        election.voters.forEach((voter, i) => {
          const email = voter.email?.toLowerCase();
          const storedKey = voter.voterKey;
          const generatedKey = email ? generateVoterKey(email) : 'N/A';
          
          console.log(`Voter ${i+1}:`);
          console.log(`  Email: ${email}`);
          console.log(`  Stored Key: ${storedKey}`);
          console.log(`  Generated Key: ${generatedKey}`);
          console.log(`  Keys Match: ${storedKey === generatedKey ? 'YES' : 'NO'}`);
        });
      }
    }
  } catch (err) {
    console.error('Error testing voter login:', err);
  } finally {
    mongoose.disconnect();
  }
}

// Run the test
testVoterLogin();
