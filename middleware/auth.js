const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_in_production';

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Access token required' });
  
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Invalid token format' });
  }
  
  const token = parts[1];
  
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    
    // Get fresh user data from database
    const { rows } = await pool.query('SELECT id, email, name, role FROM users WHERE id = $1', [payload.id]);
    if (!rows[0]) return res.status(401).json({ error: 'User not found' });
    
    req.user = rows[0];
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Middleware to check user roles
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

// Middleware combinations for common role checks
const requireAdmin = requireRole('admin');
const requireDoctor = requireRole('doctor', 'admin');
const requirePatient = requireRole('patient', 'doctor', 'admin');

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireDoctor,
  requirePatient
};