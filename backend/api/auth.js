/**
 * Authentication API
 */

import { db } from '../db/index.js';
import { generateToken } from '../middleware/auth.js';

/**
 * POST /auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email and password are required'
        }
      });
    }

    const user = db.users.findByEmail(email);
    
    if (!user || user.password !== password) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password'
        }
      });
    }

    const token = generateToken(user.id);
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Login failed'
      }
    });
  }
};

/**
 * POST /auth/register
 */
export const register = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email, password, name, and role are required'
        }
      });
    }

    if (!['coach', 'trainee'].includes(role)) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Role must be either "coach" or "trainee"'
        }
      });
    }

    // Check if user already exists
    const existingUser = db.users.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'User with this email already exists'
        }
      });
    }

    const user = db.users.create({
      email,
      password,
      name,
      role,
    });

    const token = generateToken(user.id);
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Registration failed'
      }
    });
  }
};

/**
 * GET /auth/me
 */
export const getCurrentUser = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to get current user'
      }
    });
  }
};
