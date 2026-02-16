import express from 'express';
import authRoutes from './auth.routes.js';

const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);

// Health check for API
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
