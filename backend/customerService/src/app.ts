import express from 'express';
import { errorHandler } from './middleware/error.middleware.js';
import { productRouter } from './routes/product.routes.js';

export const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'productService' });
});

app.use('/api/products', productRouter);

app.use(errorHandler);

export default app;
