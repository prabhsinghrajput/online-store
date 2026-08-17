/**
 * Error handling middleware
 * Prevents leaking internal error details to clients
 */

export const errorHandler = (err, req, res, next) => {
  // Log full error server-side only
  console.error('Error:', err.message, err.stack);

  // Handle specific error types with safe messages
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Invalid or missing token' });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' });
  }

  // CORS error
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({ error: 'Origin not allowed' });
  }

  // Rate limit error
  if (err.status === 429) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  // Payload too large
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request payload too large' });
  }

  // Always return generic error to client — never expose internal details
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    error: 'An error occurred. Please try again later.'
  });
};
