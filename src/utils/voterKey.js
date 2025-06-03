// Function to generate a consistent key for a given email
export const generateVoterKey = (email) => {
  // Use a secret salt for additional security
  const salt = 'secure-haven-salt-2024';
  
  // Create a simple hash function since crypto is not available in browser
  const hashString = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).toUpperCase();
  };
  
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
};

// Function to get or create voter key
export const getVoterKey = (email) => {
  // Get existing voter keys from localStorage
  const voterKeys = JSON.parse(localStorage.getItem('voterKeys') || '{}');
  
  // If key exists for this email, return it
  if (voterKeys[email]) {
    return voterKeys[email];
  }
  
  // Generate new key
  const newKey = generateVoterKey(email);
  
  // Save to localStorage
  voterKeys[email] = newKey;
  localStorage.setItem('voterKeys', JSON.stringify(voterKeys));
  
  return newKey;
};

// Function to get all voter keys
export const getAllVoterKeys = () => {
  return JSON.parse(localStorage.getItem('voterKeys') || '{}');
};

// Function to verify a voter key
export const verifyVoterKey = (email, key) => {
  const voterKeys = JSON.parse(localStorage.getItem('voterKeys') || '{}');
  return voterKeys[email] === key;
}; 