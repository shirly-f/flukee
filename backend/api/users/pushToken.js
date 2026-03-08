/**
 * Push token registration
 * POST /api/users/me/push-token
 */

import { db } from '../../db/index.js';

export const registerPushToken = async (req, res) => {
  try {
    const { user } = req;
    const { token, deviceId } = req.body;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'token is required' },
      });
    }

    db.pushTokens.save(user.id, token, deviceId || null);
    res.json({ success: true });
  } catch (error) {
    console.error('Register push token error:', error);
    res.status(500).json({
      error: { code: 'SERVER_ERROR', message: 'Failed to register push token' },
    });
  }
};
