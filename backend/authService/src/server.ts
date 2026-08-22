import express from 'express';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'authService' });
});

app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});
