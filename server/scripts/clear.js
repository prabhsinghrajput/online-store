import 'dotenv/config';
import mongoose from 'mongoose';
import { Category } from '../src/models/Category.js';
import { Product } from '../src/models/Product.js';
import { connectDB } from '../src/db/mongo.js';

async function clear() {
  try {
    await connectDB();
    console.log('Clearing all categories and products...');
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('Database cleared successfully!');
  } catch (err) {
    console.error('Error clearing database:', err);
  } finally {
    mongoose.disconnect();
  }
}

clear();
