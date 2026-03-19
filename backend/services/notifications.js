/**
 * Notification Service
 * Sends email and push notifications for task events
 *
 * Email - use ONE of these:
 * 1. Resend (recommended): RESEND_API_KEY - just add the key, works out of the box
 * 2. SMTP: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM
 * If neither is set, emails are logged to console only
 */

import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { Expo } from 'expo-server-sdk';
import { db } from '../db/index.js';

const expo = new Expo();

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Resend: use onboarding@resend.dev for testing (no domain verify). Or set MAIL_FROM to your verified domain.
const resendFrom = process.env.MAIL_FROM || 'Flukee <onboarding@resend.dev>';

// SMTP transporter - fallback if Resend not used
function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (host && user && pass) {
    console.log('[SMTP] Configured:', host, 'port', port, 'user', user);
    return nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
  }
  return null;
}

const smtpTransporter = getTransporter();
const smtpFrom = process.env.MAIL_FROM || process.env.SMTP_USER || 'noreply@flukee.app';

if (resend) {
  console.log('[Email] Using Resend. From:', resendFrom);
} else if (!smtpTransporter) {
  console.log('[Email] Not configured. Add RESEND_API_KEY (recommended) or SMTP_* env vars. Emails will be logged only.');
}

/**
 * Send email - uses Resend if configured, else SMTP, else logs
 */
export async function sendEmail(to, subject, html) {
  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from: resendFrom,
        to,
        subject,
        html,
      });
      if (error) {
        console.error('[Email] Resend failed to', to, error.message);
        return false;
      }
      console.log('[Email] Sent via Resend to', to);
      return true;
    } catch (err) {
      console.error('[Email] Resend error to', to, err.message || err);
      return false;
    }
  }
  if (smtpTransporter) {
    try {
      await smtpTransporter.sendMail({ from: smtpFrom, to, subject, html });
      console.log('[Email] Sent via SMTP to', to);
      return true;
    } catch (err) {
      console.error('[Email] SMTP failed to', to, err.message || err);
      return false;
    }
  }
  console.log('[Email] (not sent, no provider configured)', { to, subject, html: html?.slice(0, 80) + '...' });
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
