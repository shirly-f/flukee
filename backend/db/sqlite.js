/**
 * SQLite database - persistent storage
 * Replaces in-memory db, data survives server restart
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../data/flukee.db');

const sqlite = new Database(dbPath);

// Create tables if not exist
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL,
    name TEXT,
    password TEXT,
    createdAt TEXT,
    updatedAt TEXT
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    coachId TEXT NOT NULL,
    traineeId TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    type TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    dueDate TEXT,
    metadata TEXT DEFAULT '{}',
    createdAt TEXT,
    updatedAt TEXT,
    completedAt TEXT,
    FOREIGN KEY (coachId) REFERENCES users(id),
    FOREIGN KEY (traineeId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS task_responses (
    id TEXT PRIMARY KEY,
    taskId TEXT NOT NULL UNIQUE,
    traineeId TEXT NOT NULL,
    responseData TEXT DEFAULT '{}',
    status TEXT DEFAULT 'draft',
    submittedAt TEXT,
    createdAt TEXT,
    updatedAt TEXT,
    FOREIGN KEY (taskId) REFERENCES tasks(id)
  );

  CREATE TABLE IF NOT EXISTS relationships (
    id TEXT PRIMARY KEY,
    coachId TEXT NOT NULL,
    traineeId TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    createdAt TEXT,
    FOREIGN KEY (coachId) REFERENCES users(id),
    FOREIGN KEY (traineeId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    senderId TEXT NOT NULL,
    receiverId TEXT NOT NULL,
    content TEXT NOT NULL,
    read INTEGER DEFAULT 0,
    readAt TEXT,
    createdAt TEXT,
    FOREIGN KEY (senderId) REFERENCES users(id),
    FOREIGN KEY (receiverId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS push_tokens (
    userId TEXT NOT NULL,
    token TEXT NOT NULL,
    deviceId TEXT,
    updatedAt TEXT,
    PRIMARY KEY (userId, token),
    FOREIGN KEY (userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS auth_tokens (
    token TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    createdAt TEXT,
    FOREIGN KEY (userId) REFERENCES users(id)
  );
`);

function generateId(prefix = '') {
  return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function json(obj) {
  return typeof obj === 'string' ? JSON.parse(obj || '{}') : obj;
}

export const db = {
  users: {
    create(userData) {
      const id = userData.id || generateId('user_');
      const now = new Date().toISOString();
      const user = {
        id,
        email: userData.email,
        role: userData.role,
        name: userData.name,
        password: userData.password,
        createdAt: now,
        updatedAt: now,
      };
      sqlite.prepare(`
        INSERT INTO users (id, email, role, name, password, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(user.id, user.email, user.role, user.name, user.password, user.createdAt, user.updatedAt);
      return user;
    },

    findByEmail(email) {
      const row = sqlite.prepare('SELECT * FROM users WHERE email = ?').get(email);
      return row ? { ...row } : null;
    },

    findById(id) {
      const row = sqlite.prepare('SELECT * FROM users WHERE id = ?').get(id);
      return row ? { ...row } : null;
    },

    findAll() {
      return sqlite.prepare('SELECT * FROM users').all().map(r => ({ ...r }));
    },
  },

  tasks: {
    create(taskData) {
      const id = taskData.id || generateId('task_');
      const now = new Date().toISOString();
      const metadata = JSON.stringify(taskData.metadata || {});
      sqlite.prepare(`
        INSERT INTO tasks (id, coachId, traineeId, title, description, type, status, dueDate, metadata, createdAt, updatedAt, completedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id, taskData.coachId, taskData.traineeId, taskData.title || '',
        taskData.description || '', taskData.type, taskData.status || 'pending',
        taskData.dueDate || null, metadata, now, now, null
      );
      return db.tasks.findById(id);
    },

    findById(id) {
      const row = sqlite.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
      if (!row) return null;
      return { ...row, metadata: json(row.metadata) };
    },

    findByTraineeId(traineeId, filters = {}) {
      let sql = 'SELECT * FROM tasks WHERE traineeId = ?';
      const params = [traineeId];
      if (filters.status) {
        sql += ' AND status = ?';
        params.push(filters.status);
      }
      sql += ' ORDER BY createdAt DESC';
      return sqlite.prepare(sql).all(...params).map(r => ({ ...r, metadata: json(r.metadata) }));
    },

    findByCoachId(coachId, filters = {}) {
      let sql = 'SELECT * FROM tasks WHERE coachId = ?';
      const params = [coachId];
      if (filters.traineeId) {
        sql += ' AND traineeId = ?';
        params.push(filters.traineeId);
      }
      if (filters.status) {
        sql += ' AND status = ?';
        params.push(filters.status);
      }
      sql += ' ORDER BY createdAt DESC';
      return sqlite.prepare(sql).all(...params).map(r => ({ ...r, metadata: json(r.metadata) }));
    },

    update(id, updates) {
      const task = db.tasks.findById(id);
      if (!task) return null;
      const now = new Date().toISOString();
      const allowed = ['status', 'dueDate', 'completedAt', 'metadata', 'title', 'description'];
      const setParts = ['updatedAt = ?'];
      const values = [now];
      for (const k of allowed) {
        if (updates[k] !== undefined) {
          setParts.push(`${k} = ?`);
          values.push(k === 'metadata' ? JSON.stringify(updates[k]) : updates[k]);
        }
      }
      values.push(id);
      sqlite.prepare(`UPDATE tasks SET ${setParts.join(', ')} WHERE id = ?`).run(...values);
      return db.tasks.findById(id);
    },
  },

  taskResponses: {
    create(responseData) {
      const id = responseData.id || generateId('response_');
      const now = new Date().toISOString();
      const submittedAt = responseData.status === 'submitted' ? now : null;
      const responseDataStr = JSON.stringify(responseData.responseData || {});
      sqlite.prepare(`
        INSERT INTO task_responses (id, taskId, traineeId, responseData, status, submittedAt, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, responseData.taskId, responseData.traineeId, responseDataStr, responseData.status || 'draft', submittedAt, now, now);
      return { id, taskId: responseData.taskId, traineeId: responseData.traineeId, responseData: responseData.responseData, status: responseData.status, submittedAt, createdAt: now, updatedAt: now };
    },

    findByTaskId(taskId) {
      const row = sqlite.prepare('SELECT * FROM task_responses WHERE taskId = ?').get(taskId);
      if (!row) return null;
      return { ...row, responseData: json(row.responseData) };
    },

    update(id, updates) {
      const resp = sqlite.prepare('SELECT * FROM task_responses WHERE id = ?').get(id);
      if (!resp) return null;
      const now = new Date().toISOString();
      const responseData = updates.responseData !== undefined
        ? JSON.stringify(updates.responseData)
        : resp.responseData;
      const status = updates.status !== undefined ? updates.status : resp.status;
      const submittedAt = updates.submittedAt !== undefined ? updates.submittedAt : resp.submittedAt;
      sqlite.prepare(`
        UPDATE task_responses SET responseData = ?, status = ?, submittedAt = ?, updatedAt = ?
        WHERE id = ?
      `).run(responseData, status, submittedAt, now, id);
      const row = sqlite.prepare('SELECT * FROM task_responses WHERE id = ?').get(id);
      return row ? { ...row, responseData: json(row.responseData) } : null;
    },
  },

  relationships: {
    create(relationshipData) {
      const id = relationshipData.id || generateId('rel_');
      sqlite.prepare(`
        INSERT INTO relationships (id, coachId, traineeId, status, createdAt)
        VALUES (?, ?, ?, ?, ?)
      `).run(id, relationshipData.coachId, relationshipData.traineeId, relationshipData.status || 'active', new Date().toISOString());
      return { id, coachId: relationshipData.coachId, traineeId: relationshipData.traineeId, status: 'active', createdAt: new Date().toISOString() };
    },

    findByCoachId(coachId) {
      return sqlite.prepare('SELECT * FROM relationships WHERE coachId = ? AND status = ?').all(coachId, 'active');
    },

    findByTraineeId(traineeId) {
      return sqlite.prepare('SELECT * FROM relationships WHERE traineeId = ? AND status = ?').get(traineeId, 'active') || null;
    },

    findPair(coachId, traineeId) {
      return sqlite.prepare('SELECT * FROM relationships WHERE coachId = ? AND traineeId = ? AND status = ?').get(coachId, traineeId, 'active') || null;
    },
  },

  messages: {
    create(messageData) {
      const id = messageData.id || generateId('msg_');
      const now = new Date().toISOString();
      sqlite.prepare(`
        INSERT INTO messages (id, senderId, receiverId, content, read, readAt, createdAt)
        VALUES (?, ?, ?, ?, 0, NULL, ?)
      `).run(id, messageData.senderId, messageData.receiverId, messageData.content, now);
      return { id, senderId: messageData.senderId, receiverId: messageData.receiverId, content: messageData.content, read: false, readAt: null, createdAt: now };
    },

    findConversation(userId1, userId2) {
      return sqlite.prepare(`
        SELECT * FROM messages
        WHERE (senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?)
        ORDER BY createdAt ASC
      `).all(userId1, userId2, userId2, userId1);
    },
  },

  pushTokens: {
    save(userId, token, deviceId = null) {
      const now = new Date().toISOString();
      const existing = sqlite.prepare('SELECT * FROM push_tokens WHERE userId = ? AND token = ?').get(userId, token);
      if (existing) {
        sqlite.prepare('UPDATE push_tokens SET updatedAt = ? WHERE userId = ? AND token = ?').run(now, userId, token);
        return { token, deviceId, updatedAt: now };
      }
      sqlite.prepare('INSERT INTO push_tokens (userId, token, deviceId, updatedAt) VALUES (?, ?, ?, ?)').run(userId, token, deviceId, now);
      return { token, deviceId, updatedAt: now };
    },

    findByUserId(userId) {
      return sqlite.prepare('SELECT * FROM push_tokens WHERE userId = ?').all(userId).map(r => ({ token: r.token, deviceId: r.deviceId, updatedAt: r.updatedAt }));
    },
  },

  authTokens: {
    save(token, userId) {
      const now = new Date().toISOString();
      sqlite.prepare('INSERT INTO auth_tokens (token, userId, createdAt) VALUES (?, ?, ?)').run(token, userId, now);
      return { token, userId, createdAt: now };
    },

    findByToken(token) {
      const row = sqlite.prepare('SELECT * FROM auth_tokens WHERE token = ?').get(token);
      return row ? row.userId : null;
    },

    remove(token) {
      sqlite.prepare('DELETE FROM auth_tokens WHERE token = ?').run(token);
    },
  },
};

export function seedDatabase() {
  const count = sqlite.prepare('SELECT COUNT(*) as c FROM users').get();
  if (count.c > 0) return;

  const coach = db.users.create({
    id: 'coach_1',
    email: 'coach@test.com',
    password: 'password',
    name: 'Test Coach',
    role: 'coach',
  });

  const trainee = db.users.create({
    id: 'trainee_1',
    email: 'trainee@test.com',
    password: 'password',
    name: 'Test Trainee',
    role: 'trainee',
  });

  db.relationships.create({
    coachId: coach.id,
    traineeId: trainee.id,
    status: 'active',
  });

  console.log('Database seeded with test users:');
  console.log(`Coach: ${coach.email} / password`);
  console.log(`Trainee: ${trainee.email} / password`);
}
