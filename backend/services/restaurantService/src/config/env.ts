import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from this service directory or the current working directory.
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

export const env = {
  port: parseInt(process.env.PORT || '5002', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
} as const;
