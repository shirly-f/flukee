/**
 * Messages API
 * 
 * Endpoints for 1:1 messaging between coach and trainee
 */

import { db } from '../../db/index.js';

/**
 * GET /api/messages
 * Get conversation messages
 */
export const getMessages = async (req, res) => {
  try {
    const { user } = req;
    const { with: otherUserId } = req.query;
    
    if (!otherUserId) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Query parameter "with" is required'
        }
      });
    }

    // Verify users are coach-trainee pair
    const otherUser = db.users.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    // Check if they have a relationship
    const relationship = db.relationships.findPair(user.id, otherUserId) ||
                        db.relationships.findPair(otherUserId, user.id);
    
    if (!relationship) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You can only message your assigned coach/trainee'
        }
      });
    }

    const messages = db.messages.findConversation(user.id, otherUserId);
    
    res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch messages'
      }
    });
  }
};

/**
 * POST /api/messages
 * Send a message
 */
export const sendMessage = async (req, res) => {
  try {
    const { user } = req;
    const { receiverId, content } = req.body;
    
    if (!receiverId || !content) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'receiverId and content are required'
        }
      });
    }

    // Verify users are coach-trainee pair
    const receiver = db.users.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Receiver not found'
        }
      });
    }

    // Check relationship
    const relationship = db.relationships.findPair(user.id, receiverId) ||
                        db.relationships.findPair(receiverId, user.id);
    
    if (!relationship) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You can only message your assigned coach/trainee'
        }
      });
    }

    const message = db.messages.create({
      senderId: user.id,
      receiverId,
      content,
    });
    
    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to send message'
      }
    });
  }
};

/**
 * PUT /api/messages/:messageId/read
 * Mark message as read
 */
export const markAsRead = async (req, res) => {
  try {
    const { user } = req;
    const { messageId } = req.params;
    
    // TODO: Implement message read tracking
    // For MVP, we'll skip this
    
    res.json({ success: true });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to mark message as read'
      }
    });
  }
};
