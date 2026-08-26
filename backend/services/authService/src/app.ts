import express from 'express';
import { authRouter } from './routes/auth.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

export const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'authService' });
});

// Mount authentication routes on /api/auth and /auth
app.use('/api/auth', authRouter);
app.use('/auth', authRouter);

app.use(errorHandler);

export default app;
