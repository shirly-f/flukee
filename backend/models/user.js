/**
 * User Model
 * 
 * Syncs with Notify Auth user records
 * Fields: id, email, role, name, createdAt, updatedAt
 */

export const UserSchema = {
  id: {
    type: 'string',
    primaryKey: true,
    required: true
  },
  email: {
    type: 'string',
    unique: true,
    required: true,
    index: true
  },
  role: {
    type: 'enum',
    values: ['coach', 'trainee'],
    required: true,
    index: true
  },
  name: {
    type: 'string',
    required: true
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
