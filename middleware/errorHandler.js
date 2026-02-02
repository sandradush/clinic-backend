const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(err.message, { 
    stack: err.stack, 
    url: req.url, 
    method: req.method,
    ip: req.ip 
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ error: errors.join(', ') });
  }

  // Supabase errors
  if (err.code) {
    return res.status(400).json({ error: err.message });
  }

  // Default error
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message 
  });
};

const notFound = (req, res) => {
  res.status(404).json({ error: 'Route not found' });
};

module.exports = { errorHandler, notFound };