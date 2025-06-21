require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));
app.use(express.json());

// Connect to MongoDB with improved error handling
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    // Exit process with failure if unable to connect to database
    process.exit(1);
  }
};

// Call the connect function
connectDB();

// Rate limiting middleware to prevent brute force attacks
const rateLimit = require('express-rate-limit');

// Get rate limiting settings from environment variables
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000; // 15 minutes default
const RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100; // 100 requests default
const AUTH_RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS) || 10; // 10 requests default

// Apply rate limiting to all requests
const apiLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX_REQUESTS,
  message: `Too many requests from this IP, please try again after ${Math.round(RATE_LIMIT_WINDOW_MS / 60000)} minutes`
});

// Apply stricter rate limiting to authentication routes
const authLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: AUTH_RATE_LIMIT_MAX_REQUESTS,
  message: `Too many authentication attempts from this IP, please try again after ${Math.round(RATE_LIMIT_WINDOW_MS / 60000)} minutes`
});

// Apply global rate limiting if not in development mode
if (process.env.NODE_ENV !== 'development') {
  app.use(apiLimiter);
}

// API routes with rate limiting
app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);
app.use('/api/password-reset', authLimiter);

// Regular API routes
app.use('/api/users', require('./routes/user'));
app.use('/api/elections', require('./routes/election'));
app.use('/api/votes', require('./routes/vote'));
app.use('/api/reviews', require('./routes/review'));
app.use('/api/password-reset', require('./routes/passwordReset'));
app.use('/api/contact', require('./routes/contact'));

// Sample route
app.get('/', (req, res) => {
  res.send('Express backend is running!');
});

// 404 handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// Import the election status updater job
const { updateElectionStatuses } = require('./jobs/electionStatusUpdater');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
app.set('io', io);

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Run the election status updater immediately on startup
  updateElectionStatuses();
  
  // Then run it every 5 minutes
  setInterval(updateElectionStatuses, 5 * 60 * 1000);
  console.log('Election status updater job scheduled to run every 5 minutes');
});

module.exports = { app, server, io };
