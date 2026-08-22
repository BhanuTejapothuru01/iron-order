/**
 * Anti-Security & Threat Protection Utility
 * Provides input sanitization against XSS/Injection, secure password hashing (SHA-256),
 * and rate-limiting brute force protection for Iron Order.
 */

// Master Admin SHA-256 Hash for 'Teja@602142'
export const MASTER_ADMIN_EMAIL = 'tejapothuru94413@gmail.com';
export const MASTER_ADMIN_PASS_HASH = '822f0c92602c9a90baca26dbd4e3d504ab7d9458de61ee3cbda9e8db6ce9b1bd';

/**
 * Computes SHA-256 hash of a string using Web Crypto API.
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verifies admin password against master SHA-256 hash.
 */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  const hashed = await hashPassword(password);
  return hashed === MASTER_ADMIN_PASS_HASH;
}

/**
 * Sanitizes user text input against XSS scripts and HTML injection.
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/javascript:/gi, '')
    .replace(/onload=/gi, '')
    .replace(/onerror=/gi, '')
    .trim();
}

/**
 * Simple client-side brute-force lockout guard for sensitive logins.
 */
class RateLimiter {
  private attempts: number = 0;
  private lockedUntil: number = 0;

  public checkAllowed(): { allowed: boolean; remainingSeconds?: number } {
    const now = Date.now();
    if (this.lockedUntil > now) {
      const remainingSeconds = Math.ceil((this.lockedUntil - now) / 1000);
      return { allowed: false, remainingSeconds };
    }
    return { allowed: true };
  }

  public recordFailedAttempt(): { locked: boolean; remainingSeconds?: number } {
    this.attempts += 1;
    if (this.attempts >= 5) {
      this.lockedUntil = Date.now() + 5 * 60 * 1000; // 5-minute lockout
      this.attempts = 0;
      return { locked: true, remainingSeconds: 300 };
    }
    return { locked: false };
  }

  public reset(): void {
    this.attempts = 0;
    this.lockedUntil = 0;
  }
}

export const adminLoginRateLimiter = new RateLimiter();
