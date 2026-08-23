/**
 * Full Password Reset Token entity from database
 */
export interface PasswordResetToken {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  used_at: Date | null;
  created_at: Date;
}

/**
 * Data Transfer Object for creating a new password reset token record
 */
export interface CreatePasswordResetTokenDTO {
  user_id: string;
  token_hash: string;
  expires_at: Date;
}
