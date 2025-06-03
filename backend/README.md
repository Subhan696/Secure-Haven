# Secure Haven Backend

Secure Haven is a secure online voting platform with robust user authentication, election management, and voting capabilities. This repository contains the Express.js backend API that powers the Secure Haven platform.

## Features

- **User Authentication**: Secure JWT-based authentication system
- **Role-Based Access Control**: Admin and voter role separation
- **Election Management**: Create, update, and manage elections
- **Voting System**: Secure and private voting mechanism
- **Results Calculation**: Automatic vote tallying and results
- **User Reviews**: Platform feedback and rating system
- **Password Reset**: Secure password recovery workflow

## Technology Stack

- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: JSON Web Tokens for authentication
- **bcryptjs**: Password hashing
- **express-validator**: Input validation
- **express-rate-limit**: API rate limiting

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   # MongoDB connection string
   MONGODB_URI=mongodb://localhost:27017/secure_haven
   
   # Server port
   PORT=5001
   
   # JWT secret for authentication (use a strong random string in production)
   JWT_SECRET=your_secure_jwt_secret_key
   
   # Environment mode (development or production)
   NODE_ENV=development
   
   # Rate limiting settings
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   AUTH_RATE_LIMIT_MAX_REQUESTS=10
   ```

## Running the Server
   - For production:
     ```bash
     npm start
     ```

The server will start on the port specified in `.env` (default: 5000).

## Project Structure

- `server.js` — Main entry point
- `.env` — Environment variables (MongoDB URI, port)
- `routes/` — API route handlers (to be added)
- `models/` — Mongoose models (to be added)

## Example Request

GET `http://localhost:5000/`

Should return:
```
Express backend is running!
```
