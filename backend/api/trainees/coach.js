/**
 * Trainee Coach API
 * Get the trainee's assigned coach for messaging and preview
 */

import { db } from '../../db/index.js';

/**
 * GET /api/trainees/coach
 * Get the current trainee's assigned coach
 */
export const getMyCoach = async (req, res) => {
  try {
    const { user } = req;

    if (user.role !== 'trainee') {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Only trainees can access their coach',
        },
      });
    }

    const relationship = db.relationships.findByTraineeId(user.id);

    if (!relationship) {
      return res.json({ coach: null });
    }

    const coach = db.users.findById(relationship.coachId);

    if (!coach) {
      return res.json({ coach: null });
    }

    const { password: _, ...coachWithoutPassword } = coach;
    res.json({ coach: coachWithoutPassword });
  } catch (error) {
    console.error('Get coach error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch coach',
      },
    });
  }
};
