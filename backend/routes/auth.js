/**
 * Auth Routes  –  /api/auth
 * -------------------------
 * POST /register  – Create a new user (+ Rider doc if role is 'rider')
 * POST /login     – Authenticate and receive a JWT
 * GET  /me        – Return the currently authenticated user's profile
 */

import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Rider from '../models/Rider.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// ── Helper: generate a signed JWT ───────────────────────────────────────
/**
 * @param  {string} id   - User's MongoDB _id
 * @param  {string} role - 'admin' | 'rider'
 * @returns {string}     Signed JWT (expires in 30 days)
 */
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// ─────────────────────────────────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, vehicleType } = req.body;

    // --- Validation -------------------------------------------------------
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // Check for duplicate email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with that email already exists',
      });
    }

    // --- Create the User document -----------------------------------------
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'admin',
    });

    // --- If the role is 'rider', create a companion Rider document ---------
    let rider = null;
    if (user.role === 'rider') {
      if (!phone) {
        // Clean up the user we just created so we don't leave orphan data
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({
          success: false,
          message: 'Phone number is required for rider registration',
        });
      }

      try {
        rider = await Rider.create({
          user: user._id,
          name: user.name,
          phone,
          vehicleType: vehicleType || 'bike',
        });
      } catch (riderErr) {
        await User.findByIdAndDelete(user._id);
        throw riderErr; // let the global catch handle the validation response
      }
    }

    // --- Respond with token + user info -----------------------------------
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        riderId: rider ? rider._id : undefined,
        isOnline: rider ? rider.isOnline : undefined,
      },
      rider: rider
        ? { _id: rider._id, phone: rider.phone, vehicleType: rider.vehicleType }
        : null,
    });
  } catch (error) {
    console.error('Register error:', error.message);

    // Handle Mongoose duplicate-key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A user with that email already exists',
      });
    }

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }

    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

// ─────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // --- Validation -------------------------------------------------------
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Fetch user WITH the password field (normally excluded via select: false)
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+password'
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Compare passwords
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // --- Generate token & respond -----------------------------------------
    const token = generateToken(user._id, user.role);

    // If the user is a rider, include rider info
    let riderData = null;
    if (user.role === 'rider') {
      riderData = await Rider.findOne({ user: user._id });
    }

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        riderId: riderData ? riderData._id : undefined,
        isOnline: riderData ? riderData.isOnline : undefined,
      },
      rider: riderData,
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// ─────────────────────────────────────────────────────────────────────────
// GET /api/auth/me  (protected)
// ─────────────────────────────────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // If the user is a rider, fetch and attach rider profile
    let riderProfile = null;
    if (user.role === 'rider') {
      riderProfile = await Rider.findOne({ user: user._id });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        riderId: riderProfile ? riderProfile._id : undefined,
        isOnline: riderProfile ? riderProfile.isOnline : undefined,
      },
      rider: riderProfile,
    });
  } catch (error) {
    console.error('Get profile error:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching profile' });
  }
});

export default router;
