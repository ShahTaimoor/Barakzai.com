const mongoose = require('mongoose');
require('dotenv').config();

// Database connection
const connectDB = async () => {
  try {
    // Check if MONGODB_URI is provided
    if (!process.env.MONGODB_URI) {
      console.error('❌ Error: MONGODB_URI environment variable is required.');
      console.error('   Please set it in your .env file or as an environment variable.');
      process.exit(1);
    }

    const mongoUri = process.env.MONGODB_URI;

    // Connection options
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
      minPoolSize: 2,
      dbName: 'pos_system'
    };

    // Connect only if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri, options);
      console.log(`✅ MongoDB connected successfully to database: ${mongoose.connection.db.databaseName}`);
    } else if (mongoose.connection.readyState === 1) {
      console.log('✅ MongoDB already connected');
    }

    // Connection event handlers
    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB connected');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
      setTimeout(async () => {
        if (mongoose.connection.readyState === 0) {
          try {
            await mongoose.connect(mongoUri, options);
          } catch (err) {
            console.error('❌ Reconnection failed:', err);
          }
        }
      }, 5000);
    });

  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.error('💡 Verify that the connection string is correct and accessible.');
    console.error('💡 For local MongoDB, ensure MongoDB service is running.');
    console.error('💡 For Atlas, ensure your IP is whitelisted.');
    process.exit(1);
  }
};

module.exports = connectDB;

