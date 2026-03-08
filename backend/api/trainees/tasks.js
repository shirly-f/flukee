/**
 * Trainee Tasks API
 * 
 * Endpoints for trainees to view and complete tasks
 */

import { db } from '../../db/index.js';
import { notifyCoachTaskCompleted } from '../../services/notifications.js';

/**
 * GET /api/trainees/tasks
 * List all tasks assigned to the trainee
 */
export const listTasks = async (req, res) => {
  try {
    const { user } = req; // Trainee user
    const { status, limit = 20, offset = 0 } = req.query;
    
    const filters = {};
    if (status) {
      filters.status = status;
    }

    const allTasks = db.tasks.findByTraineeId(user.id, filters);
    
    // Pagination
    const total = allTasks.length;
    const tasks = allTasks.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
    
    // Check which tasks have responses
    const tasksWithResponseFlag = tasks.map(task => {
      const response = db.taskResponses.findByTaskId(task.id);
      return {
        ...task,
        hasResponse: !!response
      };
    });
    
    res.json({
      tasks: tasksWithResponseFlag,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('List tasks error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch tasks'
      }
    });
  }
};

/**
 * GET /api/trainees/tasks/:taskId
 * Get task details
 */
export const getTaskDetails = async (req, res) => {
  try {
    const { user } = req; // Trainee user
    const { taskId } = req.params;
    
    const task = db.tasks.findById(taskId);
    
    if (!task) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Task not found'
        }
      });
    }

    // Verify task belongs to this trainee
    if (task.traineeId !== user.id) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have access to this task'
        }
      });
    }

    // Get existing response if any
    const response = db.taskResponses.findByTaskId(taskId);
    
    res.json({
      ...task,
      response: response || null
    });
  } catch (error) {
    console.error('Get task details error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch task details'
      }
    });
  }
};

/**
 * POST /api/trainees/tasks/:taskId/response
 * Create or update task response
 */
export const submitTaskResponse = async (req, res) => {
  try {
    const { user } = req; // Trainee user
    const { taskId } = req.params;
    const { responseData, status = 'submitted' } = req.body;
    
    if (!responseData) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'responseData is required'
        }
      });
    }

    // Verify task exists and belongs to this trainee
    const task = db.tasks.findById(taskId);
    if (!task) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Task not found'
        }
      });
    }

    if (task.traineeId !== user.id) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have access to this task'
        }
      });
    }

    // Check if response already exists
    let response = db.taskResponses.findByTaskId(taskId);
    
    if (response) {
      // Update existing response
      response = db.taskResponses.update(response.id, {
        responseData,
        status,
        submittedAt: status === 'submitted' ? new Date().toISOString() : response.submittedAt,
      });
    } else {
      // Create new response
      response = db.taskResponses.create({
        taskId,
        traineeId: user.id,
        responseData,
        status,
      });
    }

    // Update task status if submitted
    if (status === 'submitted') {
      const updatedTask = db.tasks.update(taskId, {
        status: 'completed',
        completedAt: new Date().toISOString(),
      });
      const coach = db.users.findById(task.coachId);
      if (coach) {
        const { password: _, ...coachSafe } = coach;
        notifyCoachTaskCompleted(updatedTask, coachSafe, user).catch((err) =>
          console.error('Notify coach task completed:', err)
        );
      }
    }

    res.json(response);
  } catch (error) {
    console.error('Submit task response error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to submit task response'
      }
    });
  }
};

/**
 * PUT /api/trainees/tasks/:taskId/status
 * Update task status (e.g., mark as in_progress)
 */
export const updateTaskStatus = async (req, res) => {
  try {
    const { user } = req; // Trainee user
    const { taskId } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'status is required'
        }
      });
    }

    const task = db.tasks.findById(taskId);
    if (!task) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Task not found'
        }
      });
    }

    if (task.traineeId !== user.id) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have access to this task'
        }
      });
    }

    const updates = { status };
    if (status === 'completed') {
      updates.completedAt = new Date().toISOString();
    }

    const updatedTask = db.tasks.update(taskId, updates);

    if (status === 'completed') {
      const coach = db.users.findById(task.coachId);
      const trainee = db.users.findById(task.traineeId);
      if (coach && trainee) {
        const { password: _, ...coachSafe } = coach;
        notifyCoachTaskCompleted(updatedTask, coachSafe, trainee).catch((err) =>
          console.error('Notify coach task completed:', err)
        );
      }
    }

    res.json(updatedTask);
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to update task status'
      }
    });
  }
};
