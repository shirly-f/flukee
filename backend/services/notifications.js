/**
 * Notification Service
 * Sends email and push notifications for task events
 *
 * Configure via env:
 * - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM - for email
 * - If not set, emails are logged to console
 */

import nodemailer from 'nodemailer';
import { Expo } from 'expo-server-sdk';
import { db } from '../db/index.js';

const expo = new Expo();

// Email transporter - use env or create a no-op for dev
function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (host && user && pass) {
    return nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
  }
  return null;
}

const transporter = getTransporter();
const mailFrom = process.env.MAIL_FROM || 'noreply@flukee.app';

/**
 * Send email - uses SMTP if configured, otherwise logs
 */
export async function sendEmail(to, subject, html) {
  if (transporter) {
    try {
      await transporter.sendMail({ from: mailFrom, to, subject, html });
      return true;
    } catch (err) {
      console.error('Email send error:', err);
      return false;
    }
  }
  console.log('[Email]', { to, subject, html: html?.slice(0, 100) + '...' });
  return true;
}

/**
 * Send push notification via Expo
 */
export async function sendPushNotification(pushToken, title, body, data = {}) {
  if (!Expo.isExpoPushToken(pushToken)) {
    console.warn('Invalid Expo push token:', pushToken?.slice(0, 20) + '...');
    return false;
  }
  try {
    const messages = [{ to: pushToken, sound: 'default', title, body, data }];
    const chunks = expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      await expo.sendPushNotificationsAsync(chunk);
    }
    return true;
  } catch (err) {
    console.error('Push send error:', err);
    return false;
  }
}

/**
 * Get push tokens for a user
 */
function getPushTokens(userId) {
  return db.pushTokens?.findByUserId(userId) || [];
}

/**
 * Notify trainee: new task assigned by coach
 */
export async function notifyTraineeTaskAssigned(task, coach, trainee) {
  const subject = `New practice: ${task.title}`;
  const html = `
    <p>Hi ${trainee.name},</p>
    <p>${coach.name} has assigned you a new practice:</p>
    <p><strong>${task.title}</strong></p>
    ${task.description ? `<p>${task.description}</p>` : ''}
    <p>Open the Flukee app to get started.</p>
  `;
  await sendEmail(trainee.email, subject, html);

  const tokens = getPushTokens(trainee.id);
  for (const t of tokens) {
    await sendPushNotification(t.token, 'New practice', task.title, { taskId: task.id, type: 'task_assigned' });
  }
}

/**
 * Send coach invite email to trainee
 * @param {Object} invite - { email, token, domain }
 * @param {Object} coach - { name }
 */
export async function sendInviteEmail(invite, coach) {
  const appUrl = process.env.APP_BASE_URL || process.env.FRONTEND_URL || 'https://flukee-web.netlify.app';
  const inviteLink = `${appUrl}/login?invite=${invite.token}`;
  const subject = `${coach.name} invited you to Flukee`;
  const domainLine = invite.domain ? `<p>Focus area: ${invite.domain}</p>` : '';
  const html = `
    <p>Hi,</p>
    <p>${coach.name} has invited you to join Flukee — a space for reflection and practices.</p>
    ${domainLine}
    <p><a href="${inviteLink}" style="display:inline-block;padding:12px 24px;background:#6b9080;color:white;text-decoration:none;border-radius:8px;">Accept invitation</a></p>
    <p>Or copy this link: ${inviteLink}</p>
  `;
  return sendEmail(invite.email, subject, html);
}

/**
 * Notify coach: trainee completed a task
 */
export async function notifyCoachTaskCompleted(task, coach, trainee) {
  const subject = `${trainee.name} completed: ${task.title}`;
  const html = `
    <p>Hi ${coach.name},</p>
    <p>${trainee.name} has completed a practice:</p>
    <p><strong>${task.title}</strong></p>
    <p>Open the Flukee portal to view their response.</p>
  `;
  await sendEmail(coach.email, subject, html);

  const tokens = getPushTokens(coach.id);
  for (const t of tokens) {
    await sendPushNotification(t.token, 'Practice completed', `${trainee.name} completed: ${task.title}`, {
      taskId: task.id,
      traineeId: trainee.id,
      type: 'task_completed',
    });
  }
}
