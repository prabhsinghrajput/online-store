import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';
import { validate, fileUploadSchema } from '../middleware/validation.js';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');
const PUBLIC_URL = process.env.PUBLIC_URL || 'http://localhost:3001';

const allowedBuckets = ['products', 'categories', 'banners', 'documents', 'profile'];

// Configure Cloudinary
const isCloudinaryConfigured = !!(process.env.CLOUDINARY_URL || (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET));

if (!isCloudinaryConfigured) {
  throw new Error('Cloudinary not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
}

if (process.env.CLOUDINARY_URL) {
  // Cloudinary SDK automatically configures itself if CLOUDINARY_URL is present
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// Configure multer with disk storage and size limit
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const bucket = req.body.bucket || 'products';
      const safeBucket = allowedBuckets.includes(bucket) ? bucket : 'products';
      const folder = sanitizeFolder(req.body.folder || '');
      const dir = path.join(UPLOADS_DIR, safeBucket, folder);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const sanitizedOriginal = file.originalname
        .replace(/[^a-zA-Z0-9.\-_]/g, '_')
        .toLowerCase();
      const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}_${sanitizedOriginal}`;
      cb(null, fileName);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
    files: 1 // Only one file at a time
  },
  fileFilter: (req, file, cb) => {
    // Allowed MIME types
    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif'
    ];

    // Allowed file extensions
    const allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

    const fileExt = file.originalname.split('.').pop()?.toLowerCase();
    const mime = file.mimetype;

    if (!allowedMimes.includes(mime) || !allowedExts.includes(fileExt)) {
      return cb(new Error('Invalid file type. Only JPG, PNG, WebP, and GIF are allowed.'), false);
    }

    cb(null, true);
  }
});

function sanitizeFolder(folder) {
  if (!folder) return '';
  let clean = folder.replace(/[^a-zA-Z0-9\-_/]/g, '');
  if (clean.includes('..') || clean.startsWith('/') || clean.endsWith('/')) {
    return '';
  }
  return clean;
}

// File upload validation schema for query/body parameters
const uploadParamsSchema = fileUploadSchema;

/**
 * POST /api/upload/profile
 * Upload a profile picture (authenticated users only)
 */
router.post('/profile', authenticateUser, (req, res, next) => {
  req.body.bucket = 'profile';
  next();
}, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    let imageUrl = '';
    
    try {
      // Upload local file directly to Cloudinary under the "profile" folder
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: 'profile',
      });
      imageUrl = uploadResult.secure_url;
      
      // Delete temporary local file
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Error deleting temp file:', err);
      }
    } catch (cloudinaryError) {
      console.error('Cloudinary upload failed, falling back to local storage:', cloudinaryError);
      imageUrl = `${PUBLIC_URL}/uploads/profile/${req.file.filename}`;
    }

    res.json({
      url: imageUrl,
      bucket: 'profile',
      size: req.file.size,
      type: req.file.mimetype
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to process upload' });
  }
});

router.post('/', authenticateUser, requireAdmin, upload.single('file'), validate(uploadParamsSchema, 'body'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Get and validate bucket name
    const bucket = allowedBuckets.includes(req.body.bucket) ? req.body.bucket : 'products';
    const folder = sanitizeFolder(req.body.folder || '');

    let imageUrl = '';
    
    try {
      // Upload local file directly to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: `${bucket}/${folder}`.replace(/\/+/g, '/'),
      });
      imageUrl = uploadResult.secure_url;
      
      // Delete temporary local file
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Error deleting temp file:', err);
      }
    } catch (cloudinaryError) {
      console.error('Cloudinary upload failed, falling back to local storage:', cloudinaryError);
      const relativePath = folder ? `${bucket}/${folder}/${req.file.filename}` : `${bucket}/${req.file.filename}`;
      imageUrl = `${PUBLIC_URL}/uploads/${relativePath.replace(/\\/g, '/')}`;
    }

    res.json({
      url: imageUrl,
      bucket,
      size: req.file.size,
      type: req.file.mimetype
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to process upload' });
  }
});

// Error handler for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size exceeds 5MB limit' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files uploaded' });
    }
    return res.status(400).json({ error: error.message || 'File upload error' });
  }

  if (error.message && error.message.includes('Invalid file type')) {
    return res.status(400).json({ error: error.message });
  }

  next(error);
});

export default router;
