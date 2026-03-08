/**
 * TaskResponse Model
 * 
 * Trainee responses to tasks
 * One response per task (unique taskId)
 */

export const TaskResponseSchema = {
  id: {
    type: 'string',
    primaryKey: true,
    required: true
  },
  taskId: {
    type: 'string',
    foreignKey: 'Task.id',
    required: true,
    unique: true,
    index: true
  },
  traineeId: {
    type: 'string',
    foreignKey: 'User.id',
    required: true,
    index: true
  },
  responseData: {
    type: 'jsonb',
    required: true,
    // Structure depends on task type:
    // text_response: { text: string }
    // read_document: { markedAsDone: boolean, timestamp: timestamp }
    // questionnaire: { answers: Array<{ questionId: string, answer: string | string[] }> }
  },
  status: {
    type: 'enum',
    values: ['draft', 'submitted'],
    default: 'draft',
    index: true
  },
  submittedAt: {
    type: 'timestamp',
    required: false,
    index: true
  },
  createdAt: {
    type: 'timestamp',
    default: 'now()'
  },
  updatedAt: {
    type: 'timestamp',
    default: 'now()',
    onUpdate: 'now()'
  }
};
