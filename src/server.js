import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api.js';
import { asyncHandler } from './utils/asyncHandler.js';
import { errorHandler } from './middlewares/error.middleware.js';

const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());

// 404 fallback
app.use("/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: 'hey!!'
  });
});

app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', asyncHandler(async (req, res) => {
  const health = {
    status: 'ok',
    server: 'up',
    provider: 'unknown',
    llm: 'unknown',
    timestamp: new Date().toISOString(),
  };
  res.status(200).json(health);
}));

// 404 fallback
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found'
  });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`ShopEase Support Service listening on http://localhost:${PORT}`);
});
export default app;
