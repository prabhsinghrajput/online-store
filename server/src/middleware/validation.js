import { z } from 'zod';

/**
 * Validation schemas for different entities
 */

// Product validation schema
export const productSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Product name is required').max(255, 'Product name too long').trim(),
  description: z.string().max(5000, 'Description too long').optional(),
  price: z.number().positive('Price must be positive').finite(),
  discounted_price: z.number().positive('Discounted price must be positive').finite().optional(),
  category_id: z.string().uuid('Invalid category ID').optional(),
  image: z.string().url('Invalid image URL').max(2048, 'Image URL too long').optional(),
  images: z.array(z.string().url('Invalid image URL')).max(10, 'Too many images').optional(),
  weight: z.string().max(100, 'Weight description too long').optional(),
  stock: z.number().int('Stock must be integer').min(0, 'Stock cannot be negative').default(0),
  featured: z.boolean().default(false),
  status: z.enum(['active', 'inactive', 'out_of_stock']).default('active'),
}).strict();

// Category validation schema
export const categorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Category name is required').max(255, 'Category name too long').trim(),
  description: z.string().max(1000, 'Description too long').optional(),
  image: z.string().url('Invalid image URL').max(2048, 'Image URL too long').optional(),
  slug: z.string().max(255, 'Slug too long').optional(),
  parent_id: z.string().uuid().optional(),
  order: z.number().int().min(0).optional(),
  featured: z.boolean().default(false),
}).strict();

// Order validation schema
export const orderSchema = z.object({
  items: z.array(z.object({
    id: z.string().uuid().optional(),
    product_id: z.string().uuid('Invalid product ID'),
    name: z.string().min(1).max(255),
    price: z.number().positive().finite(),
    discounted_price: z.number().positive().finite().optional(),
    quantity: z.number().int().positive('Quantity must be at least 1').max(100, 'Quantity too large'),
    weight: z.string().max(100).optional(),
    image: z.string().url().optional(),
  })).min(1, 'Order must have at least one item').max(50, 'Too many items'),
  customer_name: z.string().min(1, 'Customer name required').max(255).trim(),
  customer_phone: z.string().regex(/^[+]?[\d\s\-\(\)]+$/, 'Invalid phone number').max(50),
  shipping_address: z.string().min(10, 'Address too short').max(1000, 'Address too long').trim(),
  total_amount: z.number().positive('Total must be positive').finite(),
}).strict();

// Review validation schema
export const reviewSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z.string().min(1, 'Comment required').max(2000, 'Comment too long').trim(),
}).strict();

// Banner validation schema
export const bannerSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, 'Title required').max(255).trim(),
  description: z.string().max(500).optional(),
  image: z.string().url('Invalid image URL').max(2048),
  link: z.string().url('Invalid link URL').max(2048).optional(),
  position: z.enum(['home', 'category', 'product']).default('home'),
  order: z.number().int().min(0).optional(),
  active: z.boolean().default(true),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
}).strict();

// File upload validation schema
export const fileUploadSchema = z.object({
  bucket: z.enum(['products', 'categories', 'banners', 'documents']).default('products'),
  folder: z.string().max(100, 'Folder name too long').regex(/^[a-zA-Z0-9\-_\/]+$/, 'Invalid folder name').optional().default(''),
}).strict();

/**
 * Validation middleware factory
 * Creates middleware that validates request body against a schema
 */
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const dataToValidate = source === 'body' ? req.body :
                            source === 'query' ? req.query :
                            req.params;

      const validated = schema.parse(dataToValidate);

      // Replace the source data with validated data
      if (source === 'body') req.body = validated;
      else if (source === 'query') req.query = validated;
      else req.params = validated;

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      }
      next(error);
    }
  };
};

/**
 * Sanitization helpers
 */
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  // Remove potentially dangerous characters
  return str
    .replace(/[<>]/g, '') // Remove < and >
    .trim();
};

export const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(sanitizeString);
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};
