import crypto from 'crypto';

/**
 * Generate a UUID (v4) string. Kept as plain string _id for
 * compatibility with the existing uuid-based API and zod schemas.
 */
export const newUuid = () => crypto.randomUUID();

/**
 * Reusable schema base with UUID string _id + created_at/updated_at.
 */
export const uuidString = {
  type: String,
  default: newUuid,
};

export const timestamps = {
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
};

/**
 * Add an `id` virtual mirroring `_id` so the API keeps returning `id`
 * (the client uses `product.id`, `category.id`, etc.) even with `.lean()`.
 */
export const applyIdVirtual = (schema) => {
  schema.virtual('id').get(function () {
    return this._id;
  });
  schema.set('toJSON', { virtuals: true });
  schema.set('toObject', { virtuals: true });
};

/**
 * Ensures plain objects returned by .lean() include an `id` field equal to `_id`.
 * Supports both arrays and single documents.
 */
export const leanWithId = (doc) => {
  if (!doc) return doc;
  if (Array.isArray(doc)) {
    for (let i = 0; i < doc.length; i++) {
      if (doc[i] && doc[i]._id && !doc[i].id) {
        doc[i].id = doc[i]._id;
      }
    }
    return doc;
  }
  if (doc && doc._id && !doc.id) {
    doc.id = doc._id;
  }
  return doc;
};

