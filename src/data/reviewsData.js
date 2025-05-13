// Generate a date string for X days ago
const getDateString = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

const reviews = [
  {
    text: "Incredibly smooth process — setting up elections was effortless!",
    stars: 5,
    author: "Maya R.",
    role: "School Admin",
    date: getDateString(2),
    isVerified: true
  },
  {
    text: "Security is top-notch. Our organization fully trusts Secure Haven.",
    stars: 5,
    author: "Alex T.",
    role: "Non-Profit Coordinator",
    date: getDateString(5),
    isVerified: true
  },
  {
    text: "Super easy to use, and the interface is beautiful!",
    stars: 4,
    author: "Jamie K.",
    role: "Club President",
    date: getDateString(8),
    isVerified: true
  },
  {
    text: "User-friendly and very reliable — saved us so much time!",
    stars: 5,
    author: "Chris B.",
    role: "Event Manager",
    date: getDateString(12),
    isVerified: true
  },
  {
    text: "Great support team and smooth voting experience.",
    stars: 5,
    author: "Rina L.",
    role: "Tech Society Lead",
    date: getDateString(15),
    isVerified: true
  }
];

export default reviews;