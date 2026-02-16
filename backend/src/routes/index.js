import express from 'express';
import authRoutes from './auth.routes.js';
import boardRoutes from './board.routes.js';
import listRoutes from './list.routes.js';
import taskRoutes from './task.routes.js';

const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/boards', boardRoutes);
router.use('/', listRoutes); // List routes include board context in path
router.use('/', taskRoutes); // Task routes include list/board context in path

// Health check for API
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;


