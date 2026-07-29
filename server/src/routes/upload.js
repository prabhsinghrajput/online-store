import { Router } from 'express';
import multer from 'multer';
import { supabaseAdmin } from '../db/supabase.js';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';
import { validate, fileUploadSchema } from '../middleware/validation.js';

const router = Router();

// Configure multer with memory storage and size limit
const upload = multer({
  storage: multer.memoryStorage(),
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

// File upload validation schema for query/body parameters
const uploadParamsSchema = fileUploadSchema;

router.post('/', authenticateUser, requireAdmin, upload.single('file'), validate(uploadParamsSchema, 'body'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Double-check file size (in case multer was bypassed)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'File size exceeds 5MB limit' });
    }

    // Validate file extension from original name
    const fileExt = req.file.originalname.split('.').pop()?.toLowerCase();
    const allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

    if (!allowedExts.includes(fileExt)) {
      return res.status(400).json({ error: 'Invalid file extension' });
    }

    // Generate safe filename
    const sanitizedOriginal = req.file.originalname
      .replace(/[^a-zA-Z0-9.\-_]/g, '_')
      .toLowerCase();
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}_${sanitizedOriginal}`;

    // Get and validate bucket name
    const bucket = req.body.bucket || 'products';
    const allowedBuckets = ['products', 'categories', 'banners', 'documents'];

    if (!allowedBuckets.includes(bucket)) {
      return res.status(400).json({ error: 'Invalid bucket name' });
    }

    // Get and validate folder path
    let folder = req.body.folder || '';
    if (folder) {
      // Sanitize folder path
      folder = folder.replace(/[^a-zA-Z0-9\-_\/]/g, '');
      // Prevent path traversal
      if (folder.includes('..') || folder.startsWith('/') || folder.endsWith('/')) {
        return res.status(400).json({ error: 'Invalid folder path' });
      }
    }

    const filePath = folder ? `${folder}/${fileName}` : fileName;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return res.status(500).json({ error: 'Failed to upload file' });
    }

    // Get public URL
    const { data } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(filePath);

    res.json({
      url: data.publicUrl,
      path: filePath,
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
