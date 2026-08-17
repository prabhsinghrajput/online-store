import mongoose from 'mongoose';
import { uuidString, timestamps, applyIdVirtual } from './base.js';

const bannerSchema = new mongoose.Schema(
  {
    _id: uuidString,
    title: { type: String, required: true },
    description: { type: String },
    buttonText: { type: String },
    image: { type: String, required: true },
    active: { type: Boolean, default: true },
    created_at: timestamps.created_at,
    updated_at: timestamps.updated_at,
  },
  { _id: false, versionKey: false }
);

bannerSchema.index({ created_at: -1 });
bannerSchema.index({ active: 1, created_at: -1 });

bannerSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

applyIdVirtual(bannerSchema);

export const Banner = mongoose.model('Banner', bannerSchema);
