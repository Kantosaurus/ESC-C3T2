import crypto from "crypto";

/**
 * JWT Secret Management
 * 
 * This module handles JWT secret generation, validation, and rotation.
 * It ensures secrets meet security requirements and provides rotation capabilities.
 */

// Minimum secret length requirement (256 bits = 32 bytes)
const MIN_SECRET_LENGTH = 32;
// Maximum secret length (512 bits = 64 bytes)
const MAX_SECRET_LENGTH = 64;

/**
 * Validates JWT secret strength and requirements
 * @param secret - The secret to validate
 * @returns Validation result with error message if invalid
 */
function validateSecret(secret: string): { isValid: boolean; error?: string } {
  if (!secret) {
    return { isValid: false, error: "JWT secret is required" };
  }

  if (secret === "your_jwt_secret_here") {
    return { isValid: false, error: "Default JWT secret cannot be used in production" };
  }

  if (secret.length < MIN_SECRET_LENGTH) {
    return { isValid: false, error: `JWT secret must be at least ${MIN_SECRET_LENGTH} characters long` };
  }

  if (secret.length > MAX_SECRET_LENGTH) {
    return { isValid: false, error: `JWT secret cannot exceed ${MAX_SECRET_LENGTH} characters` };
  }

  // Check for sufficient entropy (at least 3 character types)
  const hasLower = /[a-z]/.test(secret);
  const hasUpper = /[A-Z]/.test(secret);
  const hasNumber = /\d/.test(secret);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(secret);
  
  const characterTypes = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
  
  if (characterTypes < 3) {
    return { isValid: false, error: "JWT secret must contain at least 3 character types (lowercase, uppercase, numbers, special characters)" };
  }

  return { isValid: true };
}

/**
 * Generates a cryptographically secure JWT secret
 * @returns A secure random secret
 */
function generateSecureSecret(): string {
  return crypto.randomBytes(32).toString('base64url');
}

/**
 * Gets the current JWT secret with validation
 * @returns The validated JWT secret as Uint8Array
 * @throws Error if secret is invalid or missing
 */
export function getJwtSecret(): Uint8Array {
  const secret = process.env.CARELY_JWT_SECRET;
  
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('CARELY_JWT_SECRET environment variable is required in production');
    }
    
    // In development, generate a secure secret and log it
    const generatedSecret = generateSecureSecret();
    console.warn('⚠️  No JWT secret found. Generated secure secret for development.');
    console.warn('⚠️  Set CARELY_JWT_SECRET environment variable for production use.');
    console.warn(`⚠️  Generated secret: ${generatedSecret}`);
    
    return new TextEncoder().encode(generatedSecret);
  }

  const validation = validateSecret(secret);
  if (!validation.isValid) {
    throw new Error(`Invalid JWT secret: ${validation.error}`);
  }

  return new TextEncoder().encode(secret);
}

/**
 * Gets the JWT secret rotation key (for future use)
 * @returns The rotation secret as Uint8Array
 */
export function getJwtRotationSecret(): Uint8Array {
  const rotationSecret = process.env.CARELY_JWT_ROTATION_SECRET;
  
  if (!rotationSecret) {
    // If no rotation secret is set, use the main secret
    return getJwtSecret();
  }

  const validation = validateSecret(rotationSecret);
  if (!validation.isValid) {
    throw new Error(`Invalid JWT rotation secret: ${validation.error}`);
  }

  return new TextEncoder().encode(rotationSecret);
}

/**
 * Validates if a secret rotation is needed
 * @returns Object indicating if rotation is needed and why
 */
export function checkSecretRotation(): { needsRotation: boolean; reason?: string } {
  const secretAge = process.env.CARELY_JWT_SECRET_AGE;
  
  if (!secretAge) {
    return { needsRotation: true, reason: "Secret age not tracked" };
  }

  const ageInDays = parseInt(secretAge, 10);
  const maxAgeDays = parseInt(process.env.CARELY_JWT_MAX_AGE_DAYS || '90', 10);
  
  if (ageInDays > maxAgeDays) {
    return { needsRotation: true, reason: `Secret is ${ageInDays} days old (max: ${maxAgeDays})` };
  }

  return { needsRotation: false };
}

// Export the main JWT secret for backward compatibility
export const jwtSecret = getJwtSecret();
