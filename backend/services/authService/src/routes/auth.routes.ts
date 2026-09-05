import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authMiddleware } from '@project/shared-types';

const router = Router();

router.post('/register', (req, res, next) => authController.register(req, res, next));
router.post('/login', (req, res, next) => authController.login(req, res, next));
router.get('/users/:id', authMiddleware, (req, res, next) => authController.getProfile(req, res, next));
router.post('/forgot-password', (req, res, next) => authController.forgotPassword(req, res, next));
router.post('/reset-password', (req, res, next) => authController.resetPassword(req, res, next));

export const authRouter = router;
