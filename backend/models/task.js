/**
 * Task Model
 * 
 * Tasks created by coaches for trainees
 * Supports three types: text_response, read_document, questionnaire
 */

export const TaskSchema = {
  id: {
    type: 'string',
    primaryKey: true,
    required: true
  },
  coachId: {
    type: 'string',
    foreignKey: 'User.id',
    required: true,
    index: true
  },
  traineeId: {
    type: 'string',
    foreignKey: 'User.id',
    required: true,
    index: true
  },
  title: {
    type: 'string',
    required: true
  },
  description: {
    type: 'text',
    required: false
  },
  type: {
    type: 'enum',
    values: ['text_response', 'read_document', 'questionnaire'],
    required: true
  },
  status: {
    type: 'enum',
    values: ['pending', 'in_progress', 'completed', 'overdue'],
    default: 'pending',
    index: true
  },
  dueDate: {
    type: 'timestamp',
    required: false,
    index: true
  },
  metadata: {
    type: 'jsonb',
    required: false,
    // Structure depends on task type:
    // text_response: { prompt: string, minLength?: number, maxLength?: number }
    // read_document: { documentUrl: string, documentTitle: string }
    // questionnaire: { questions: Array<{ id, question, type, options? }> }
  },
  createdAt: {
    type: 'timestamp',
    default: 'now()',
    index: true
  },
  updatedAt: {
    type: 'timestamp',
    default: 'now()',
    onUpdate: 'now()'
  },
  completedAt: {
    type: 'timestamp',
    required: false
  }
};
