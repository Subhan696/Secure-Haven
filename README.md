# Secure Haven - Online Voting Platform

Secure Haven is a comprehensive online voting platform with robust user authentication, election management, and secure voting capabilities. The platform consists of a React frontend and an Express.js backend with MongoDB database.

## 🚀 Quick Start for Friends

### **What You Need:**
- **Node.js** - [Download here](https://nodejs.org/)
- **MongoDB Compass** - [Download here](https://www.mongodb.com/try/download/compass)

### **Simple Setup (5 minutes):**

1. **Install dependencies:**
   ```bash
   cd backend && npm install
   cd .. && npm install
   ```

2. **Set up MongoDB:**
   - Open MongoDB Compass
   - Connect to: `mongodb://localhost:27017`
   - Create database: `secure_haven`

3. **Create `.env` file in `backend` folder:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/secure_haven
   PORT=5001
   JWT_SECRET=your_secret_key_here
   NODE_ENV=development
   ```

4. **Start the application:**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev
   
   # Terminal 2 - Frontend
   npm run dev
   ```

5. **Open:** `http://localhost:5173`

**That's it!** 🎉

## 📋 Detailed Setup Guide

### Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (version 16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB Compass** - [Download here](https://www.mongodb.com/try/download/compass)
- **Git** - [Download here](https://git-scm.com/)

### 📋 Installation Steps

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd secure-haven
```

#### 2. Set Up the Backend

Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

#### 3. Configure Environment Variables

Create a `.env` file in the `backend` directory with the following content:

**For Local MongoDB:**
```env
# MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/secure_haven

# Server port
PORT=5001

# JWT secret for authentication (use a strong random string in production)
JWT_SECRET=your_secure_jwt_secret_key_here

# Environment mode
NODE_ENV=development

# Rate limiting settings
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX_REQUESTS=10
```

**Important**: Replace `your_secure_jwt_secret_key_here` with a strong, random string for security.

#### 4. Set Up the Frontend

Navigate back to the root directory and install frontend dependencies:
```bash
cd ..
npm install
```

### 🏃‍♂️ Running the Application

#### Option 1: Run Both Services Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
The backend will start on `http://localhost:5001`

**Terminal 2 - Frontend:**
```bash
npm run dev
```
The frontend will start on `http://localhost:5173`

#### Option 2: Run Frontend Only (if backend is already running)
```bash
npm run dev
```

### 🌐 Accessing the Application

Once both services are running:
- **Frontend**: Open your browser and go to `http://localhost:5173`
- **Backend API**: Available at `http://localhost:5001`

### 📊 Database Setup

The application will automatically create the necessary database and collections when you first run it. Make sure MongoDB is running on your system.

#### MongoDB Installation (if not already installed):

**Windows:**
1. Download MongoDB Community Server from the official website
2. Install following the installation wizard
3. Start MongoDB service

**macOS (using Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu):**
```bash
sudo apt update
sudo apt install mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### 🔧 Available Scripts

#### Frontend (Root Directory)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

#### Backend (Backend Directory)
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### 🏗️ Project Structure

```
secure-haven/
├── backend/                 # Express.js backend
│   ├── jobs/               # Background jobs
│   ├── middleware/         # Express middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── validations/       # Input validation
│   ├── server.js          # Main server file
│   └── package.json       # Backend dependencies
├── src/                   # React frontend
│   ├── components/        # Reusable components
│   ├── pages/            # Page components
│   ├── context/          # React context
│   ├── utils/            # Utility functions
│   └── main.jsx          # App entry point
├── public/               # Static assets
└── package.json          # Frontend dependencies
```

### 🔐 Default Admin Account

After setting up the database, you can create an admin account through the signup process or directly in the database. The platform supports two user roles:
- **Admin**: Can create and manage elections
- **Voter**: Can participate in elections

### 🚨 Troubleshooting

#### Common Issues:

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check the `MONGODB_URI` in your `.env` file
   - Verify MongoDB is accessible on the specified port

2. **Port Already in Use**
   - Change the port in the `.env` file
   - Kill processes using the default ports

3. **CORS Errors**
   - Ensure the frontend URL matches the CORS configuration in `server.js`
   - Check that both services are running

4. **JWT Errors**
   - Verify the `JWT_SECRET` is set in your `.env` file
   - Ensure the secret is consistent across restarts

### 📝 Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `MONGODB_URI` | MongoDB connection string | - | Yes |
| `PORT` | Backend server port | 5001 | No |
| `JWT_SECRET` | Secret key for JWT tokens | - | Yes |
| `NODE_ENV` | Environment mode | development | No |
| `RATE_LIMIT_WINDOW_MS` | Rate limiting window | 900000 | No |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 | No |
| `AUTH_RATE_LIMIT_MAX_REQUESTS` | Max auth requests per window | 10 | No |

### 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### 📄 License

This project is licensed under the MIT License.

---

**Need Help?** If you encounter any issues, please check the troubleshooting section above or create an issue in the repository.
