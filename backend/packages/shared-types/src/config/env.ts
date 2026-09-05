import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const mongoDbUri = process.env.MONGODB_URI;

if (!mongoDbUri || mongoDbUri.trim() === '') {
  console.error('[Config Error] FATAL: MONGODB_URI is not set in the environment variables.');
  process.exit(1);
}

const jwtSecret = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'dev_jwt_secret_key_change_in_production');

if (!jwtSecret) {
  console.error('[Config Error] FATAL: JWT_SECRET is not set in the environment variables.');
  process.exit(1);
}

export const env = {
  port: parseInt(process.env.PORT || '5001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoDbUri,
  jwt: {
    secret: jwtSecret,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
} as const;
