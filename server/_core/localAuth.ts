/**
 * Local authentication helpers (email/password)
 */

import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";

const SALT_ROUNDS = 10;
const TOKEN_BYTES = 32;
const TOKEN_EXPIRY_HOURS = 24;

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Generate a secure random token for email verification or password reset
 */
export function generateToken(): string {
  return randomBytes(TOKEN_BYTES).toString("hex");
}

/**
 * Generate token expiry date (24 hours from now by default)
 */
export function generateTokenExpiry(hours: number = TOKEN_EXPIRY_HOURS): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + hours);
  return expiry;
}

/**
 * Check if a token has expired
 */
export function isTokenExpired(expiry: Date | null): boolean {
  if (!expiry) return true;
  return new Date() > expiry;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * Requirements: min 8 chars, at least one uppercase, one lowercase, one number, and one special character
 */
export function isValidPassword(password: string): boolean {
  if (password.length < 8) return false;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
}

/**
 * Get password validation error message
 */
export function getPasswordValidationError(password: string): string | null {
  if (password.length < 8) {
    return "Senha deve ter no mínimo 8 caracteres";
  }
  if (!/[A-Z]/.test(password)) {
    return "Senha deve conter pelo menos uma letra maiúscula";
  }
  if (!/[a-z]/.test(password)) {
    return "Senha deve conter pelo menos uma letra minúscula";
  }
  if (!/[0-9]/.test(password)) {
    return "Senha deve conter pelo menos um número";
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return "Senha deve conter pelo menos um caractere especial (!@#$%^&*...)";
  }
  return null;
}
