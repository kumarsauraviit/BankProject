import type { ConnectionOptions } from 'bullmq';
import { env } from './env.js';

export const redisConnection: ConnectionOptions = env.redis.url
  ? {
      host: new URL(env.redis.url).hostname,
      port: parseInt(new URL(env.redis.url).port || '6379', 10),
      password: new URL(env.redis.url).password || undefined,
      maxRetriesPerRequest: null,
      enableOfflineQueue: false,
      retryStrategy: (times: number) => {
        if (times > 3) {
          return null; // Stop reconnecting if server is unavailable
        }
        return Math.min(times * 100, 1000);
      },
    }
  : {
      host: env.redis.host,
      port: env.redis.port,
      password: env.redis.password,
      maxRetriesPerRequest: null,
      enableOfflineQueue: false,
      retryStrategy: (times: number) => {
        if (times > 3) {
          return null; // Stop reconnecting if server is unavailable
        }
        return Math.min(times * 100, 1000);
      },
    };
