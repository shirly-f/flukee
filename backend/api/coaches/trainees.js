/**
 * Coach Trainees API
 * 
 * Endpoints for coaches to manage and view their trainees
 */

import { db } from '../../db/index.js';

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

      return {
        id: trainee.id,
        name: trainee.name,
        email: trainee.email,
        activeTasks,
        completedTasks,
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
