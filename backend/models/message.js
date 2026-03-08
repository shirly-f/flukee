/**
 * Message Model
 * 
 * 1:1 messaging between coach and trainee
 * Uses Notify messaging service
 */

export const MessageSchema = {
  id: {
    type: 'string',
    primaryKey: true,
    required: true
  },
  senderId: {
    type: 'string',
    foreignKey: 'User.id',
    required: true,
    index: true
  },
  receiverId: {
    type: 'string',
    foreignKey: 'User.id',
    required: true,
    index: true
  },
  content: {
    type: 'text',
    required: true
  },
  read: {
    type: 'boolean',
    default: false
  },
  readAt: {
    type: 'timestamp',
    required: false
  },
  createdAt: {
    type: 'timestamp',
    default: 'now()',
    index: true
  }
};
