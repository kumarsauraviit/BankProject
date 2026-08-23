import { Worker, type Job } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import { EMAIL_QUEUE_NAME, PASSWORD_RESET_JOB, type PasswordResetJobData } from '../queues/email.queue.js';
import { emailService } from '../services/email.service.js';

export const emailWorker = new Worker<PasswordResetJobData>(
  EMAIL_QUEUE_NAME,
  async (job: Job<PasswordResetJobData>) => {
    console.log(job);
    if (job.name === PASSWORD_RESET_JOB) {
      const { to, resetUrl } = job.data;
      await emailService.sendPasswordResetEmail(to, resetUrl);
    }
  },
  {
    connection: redisConnection,
  }
);

emailWorker.on('completed', (job: Job) => {
  console.log(`✅ [EmailWorker] Job ${job.id} of type ${job.name} completed successfully.`);
});

emailWorker.on('failed', (job: Job | undefined, err: Error) => {
  console.error(`❌ [EmailWorker] Job ${job?.id} of type ${job?.name} failed:`, err.message);
});

console.log('📬 [EmailWorker] Worker initialized and listening for email jobs...');
