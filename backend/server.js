import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticate, requireRole } from './middleware/auth.js';
import { createTask, getTaskDetails } from './api/coaches/tasks.js';
import { uploadDocument, uploadErrorHandler } from './api/upload.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { listTasks, getTaskDetails as getTraineeTaskDetails, submitTaskResponse, updateTaskStatus } from './api/trainees/tasks.js';
import { getMyCoach, getMyCoaches } from './api/trainees/coach.js';
import { listTrainees, getTraineeOverview, getTraineeTasks, addTrainee } from './api/coaches/trainees.js';
import { getMessages, sendMessage } from './api/messages/index.js';
import { login, register, getCurrentUser, getInvitePreview } from './api/auth.js';
import { googleSignIn } from './api/authGoogle.js';
import { registerPushToken } from './api/users/pushToken.js';
import { seedDatabase } from './db/index.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Seed database with test data
seedDatabase();

app.use(cors());
app.use(express.json());

// Static files for uploaded documents
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Auth routes (no auth required)
app.post('/auth/login', login);
app.post('/auth/register', register);
app.post('/auth/google', googleSignIn);
app.get('/auth/invite/:token', getInvitePreview);
app.get('/auth/me', authenticate, getCurrentUser);

// Coach routes
app.get('/api/coaches/trainees', authenticate, requireRole('coach'), listTrainees);
app.post('/api/coaches/trainees', authenticate, requireRole('coach'), addTrainee);
app.get('/api/coaches/trainees/:traineeId', authenticate, requireRole('coach'), getTraineeOverview);
app.get('/api/coaches/trainees/:traineeId/tasks', authenticate, requireRole('coach'), getTraineeTasks);
app.post('/api/upload', authenticate, requireRole('coach'), ...uploadDocument, uploadErrorHandler);
app.post('/api/coaches/tasks', authenticate, requireRole('coach'), createTask);
app.get('/api/coaches/tasks/:taskId', authenticate, requireRole('coach'), getTaskDetails);

// Trainee routes (using Router to avoid path matching issues)
const traineeRouter = express.Router();
traineeRouter.use(authenticate);
traineeRouter.use(requireRole('trainee'));
traineeRouter.get('/coach', getMyCoach);
traineeRouter.get('/coaches', getMyCoaches);
traineeRouter.get('/tasks', listTasks);
traineeRouter.get('/tasks/:taskId', getTraineeTaskDetails);
traineeRouter.post('/tasks/:taskId/response', submitTaskResponse);
traineeRouter.put('/tasks/:taskId/status', updateTaskStatus);
app.use('/api/trainees', traineeRouter);

// Messages routes
app.get('/api/messages', authenticate, getMessages);
app.post('/api/messages', authenticate, sendMessage);

// Push token (coach or trainee)
app.post('/api/users/me/push-token', authenticate, registerPushToken);

// 404 handler (catches unmatched routes)
app.use((req, res) => {
  console.warn('404:', req.method, req.originalUrl);
  res.status(404).json({ error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.originalUrl} not found` } });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT} (accepts connections from LAN)`);
});
