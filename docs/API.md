# API Documentation

## Base URL
`https://api.notify.com/flukee` (or your Notify instance URL)

## Authentication
All endpoints (except auth) require Bearer token in header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### POST /auth/login
Login with email and password.

**Request:**
```json
{
  "email": "coach@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_123",
    "email": "coach@example.com",
    "role": "coach",
    "name": "John Coach"
  }
}
```

#### POST /auth/register
Register new user with role.

**Request:**
```json
{
  "email": "trainee@example.com",
  "password": "password123",
  "name": "Jane Trainee",
  "role": "trainee"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_456",
    "email": "trainee@example.com",
    "role": "trainee",
    "name": "Jane Trainee"
  }
}
```

#### GET /auth/me
Get current authenticated user.

**Response:**
```json
{
  "id": "user_123",
  "email": "coach@example.com",
  "role": "coach",
  "name": "John Coach"
}
```

---

### Coach Endpoints

#### GET /api/coaches/trainees
List all trainees assigned to the coach.

**Response:**
```json
{
  "trainees": [
    {
      "id": "user_456",
      "name": "Jane Trainee",
      "email": "trainee@example.com",
      "activeTasks": 3,
      "completedTasks": 12,
      "lastActive": "2026-02-10T10:30:00Z"
    }
  ]
}
```

#### GET /api/coaches/trainees/:traineeId
Get detailed overview of a trainee.

**Response:**
```json
{
  "trainee": {
    "id": "user_456",
    "name": "Jane Trainee",
    "email": "trainee@example.com"
  },
  "stats": {
    "totalTasks": 15,
    "completedTasks": 12,
    "pendingTasks": 2,
    "overdueTasks": 1,
    "completionRate": 0.8
  },
  "recentTasks": [
    {
      "id": "task_789",
      "title": "Complete workout log",
      "status": "completed",
      "completedAt": "2026-02-09T14:20:00Z"
    }
  ]
}
```

#### GET /api/coaches/trainees/:traineeId/tasks
Get all tasks for a specific trainee.

**Query Params:**
- `status` (optional): Filter by status (pending, completed, etc.)
- `limit` (optional): Pagination limit
- `offset` (optional): Pagination offset

**Response:**
```json
{
  "tasks": [
    {
      "id": "task_789",
      "title": "Complete workout log",
      "description": "Log your workouts for this week",
      "type": "text_response",
      "status": "completed",
      "dueDate": "2026-02-15T23:59:59Z",
      "createdAt": "2026-02-05T10:00:00Z",
      "completedAt": "2026-02-09T14:20:00Z",
      "response": {
        "id": "response_123",
        "status": "submitted",
        "submittedAt": "2026-02-09T14:20:00Z"
      }
    }
  ],
  "total": 15,
  "limit": 20,
  "offset": 0
}
```

#### POST /api/coaches/tasks
Create a new task for a trainee.

**Request:**
```json
{
  "traineeId": "user_456",
  "title": "Read nutrition guide",
  "description": "Please read the attached nutrition guide",
  "type": "read_document",
  "dueDate": "2026-02-20T23:59:59Z",
  "metadata": {
    "documentUrl": "https://storage.notify.com/documents/nutrition.pdf",
    "documentTitle": "Nutrition Guide 2026"
  }
}
```

**Response:**
```json
{
  "id": "task_790",
  "coachId": "user_123",
  "traineeId": "user_456",
  "title": "Read nutrition guide",
  "description": "Please read the attached nutrition guide",
  "type": "read_document",
  "status": "pending",
  "dueDate": "2026-02-20T23:59:59Z",
  "metadata": {
    "documentUrl": "https://storage.notify.com/documents/nutrition.pdf",
    "documentTitle": "Nutrition Guide 2026"
  },
  "createdAt": "2026-02-10T12:00:00Z"
}
```

#### GET /api/coaches/tasks/:taskId
Get task details including response.

**Response:**
```json
{
  "id": "task_789",
  "coachId": "user_123",
  "traineeId": "user_456",
  "title": "Complete workout log",
  "description": "Log your workouts for this week",
  "type": "text_response",
  "status": "completed",
  "dueDate": "2026-02-15T23:59:59Z",
  "metadata": {
    "prompt": "Describe your workout routine",
    "minLength": 100
  },
  "createdAt": "2026-02-05T10:00:00Z",
  "completedAt": "2026-02-09T14:20:00Z",
  "response": {
    "id": "response_123",
    "responseData": {
      "text": "I did strength training on Monday..."
    },
    "status": "submitted",
    "submittedAt": "2026-02-09T14:20:00Z"
  }
}
```

---

### Trainee Endpoints

#### GET /api/trainees/tasks
List all tasks assigned to the trainee.

**Query Params:**
- `status` (optional): Filter by status
- `limit`, `offset`: Pagination

**Response:**
```json
{
  "tasks": [
    {
      "id": "task_789",
      "title": "Complete workout log",
      "description": "Log your workouts for this week",
      "type": "text_response",
      "status": "pending",
      "dueDate": "2026-02-15T23:59:59Z",
      "createdAt": "2026-02-05T10:00:00Z",
      "hasResponse": false
    }
  ],
  "total": 5,
  "limit": 20,
  "offset": 0
}
```

#### GET /api/trainees/tasks/:taskId
Get task details.

**Response:**
```json
{
  "id": "task_789",
  "title": "Complete workout log",
  "description": "Log your workouts for this week",
  "type": "text_response",
  "status": "pending",
  "dueDate": "2026-02-15T23:59:59Z",
  "metadata": {
    "prompt": "Describe your workout routine",
    "minLength": 100,
    "maxLength": 1000
  },
  "response": {
    "id": "response_123",
    "responseData": {
      "text": "Draft text..."
    },
    "status": "draft"
  }
}
```

#### POST /api/trainees/tasks/:taskId/response
Create or update task response.

**Request (text_response):**
```json
{
  "responseData": {
    "text": "I completed my workout routine..."
  },
  "status": "submitted"
}
```

**Request (read_document):**
```json
{
  "responseData": {
    "markedAsDone": true,
    "timestamp": "2026-02-10T15:30:00Z"
  },
  "status": "submitted"
}
```

**Request (questionnaire):**
```json
{
  "responseData": {
    "answers": [
      {
        "questionId": "q1",
        "answer": "Option A"
      },
      {
        "questionId": "q2",
        "answer": ["Option B", "Option C"]
      }
    ]
  },
  "status": "submitted"
}
```

**Response:**
```json
{
  "id": "response_123",
  "taskId": "task_789",
  "responseData": {
    "text": "I completed my workout routine..."
  },
  "status": "submitted",
  "submittedAt": "2026-02-10T15:30:00Z"
}
```

#### PUT /api/trainees/tasks/:taskId/status
Update task status (e.g., mark as in_progress).

**Request:**
```json
{
  "status": "in_progress"
}
```

---

### Messages

#### GET /api/messages
Get conversation messages.

**Query Params:**
- `with` (required): User ID of the other participant

**Response:**
```json
{
  "messages": [
    {
      "id": "msg_123",
      "senderId": "user_123",
      "receiverId": "user_456",
      "content": "How are you doing with the tasks?",
      "read": true,
      "readAt": "2026-02-10T11:00:00Z",
      "createdAt": "2026-02-10T10:30:00Z"
    },
    {
      "id": "msg_124",
      "senderId": "user_456",
      "receiverId": "user_123",
      "content": "Going well, thanks!",
      "read": false,
      "createdAt": "2026-02-10T11:15:00Z"
    }
  ]
}
```

#### POST /api/messages
Send a message.

**Request:**
```json
{
  "receiverId": "user_456",
  "content": "Great work on completing the tasks!"
}
```

**Response:**
```json
{
  "id": "msg_125",
  "senderId": "user_123",
  "receiverId": "user_456",
  "content": "Great work on completing the tasks!",
  "read": false,
  "createdAt": "2026-02-10T12:00:00Z"
}
```

#### PUT /api/messages/:messageId/read
Mark message as read.

**Response:**
```json
{
  "id": "msg_125",
  "read": true,
  "readAt": "2026-02-10T12:05:00Z"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

**Common Error Codes:**
- `UNAUTHORIZED` (401): Missing or invalid token
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `VALIDATION_ERROR` (400): Invalid request data
- `SERVER_ERROR` (500): Internal server error
