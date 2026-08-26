import crypto from 'crypto';
import { env } from '../config/env.js';
import {
  getPostgresPool,
  passwordResetRepository,
  PasswordResetRepository,
  sanitizeUser,
  type LoginResponseData,
  type UserResponse,
  userRepository,
  UserRepository,
  UserStatus,
} from '@project/postgres';
import { hashPassword, comparePassword } from '../utils/password.js';
import { emailQueue, PASSWORD_RESET_JOB } from '../queues/email.queue.js';
import { generateToken } from '../utils/jwt.js';

export interface AuthMessageResponse {
  message: string;
  token?: string;
}

export class AuthService {
  constructor(
    private userRepo: UserRepository = userRepository,
    private tokenRepo: PasswordResetRepository = passwordResetRepository
  ) {}

  async register(name: string, email: string, password: string): Promise<UserResponse> {
    const existing = await this.userRepo.findByEmail(email);
    if (existing) {
      const error = new Error('User with this email already exists');
      (error as Error & { statusCode?: number }).statusCode = 409;
      throw error;
    }

    const password_hash = await hashPassword(password);
    const user = await this.userRepo.create({
      name,
      email,
      password_hash,
      status: UserStatus.ACTIVE,
    });

    return sanitizeUser(user);
  }

  async login(email: string, password: string): Promise<LoginResponseData> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      const error = new Error('User does not exist');
      (error as Error & { statusCode?: number }).statusCode = 401;
      throw error;
    }

    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      const error = new Error('Invalid email or password');
      (error as Error & { statusCode?: number }).statusCode = 401;
      throw error;
    }

    return {
      user: sanitizeUser(user),
      token: generateToken({ userId: user.id }),
    };
  }

  async getUserById(id: string): Promise<UserResponse> {
    const user = await this.userRepo.findById(id);
    if (!user) {
      const error = new Error('User not found');
      (error as Error & { statusCode?: number }).statusCode = 404;
      throw error;
    }
    return sanitizeUser(user);
  }

  /**
   * Generates a 5-minute single-use password reset token and enqueues an email job
   * Returns a generic response whether or not the email exists to prevent user enumeration
   */
  async forgotPassword(email: string): Promise<AuthMessageResponse> {
    const genericResponse: AuthMessageResponse = {
      message: 'If an account with that email exists, a password reset link has been sent.',
    };

    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.userRepo.findByEmail(normalizedEmail);

    if (!user) {
      return genericResponse;
    }

    // Generate cryptographically secure random token (32 bytes = 64 hex chars)
    const rawToken = crypto.randomBytes(32).toString('hex');

    // SHA-256 hash of token to store in the database
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    // Exactly 5 minutes expiration
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Persist hashed token record
    await this.tokenRepo.create({
      user_id: user.id,
      token_hash: tokenHash,
      expires_at: expiresAt,
    });

    // Construct reset URL containing the raw token
    const resetUrl = `${env.frontendUrl}/reset-password?token=${rawToken}`;

    // Asynchronously enqueue email sending job via BullMQ
    try {
      await emailQueue.add(PASSWORD_RESET_JOB, {
        to: user.email,
        resetUrl,
      });
    } catch (queueError: unknown) {
      // In case Redis is temporarily unreachable in dev/test, log error but do not leak error details to client
      const msg = queueError instanceof Error ? queueError.message : 'Queue error';
      console.error('⚠️ [AuthService] Failed to enqueue password-reset email:', msg);
    }

    if (env.nodeEnv === 'development') {
      return {
        ...genericResponse,
        token: rawToken,
      };
    }

    return genericResponse;
  }

  /**
   * Validates the single-use reset token and updates the user's password within a transaction
   * Returns generic 400 error for missing, expired, or already-used tokens
   */
  async resetPassword(token: string, newPassword: string): Promise<AuthMessageResponse> {
    const genericInvalidError = new Error('Invalid or expired password reset token');
    (genericInvalidError as Error & { statusCode?: number }).statusCode = 400;

    if (!token || !newPassword) {
      throw genericInvalidError;
    }

    // SHA-256 hash the provided raw token
    const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');

    // Find the token record in database
    const tokenRecord = await this.tokenRepo.findByTokenHash(tokenHash);

    // Verify token exists, is not already used, and has not expired
    const now = new Date();
    if (
      !tokenRecord ||
      tokenRecord.used_at !== null ||
      new Date(tokenRecord.expires_at).getTime() < now.getTime()
    ) {
      throw genericInvalidError;
    }

    // Hash the new password using existing bcrypt configuration
    const passwordHash = await hashPassword(newPassword);

    // Perform password update and token invalidation atomically in a transaction
    const client = await getPostgresPool().connect();
    try {
      await client.query('BEGIN');

      const userUpdated = await this.userRepo.updatePassword(tokenRecord.user_id, passwordHash, client);
      if (!userUpdated) {
        throw genericInvalidError;
      }

      const tokenUsed = await this.tokenRepo.markAsUsed(tokenRecord.id, client);
      if (!tokenUsed) {
        throw genericInvalidError;
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    return {
      message: 'Password has been successfully reset',
    };
  }
}

export const authService = new AuthService();
