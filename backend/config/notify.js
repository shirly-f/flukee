/**
 * Notify Configuration
 * 
 * Configure Notify backend services:
 * - Database connection
 * - Auth service
 * - Messaging service
 * - Storage service
 */

export const notifyConfig = {
  // Notify project configuration
  projectId: process.env.NOTIFY_PROJECT_ID,
  apiKey: process.env.NOTIFY_API_KEY,
  
  // Database configuration
  database: {
    host: process.env.NOTIFY_DB_HOST,
    port: process.env.NOTIFY_DB_PORT || 5432,
    name: process.env.NOTIFY_DB_NAME,
    user: process.env.NOTIFY_DB_USER,
    password: process.env.NOTIFY_DB_PASSWORD,
  },
  
  // Auth configuration
  auth: {
    serviceUrl: process.env.NOTIFY_AUTH_URL,
    jwtSecret: process.env.NOTIFY_JWT_SECRET,
  },
  
  // Messaging configuration
  messaging: {
    serviceUrl: process.env.NOTIFY_MESSAGING_URL,
    channel: 'flukee_messages',
  },
  
  // Storage configuration
  storage: {
    serviceUrl: process.env.NOTIFY_STORAGE_URL,
    bucket: process.env.NOTIFY_STORAGE_BUCKET,
  },
};
