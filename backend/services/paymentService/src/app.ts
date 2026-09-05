import express from 'express';

const app = express();
const PORT = process.env.PORT || 5003;

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'paymentService' });
});

app.listen(PORT, () => {
  console.log(`Payment service running on port ${PORT}`);
});

export default app;
