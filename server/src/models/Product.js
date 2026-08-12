import mongoose from 'mongoose';
import { uuidString, timestamps, applyIdVirtual } from './base.js';

const productSchema = new mongoose.Schema(
  {
    _id: uuidString,
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true, min: 0 },
    discounted_price: { type: Number, min: 0 },
    category_id: { type: String, default: null },
    image: { type: String },
    brand: { type: String },
    key_benefits: { type: String },
    usage_instructions: { type: String },
    weight: { type: String },
    colors: { type: [String], default: [] },
    stock: { type: Number, default: 0, min: 0 },
    created_at: timestamps.created_at,
    updated_at: timestamps.updated_at,
  },
  { _id: false, versionKey: false }
);

productSchema.index({ category_id: 1 });

productSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

applyIdVirtual(productSchema);

export const Product = mongoose.model('Product', productSchema);
