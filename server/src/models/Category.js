import mongoose from 'mongoose';
import { uuidString, timestamps, applyIdVirtual } from './base.js';

const categorySchema = new mongoose.Schema(
  {
    _id: uuidString,
    name: { type: String, required: true },
    image: { type: String },
    created_at: timestamps.created_at,
    updated_at: timestamps.updated_at,
  },
  { _id: false, versionKey: false }
);

categorySchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

applyIdVirtual(categorySchema);

export const Category = mongoose.model('Category', categorySchema);
