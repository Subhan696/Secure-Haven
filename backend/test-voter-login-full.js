const mongoose = require('mongoose');
const Election = require('./models/Election');
const jwt = require('jsonwebtoken');
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
  
  // Take first 8 characters and ensure it's padded to 8 characters
  let key = hash.substring(0, 8);
  
  // Pad with zeros if less than 8 characters
  while (key.length < 8) {
    key = '0' + key;
  }
  
  return key;
}

// Simulate the login process
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
      
      // Check if the election is active/live
      const activeStatuses = ['live', 'active', 'Live', 'Active'];
      const isActive = activeStatuses.includes(election.status);
      console.log(`Is election active? ${isActive}`);
      
      // Print details of each voter
      if (election.voters.length > 0) {
        console.log('\nVoters in this election:');
        for (let i = 0; i < election.voters.length; i++) {
          const voter = election.voters[i];
          const email = voter.email?.toLowerCase();
          const storedKey = voter.voterKey;
          const generatedKey = email ? generateVoterKey(email) : 'N/A';
          
          console.log(`Voter ${i+1}:`);
          console.log(`  Email: ${email}`);
          console.log(`  Stored Key: ${storedKey}`);
          console.log(`  Generated Key: ${generatedKey}`);
          console.log(`  Keys Match: ${storedKey === generatedKey ? 'YES' : 'NO'}`);
          
          // Simulate login attempt
          console.log('  Simulating login attempt:');
          
          // Check if voter credentials are valid
          const emailMatch = voter.email.toLowerCase() === email.toLowerCase();
          const keyMatch = voter.voterKey === generatedKey || 
                         (voter.voterKey && generatedKey && 
                          voter.voterKey.toUpperCase() === generatedKey.toUpperCase());
          
          console.log(`    Email match: ${emailMatch}`);
          console.log(`    Key match: ${keyMatch}`);
          
          // Check if election is active
          if (emailMatch && keyMatch) {
            if (isActive) {
              console.log('    Login would SUCCEED - Credentials valid and election is active');
              
              // Create a token for the voter (just like in the actual login route)
              const token = jwt.sign(
                { 
                  id: email,
                  email,
                  role: 'voter',
                  electionId: election._id
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
              );
              
              console.log('    Token would be generated:', token ? 'YES' : 'NO');
            } else {
              console.log(`    Login would FAIL - Election is not active (status: ${election.status})`);
            }
          } else {
            console.log('    Login would FAIL - Invalid credentials');
          }
        }
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
