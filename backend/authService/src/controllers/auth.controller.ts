import type { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log(req.body);
      const { name, email, password } = req.body;
    
      if (!name || !email || !password) {
        res.status(400).json({ success: false, error: 'Name, email, and password are required' });
        return;
      }

      const user = await authService.register(name, email, password);
      res.status(201).json({ success: true, data: { user } });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ success: false, error: 'Email and password are required' });
        return;
      }

      const loginData = await authService.login(email, password);
      res.status(200).json({ success: true, data: loginData });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }
      console.log("hello");
      console.log(req.user.userId);
      console.log(id);

      if (req.user.userId !== id) {
        res.status(403).json({ success: false, error: 'Forbidden' });
        return;
      }

      const user = await authService.getUserById(id as string);
      res.status(200).json({ success: true, data: { user } });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      if (!email || typeof email !== 'string') {
        res.status(400).json({ success: false, error: 'Email is required' });
        return;
      }

      const result = await authService.forgotPassword(email);
      res.status(200).json({ success: true, message: result.message, ...(result.token ? { token: result.token } : {}) });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token,newPassword } = req.body;
      const targetPassword =newPassword;

      if (!token || typeof token !== 'string' || !targetPassword || typeof targetPassword !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Token and new password are required',
        });
        return;
      }

      const result = await authService.resetPassword(token, targetPassword);
      res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
