import mongoose from 'mongoose';
import dns from 'dns';

let isConnected = false;

/**
 * Connect to MongoDB. Handles caching across serverless invocations and standalone server.
 */
export const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('Missing MONGO_URI. Check your environment variables.');
    if (!process.env.VERCEL) process.exit(1);
    throw new Error('Missing MONGO_URI environment variable');
  }

  if (mongoose.connection.readyState >= 1 || isConnected) {
    return;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      lookup: dns.lookup,
    });
    isConnected = true;
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    if (!process.env.VERCEL) process.exit(1);
    throw error;
  }
};

