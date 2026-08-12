import mongoose from 'mongoose';
import dns from 'dns';

let isConnected = false;

/**
 * Connect to MongoDB. Called once at server startup.
 */
export const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('Missing MONGO_URI. Check your .env file.');
    process.exit(1);
  }

  if (isConnected) return;

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      lookup: dns.lookup,
      tlsAllowInvalidCertificates: true,
    });
    isConnected = true;
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};
