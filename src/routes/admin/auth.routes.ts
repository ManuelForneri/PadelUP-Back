import { Router } from 'express';
import * as authController from '../../controllers/admin/auth.controller';

const router = Router();

// Admin authentication routes
router.post('/login', authController.login);

// Protect all routes after this middleware
router.use(authController.protect);

// Test protected route
router.get('/me', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      admin: (req as any).admin
    }
  });
});

export default router;
