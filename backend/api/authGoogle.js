/**
 * Google SSO (OAuth 2.0 / OpenID Connect)
 * Client sends Google ID token; we verify and create/find user
 */

import { OAuth2Client } from 'google-auth-library';
import { db } from '../db/index.js';
import { generateToken } from '../middleware/auth.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
 * POST /auth/google
 * Body: { idToken: string, role?: 'coach'|'trainee', inviteToken?: string }
 * For new users, role defaults to 'trainee'
 */
export const googleSignIn = async (req, res) => {
  try {
    const { idToken, role = 'trainee', inviteToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Google ID token is required' },
      });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({
        error: { code: 'CONFIG_ERROR', message: 'Google SSO is not configured. Set GOOGLE_CLIENT_ID.' },
      });
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Google account must have email' },
      });
    }

    let user = db.users.findByEmail(email);
    const allowedRole = ['coach', 'trainee'].includes(role) ? role : 'trainee';

    if (!user) {
      user = db.users.create({
        id: `google_${googleId}`,
        email,
        name: name || email.split('@')[0],
        role: allowedRole,
        password: null,
      });
    }

    redeemInviteIfProvided(user.id, inviteToken);

    const token = generateToken(user.id);
    const { password: _, ...userWithoutPassword } = user;

    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error('Google sign-in error:', error);
    if (error.message?.includes('Token used too late') || error.message?.includes('audience')) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Invalid or expired Google token' },
      });
    }
    res.status(500).json({
      error: { code: 'SERVER_ERROR', message: 'Google sign-in failed' },
    });
  }
};
