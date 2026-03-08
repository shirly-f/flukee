# Backend Database Schema (Notify)

## Overview
This document defines the database schema for the Flukee coaching platform MVP, designed to work with Notify's native backend, auth, database, and messaging capabilities.

## Models

### 1. User
**Purpose**: Core user authentication and profile data (managed by Notify Auth)

**Fields**:
- `id` (string, primary key) - User ID from Notify Auth
- `email` (string, unique, required) - Email address (used for login)
- `role` (enum: 'coach' | 'trainee', required) - User role
- `name` (string, required) - Full name
- `createdAt` (timestamp) - Account creation date
- `updatedAt` (timestamp) - Last update date

**Indexes**:
- `email` (unique)
- `role`

---

### 2. CoachTraineeRelationship
**Purpose**: Links coaches to their trainees (many-to-many support for future, but MVP is 1:many)

**Fields**:
- `id` (string, primary key)
- `coachId` (string, foreign key → User.id, required) - Coach user ID
- `traineeId` (string, foreign key → User.id, required) - Trainee user ID
- `createdAt` (timestamp) - Relationship creation date
- `status` (enum: 'active' | 'inactive', default: 'active') - Relationship status

**Indexes**:
- `coachId`
- `traineeId`
- Composite unique: `(coachId, traineeId)`

**Constraints**:
- Coach and trainee must have correct roles
- One trainee can have one active coach (MVP constraint)

---

### 3. Task
**Purpose**: Tasks created by coaches for trainees

**Fields**:
- `id` (string, primary key)
- `coachId` (string, foreign key → User.id, required) - Creator coach
- `traineeId` (string, foreign key → User.id, required) - Assigned trainee
- `title` (string, required) - Task title
- `description` (text, optional) - Task description
- `type` (enum: 'text_response' | 'read_document' | 'questionnaire', required) - Task type
- `status` (enum: 'pending' | 'in_progress' | 'completed' | 'overdue', default: 'pending') - Task status
- `dueDate` (timestamp, optional) - Optional due date
- `metadata` (jsonb, optional) - Type-specific data:
  - `text_response`: `{ prompt: string, minLength?: number, maxLength?: number }`
  - `read_document`: `{ documentUrl: string, documentTitle: string }`
  - `questionnaire`: `{ questions: Array<{ id: string, question: string, type: 'text' | 'multiple_choice', options?: string[] }> }`
- `createdAt` (timestamp) - Task creation date
- `updatedAt` (timestamp) - Last update date
- `completedAt` (timestamp, optional) - Completion date

**Indexes**:
- `coachId`
- `traineeId`
- `status`
- `dueDate`
- `createdAt` (descending for recent tasks)

---

### 4. TaskResponse
**Purpose**: Trainee responses to tasks

**Fields**:
- `id` (string, primary key)
- `taskId` (string, foreign key → Task.id, required, unique) - One response per task
- `traineeId` (string, foreign key → User.id, required) - Responder
- `responseData` (jsonb, required) - Type-specific response:
  - `text_response`: `{ text: string }`
  - `read_document`: `{ markedAsDone: boolean, timestamp: timestamp }`
  - `questionnaire`: `{ answers: Array<{ questionId: string, answer: string | string[] }> }`
- `status` (enum: 'draft' | 'submitted', default: 'draft') - Response status
- `submittedAt` (timestamp, optional) - Submission timestamp
- `createdAt` (timestamp) - Response creation date
- `updatedAt` (timestamp) - Last update date

**Indexes**:
- `taskId` (unique)
- `traineeId`
- `status`
- `submittedAt`

---

### 5. Message
**Purpose**: 1:1 messaging between coach and trainee (using Notify messaging)

**Fields**:
- `id` (string, primary key)
- `senderId` (string, foreign key → User.id, required) - Message sender
- `receiverId` (string, foreign key → User.id, required) - Message receiver
- `content` (text, required) - Message content
- `read` (boolean, default: false) - Read status
- `readAt` (timestamp, optional) - Read timestamp
- `createdAt` (timestamp) - Message creation date

**Indexes**:
- `senderId`
- `receiverId`
- `createdAt` (descending for recent messages)
- Composite: `(senderId, receiverId, createdAt)`

**Constraints**:
- Sender and receiver must be coach-trainee pair (validated in API)

---

## Data Relationships

```
User (coach)
  └─< CoachTraineeRelationship >─┐
                                  │
User (trainee)                    │
  └─< Task (assigned)             │
      └─< TaskResponse            │
  └─< Message (sender/receiver)   │
```

## API Endpoints Structure

### Authentication (Notify Auth)
- `POST /auth/login` - Email/password login
- `POST /auth/register` - Register with role
- `POST /auth/logout` - Logout
- `GET /auth/me` - Get current user

### Coaches
- `GET /api/coaches/trainees` - List all trainees
- `GET /api/coaches/trainees/:traineeId` - Get trainee overview
- `GET /api/coaches/trainees/:traineeId/tasks` - Get trainee tasks
- `POST /api/coaches/tasks` - Create task
- `GET /api/coaches/tasks/:taskId` - Get task details
- `GET /api/coaches/tasks/:taskId/response` - Get task response

### Trainees
- `GET /api/trainees/tasks` - List assigned tasks
- `GET /api/trainees/tasks/:taskId` - Get task details
- `POST /api/trainees/tasks/:taskId/response` - Submit/update task response
- `PUT /api/trainees/tasks/:taskId/status` - Update task status (e.g., mark as done)

### Messages
- `GET /api/messages` - Get conversation (with query param: `with=userId`)
- `POST /api/messages` - Send message
- `PUT /api/messages/:messageId/read` - Mark message as read

## Notes

1. **Notify Auth Integration**: User authentication is handled by Notify's auth service. The `User` model syncs with Notify Auth user records.

2. **Role-Based Access**: All endpoints validate user role and ownership (coaches can only access their trainees, trainees can only access their own data).

3. **Real-time Updates**: Use Notify messaging for:
   - Task assignment notifications
   - Task completion notifications
   - New messages
   - Status updates

4. **File Storage**: For `read_document` tasks, store document URLs (Notify storage or external S3/CDN).

5. **MVP Constraints**:
   - One trainee → one coach (enforced by unique active relationship)
   - Simple 1:1 messaging (no group chats)
   - Basic task types only
