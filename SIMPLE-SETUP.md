# 🚀 Simple Setup Guide

You received the Secure Haven voting platform. Here's how to get it running:

## 📋 What You Need

1. **Node.js** - [Download here](https://nodejs.org/)
2. **MongoDB Compass** - [Download here](https://www.mongodb.com/try/download/compass)

## 🎯 Quick Setup Steps

### **Step 1: Install Dependencies**
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ..
npm install
```

### **Step 2: Set Up MongoDB Connection**

1. **Open MongoDB Compass**
2. **Click "New Connection"**
3. **Use this connection string:**
   ```
   mongodb://localhost:27017
   ```
4. **Click "Connect"**
5. **Create a new database:**
   - Click "Create Database"
   - Database Name: `secure_haven`
   - Collection Name: `users`
   - Click "Create Database"

### **Step 3: Get Connection String**

1. **In Compass, click the "Connect" button** (top right)
2. **Copy the connection string**
3. **It should look like:** `mongodb://localhost:27017/secure_haven`

### **Step 4: Create .env File**

1. **Go to the `backend` folder**
2. **Create a new file called `.env`**
3. **Add this content:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/secure_haven
   PORT=5001
   JWT_SECRET=your_secret_key_here
   NODE_ENV=development
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   AUTH_RATE_LIMIT_MAX_REQUESTS=10
   ```

### **Step 5: Start the Application**

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### **Step 6: Open in Browser**
- Go to: `http://localhost:5173`
- Create an account and start using! 🎉

## 🚨 Troubleshooting

### **"MongoDB connection error"**
- Make sure MongoDB is running
- Check your connection string in `.env` file
- Verify the database name is correct

### **"Port already in use"**
- Close other applications using ports 5001 or 5173
- Or change the port in `.env` file

### **"Module not found"**
- Make sure you ran `npm install` in both folders
- Check that you're in the correct directory

## 💡 Tips

- **Keep both terminal windows open** while using the app
- **First user** automatically becomes an admin
- **Data is stored in your local MongoDB**
- **You can view data in Compass** anytime

---

**🎉 That's it! Your voting platform is ready to use!** 