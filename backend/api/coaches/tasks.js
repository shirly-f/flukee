/**
 * Coach Tasks API
 * 
 * Endpoints for coaches to create and manage tasks
 */

import { db } from '../../db/index.js';
import { notifyTraineeTaskAssigned } from '../../services/notifications.js';

/**
 * POST /api/coaches/tasks
 * Create a new task for a trainee
 */
export const createTask = async (req, res) => {
  try {
    const { user } = req; // Coach user
    const { traineeId, title, description, type, dueDate, metadata } = req.body;
    
    // Validate required fields
    if (!traineeId || !title || !type) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'traineeId, title, and type are required'
        }
      });
    }

    // Validate task type
    if (!['text_response', 'read_document', 'questionnaire'].includes(type)) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid task type'
        }
      });
    }

    // Verify trainee exists and belongs to this coach
    const trainee = db.users.findById(traineeId);
    if (!trainee || trainee.role !== 'trainee') {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Trainee not found'
        }
      });
    }

    // Check relationship
    const relationship = db.relationships.findPair(user.id, traineeId);
    if (!relationship) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Trainee is not assigned to you'
        }
      });
    }

    // Create task
    const task = db.tasks.create({
      coachId: user.id,
      traineeId,
      title,
      description: description || '',
      type,
      status: 'pending',
      dueDate: dueDate || null,
      metadata: metadata || {},
    });

    // Notify trainee (email + push)
    const { password: _, ...traineeSafe } = trainee;
    notifyTraineeTaskAssigned(task, user, traineeSafe).catch((err) =>
      console.error('Notify trainee task assigned:', err)
    );

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to create task'
      }
    });
  }
};

/**
 * GET /api/coaches/tasks/:taskId
 * Get task details including response
 */
export const getTaskDetails = async (req, res) => {
  try {
    const { user } = req; // Coach user
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

    // Verify task belongs to this coach
    if (task.coachId !== user.id) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have access to this task'
        }
      });
    }

    // Get response if exists
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
