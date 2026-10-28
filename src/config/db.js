const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/atelier_db';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000 // Quick timeout to fallback if offline
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`[Database] Note: Could not connect to remote/local MongoDB (${error.message}).`);
    console.log(`[Database] Automatically running with Fast In-Memory/JSON Storage Engine for smooth presentation & offline testing!`);
    return false;
  }
};

module.exports = connectDB;
