import mongoose from 'mongoose';
import { uuidString, timestamps, applyIdVirtual } from './base.js';

const orderItemSchema = new mongoose.Schema(
  {
    id: uuidString,
    product_id: { type: String, default: null },
    product_name: { type: String, required: true },
    product_image: { type: String, default: '' },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    weight: { type: String, default: '' },
  },
  { _id: false, versionKey: false }
);

const orderSchema = new mongoose.Schema(
  {
    _id: uuidString,
    user_email: { type: String, required: true },
    customer_name: { type: String, required: true },
    customer_phone: { type: String, required: true },
    shipping_address: { type: String, required: true },
    total_amount: { type: Number, required: true, min: 0 },
    status: { type: String, default: 'pending', enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] },
    items: { type: [orderItemSchema], default: [] },
    created_at: timestamps.created_at,
    updated_at: timestamps.updated_at,
  },
  { _id: false, versionKey: false }
);

orderSchema.index({ user_email: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ created_at: -1 });

orderSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

applyIdVirtual(orderSchema);

export const Order = mongoose.model('Order', orderSchema);
