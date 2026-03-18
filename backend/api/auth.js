/**
 * Authentication API
 */

import { db } from '../db/index.js';
import { generateToken } from '../middleware/auth.js';

/**
 * Redeem invite token: create coach-trainee relationship if invite is valid
 */
function redeemInviteIfProvided(userId, inviteToken) {
  if (!inviteToken || typeof inviteToken !== 'string') return;
  const invite = db.pendingInvites.findByToken(inviteToken.trim());
  if (!invite) return;
  const trainee = db.users.findById(userId);
  if (!trainee || trainee.role !== 'trainee') return;
  if (trainee.email.toLowerCase() !== invite.email.toLowerCase()) return;
  db.relationships.create({
    coachId: invite.coachId,
    traineeId: userId,
    domain: invite.domain,
  });
  db.pendingInvites.markUsed(invite.token);
}

/**
 * POST /auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password, inviteToken } = req.body;

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

    redeemInviteIfProvided(user.id, inviteToken);

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
    const { email, password, name, role, inviteToken } = req.body;

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

    redeemInviteIfProvided(user.id, inviteToken);

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
 * GET /auth/invite/:token
 * Public: get invite preview (coach name) for display on login page
 */
export const getInvitePreview = async (req, res) => {
  try {
    const { token } = req.params;
    const invite = db.pendingInvites.findByToken(token);
    if (!invite) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Invite not found or already used' } });
    }
    const coach = db.users.findById(invite.coachId);
    if (!coach) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Invite not found' } });
    }
    res.json({ coachName: coach.name, email: invite.email, domain: invite.domain });
  } catch (error) {
    console.error('Get invite preview error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to load invite' } });
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
