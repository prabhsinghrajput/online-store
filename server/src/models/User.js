import mongoose from 'mongoose';
import { uuidString, timestamps, applyIdVirtual } from './base.js';

const userSchema = new mongoose.Schema(
  {
    _id: uuidString,
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password_hash: { type: String, required: true },
    role: { type: String, default: 'user' },
    token_version: { type: Number, default: 0 },
    user_metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    last_sign_in_at: { type: Date },
    created_at: timestamps.created_at,
    updated_at: timestamps.updated_at,
  },
  { _id: false, versionKey: false }
);

applyIdVirtual(userSchema);

export const User = mongoose.model('User', userSchema);
