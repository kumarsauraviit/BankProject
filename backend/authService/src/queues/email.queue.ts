import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis.js';

export interface PasswordResetJobData {
  to: string;
  resetUrl: string;
}

export const EMAIL_QUEUE_NAME = 'email-queue';
export const PASSWORD_RESET_JOB = 'password-reset';

export const emailQueue = new Queue<PasswordResetJobData>(EMAIL_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

// Avoid unhandled rejection on queue connection error when Redis is offline in dev
emailQueue.on('error', (err) => {
  // Handled gracefully so the API continues serving responses without crashing
});
