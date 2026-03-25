/**
 * Coach Trainees API
 * 
 * Endpoints for coaches to manage and view their trainees
 */

import { db } from '../../db/index.js';
import { sendInviteEmail } from '../../services/notifications.js';

function buildInviteLink(token) {
  const appUrl = process.env.APP_BASE_URL || process.env.FRONTEND_URL || 'https://flukee-web.netlify.app';
  return `${appUrl}/login?invite=${token}`;
}

/**
 * POST /api/coaches/trainees
 * Add a trainee by email. If user exists, create relationship. If not, send invite.
 */
export const addTrainee = async (req, res) => {
  try {
    const { user } = req;
    const { email, domain } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'email is required' },
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'email is required' },
      });
    }

    const trainee = db.users.findByEmail(normalizedEmail);

    if (trainee) {
      if (trainee.role !== 'trainee') {
        return res.status(400).json({
          error: { code: 'VALIDATION_ERROR', message: 'User is a coach, not a trainee' },
        });
      }

      const existing = db.relationships.findPair(user.id, trainee.id);
      if (existing) {
        const { password: _, ...traineeSafe } = trainee;
        return res.status(200).json({
          relationship: existing,
          trainee: traineeSafe,
          invited: false,
        });
      }

      const relationship = db.relationships.create({
        coachId: user.id,
        traineeId: trainee.id,
        domain: domain || null,
      });

      const { password: _, ...traineeSafe } = trainee;
      return res.status(201).json({
        relationship,
        trainee: traineeSafe,
        invited: false,
      });
    }

    // User doesn't exist - create or reuse pending invite
    let invite = db.pendingInvites.findByEmailAndCoach(normalizedEmail, user.id);
    if (!invite) {
      invite = db.pendingInvites.create({
        coachId: user.id,
        email: normalizedEmail,
        domain: domain || null,
      });
    }

    const inviteLink = buildInviteLink(invite.token);
    const emailSent = await sendInviteEmail(invite, user);
    if (!emailSent) {
      return res.status(201).json({
        message:
          'Invite saved but email did not send. Share the invite link below manually (e.g. WhatsApp). Check Render logs and Resend. Remove MAIL_FROM in Render unless the domain is verified in Resend.',
        invited: true,
        email: normalizedEmail,
        emailDelivered: false,
        inviteLink,
      });
    }

    return res.status(201).json({
      message: 'Invitation sent',
      invited: true,
      email: normalizedEmail,
      emailDelivered: true,
      inviteLink,
    });
  } catch (error) {
    console.error('Add trainee error:', error);
    res.status(500).json({
      error: { code: 'SERVER_ERROR', message: 'Failed to add trainee' },
    });
  }
};

/**
 * GET /api/coaches/trainees
 * List all trainees assigned to the coach
 */
export const listTrainees = async (req, res) => {
  try {
    const { user } = req; // Coach user
    
    const relationships = db.relationships.findByCoachId(user.id);
    const traineeIds = relationships.map(rel => rel.traineeId);
    
    const trainees = traineeIds.map(traineeId => {
      const trainee = db.users.findById(traineeId);
      if (!trainee) return null;

      // Get stats
      const tasks = db.tasks.findByTraineeId(traineeId);
      const activeTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;
      const completedTasks = tasks.filter(t => t.status === 'completed').length;

      const unreadMessageCount = db.messages.countUnreadForReceiver(user.id, traineeId);

      return {
        id: trainee.id,
        name: trainee.name,
        email: trainee.email,
        activeTasks,
        completedTasks,
        unreadMessageCount,
        lastActive: new Date().toISOString(), // TODO: Track actual last active
      };
    }).filter(Boolean);
    
    res.json({ trainees });
  } catch (error) {
    console.error('List trainees error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch trainees'
      }
    });
  }
};

/**
 * GET /api/coaches/trainees/:traineeId
 * Get detailed overview of a trainee
 */
export const getTraineeOverview = async (req, res) => {
  try {
    const { user } = req; // Coach user
    const { traineeId } = req.params;
    
    // Verify relationship
    const relationship = db.relationships.findPair(user.id, traineeId);
    if (!relationship) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Trainee is not assigned to you'
        }
      });
    }

    const trainee = db.users.findById(traineeId);
    if (!trainee || trainee.role !== 'trainee') {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Trainee not found'
        }
      });
    }

    // Get stats
    const tasks = db.tasks.findByTraineeId(traineeId);
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    const overdueTasks = tasks.filter(t => {
      if (!t.dueDate) return false;
      return new Date(t.dueDate) < new Date() && t.status !== 'completed';
    }).length;
    const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0;

    // Get recent tasks (last 5) with responses for reflection preview
    const recentTasks = tasks
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(task => {
        const response = db.taskResponses.findByTaskId(task.id);
        return {
          id: task.id,
          title: task.title,
          status: task.status,
          completedAt: task.completedAt,
          createdAt: task.createdAt,
          response: response ? {
            responseData: response.responseData,
            submittedAt: response.submittedAt,
          } : null,
        };
      });

    res.json({
      trainee: {
        id: trainee.id,
        name: trainee.name,
        email: trainee.email,
      },
      stats: {
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        completionRate,
      },
      recentTasks,
    });
  } catch (error) {
    console.error('Get trainee overview error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch trainee overview'
      }
    });
  }
};

/**
 * GET /api/coaches/trainees/:traineeId/tasks
 * Get all tasks for a specific trainee
 */
export const getTraineeTasks = async (req, res) => {
  try {
    const { user } = req; // Coach user
    const { traineeId } = req.params;
    const { status, limit = 20, offset = 0 } = req.query;
    
    // Verify relationship
    const relationship = db.relationships.findPair(user.id, traineeId);
    if (!relationship) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Trainee is not assigned to you'
        }
      });
    }

    const filters = { traineeId };
    if (status) {
      filters.status = status;
    }

    const allTasks = db.tasks.findByCoachId(user.id, filters);
    const total = allTasks.length;
    const tasks = allTasks.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    // Include responses
    const tasksWithResponses = tasks.map(task => {
      const response = db.taskResponses.findByTaskId(task.id);
      return {
        ...task,
        response: response || null,
      };
    });
    
    res.json({
      tasks: tasksWithResponses,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get trainee tasks error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch trainee tasks'
      }
    });
  }
};
