/**
 * User account status enum
 */
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED',
}

/**
 * Full User database entity (includes sensitive fields like password_hash)
 */
export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  status: UserStatus;
  created_at: Date;
  updated_at: Date;
}

/**
 * Public User representation safe for API responses (excludes password_hash)
 */
export interface UserResponse {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

/**
 * Data Transfer Object for creating a new user
 */
export interface CreateUserDTO {
  name: string;
  email: string;
  password_hash: string;
  status?: UserStatus;
}

/**
 * Data Transfer Object for updating an existing user
 */
export interface UpdateUserDTO {
  name?: string;
  status?: UserStatus;
}

/**
 * Security utility to sanitize user objects for API output
 * Ensures password_hash is never leaked to clients
 */
export function sanitizeUser(user: User): UserResponse {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    status: user.status,
    created_at: user.created_at.toISOString(),
    updated_at: user.updated_at.toISOString(),
  };
}

/**
 * Response structure for successful login containing sanitized user and JWT
 */
export interface LoginResponseData {
  user: UserResponse;
  token: string;
}

