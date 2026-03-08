/**
 * CoachTraineeRelationship Model
 * 
 * Links coaches to their trainees
 * MVP: One trainee can have one active coach
 */

export const CoachTraineeRelationshipSchema = {
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
    index: true,
    unique: 'active_relationship' // MVP: one active coach per trainee
  },
  status: {
    type: 'enum',
    values: ['active', 'inactive'],
    default: 'active'
  },
  createdAt: {
    type: 'timestamp',
    default: 'now()'
  }
};
