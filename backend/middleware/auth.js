/**
 * Authentication & Authorization Middleware
 * ------------------------------------------
 * protect  – Verifies the JWT from the Authorization header and attaches
 *            the decoded user payload to `req.user`.
 * authorize – Factory that returns middleware restricting access to the
 *             supplied list of roles.
 */

import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Protect routes – requires a valid JWT.
 *
 * Expected header format:
 *   Authorization: Bearer <token>
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Extract token from the Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized – no token provided',
      });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Fetch the user (exclude password) and attach to request
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized – user no longer exists',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    // Differentiate between expired and malformed tokens
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized – token has expired',
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized – token is invalid',
      });
    }

    console.error('Auth middleware error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication',
    });
  }
};

/**
 * Role-based authorization factory.
 *
 * Usage:
 *   router.post('/orders', protect, authorize('admin'), createOrder);
 *
 * @param  {...string} roles - Allowed roles (e.g. 'admin', 'rider')
 * @returns {Function}       Express middleware
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized – please authenticate first',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this resource`,
      });
    }

    next();
  };
};
