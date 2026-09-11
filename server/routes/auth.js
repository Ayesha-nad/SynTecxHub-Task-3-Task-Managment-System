import express from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  registerValidationRules,
  loginValidationRules,
  validateRequest,
} from '../middleware/validate.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'corkboard-tactile-sticky-secret-key-2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

// Rate limiter to prevent brute force attacks on authentication routes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again in 15 minutes.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});

/**
 * Helper to generate signed JWT
 */
const generateToken = (userId, email) => {
  return jwt.sign({ id: userId, email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

/**
 * Array of pastel sticky-note avatar colors
 */
const AVATAR_COLORS = [
  '#f5e07a', // yellow
  '#f39a8a', // coral pink
  '#a8d8b9', // mint green
  '#a9cce8', // sky blue
  '#e8d5f5', // lavender
  '#ffd39a', // warm peach
];

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user account
 * @access  Public
 */
router.post(
  '/register',
  authLimiter,
  registerValidationRules,
  validateRequest,
  async (req, res, next) => {
    try {
      const { name, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists.',
          errors: { email: 'Email address is already registered' },
          code: 'EMAIL_ALREADY_EXISTS',
        });
      }

      // Pick a random sticky-note avatar color
      const randomColor =
        AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        avatarColor: randomColor,
      });

      const token = generateToken(user._id, user.email);

      res.status(201).json({
        success: true,
        message: 'Account created successfully! Welcome to your corkboard.',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatarColor: user.avatarColor,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & issue JWT
 * @access  Public
 */
router.post(
  '/login',
  authLimiter,
  loginValidationRules,
  validateRequest,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      // Find user and explicitly include hashed password
      const user = await User.findOne({ email: email.toLowerCase() }).select(
        '+password'
      );

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password. Please check your credentials.',
          code: 'INVALID_CREDENTIALS',
        });
      }

      // Validate password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password. Please check your credentials.',
          code: 'INVALID_CREDENTIALS',
        });
      }

      const token = generateToken(user._id, user.email);

      res.status(200).json({
        success: true,
        message: 'Signed in successfully. Welcome back!',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatarColor: user.avatarColor,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/auth/me
 * @desc    Get currently authenticated user's profile
 * @access  Private (Protected by JWT)
 */
router.get('/me', protect, async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      avatarColor: req.user.avatarColor,
      createdAt: req.user.createdAt,
    },
  });
});

export default router;
