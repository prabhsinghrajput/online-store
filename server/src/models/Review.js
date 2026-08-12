import mongoose from 'mongoose';
import { uuidString, timestamps, applyIdVirtual } from './base.js';

const reviewSchema = new mongoose.Schema(
  {
    _id: uuidString,
    product_id: { type: String, required: true },
    user_id: { type: String, required: true },
    user_email: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    created_at: timestamps.created_at,
    updated_at: timestamps.updated_at,
  },
  { _id: false, versionKey: false }
);

reviewSchema.index({ product_id: 1 });
reviewSchema.index({ user_id: 1 });
reviewSchema.index({ product_id: 1, user_id: 1 }, { unique: true });

reviewSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

applyIdVirtual(reviewSchema);

export const Review = mongoose.model('Review', reviewSchema);
