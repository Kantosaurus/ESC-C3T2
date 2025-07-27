import crypto from "crypto";

/**
 * JWT Secret Management Utilities
 *
 * This module provides utilities for generating, validating, and rotating JWT secrets.
 */

/**
 * Generates a cryptographically secure JWT secret
 * @returns A secure random secret with proper entropy
 */
export function generateSecureSecret(): string {
  // Generate 32 bytes (256 bits) of random data
  const randomBytes = crypto.randomBytes(32);

  // Convert to base64url for URL-safe encoding
  return randomBytes.toString("base64url");
}

/**
 * Generates a secure secret with specific requirements
 * @param length - Desired length of the secret (32-64 characters)
 * @returns A secure secret meeting the specified length
 */
export function generateSecretWithLength(length: number): string {
  if (length < 32 || length > 64) {
    throw new Error("Secret length must be between 32 and 64 characters");
  }

  // Generate enough random bytes to meet the length requirement
  const bytesNeeded = Math.ceil(length * 0.75); // base64url encoding ratio
  const randomBytes = crypto.randomBytes(bytesNeeded);

  // Convert to base64url and truncate to desired length
  return randomBytes.toString("base64url").substring(0, length);
}

/**
 * Validates a secret and provides detailed feedback
 * @param secret - The secret to validate
 * @returns Detailed validation result
 */
export function validateSecretWithDetails(secret: string): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  strength: "weak" | "medium" | "strong";
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic validation
  if (!secret) {
    errors.push("Secret is required");
    return { isValid: false, errors, warnings, strength: "weak" };
  }

  if (secret === "your_jwt_secret_here") {
    errors.push("Default JWT secret cannot be used");
    return { isValid: false, errors, warnings, strength: "weak" };
  }

  // Length validation
  if (secret.length < 32) {
    errors.push("Secret must be at least 32 characters long");
  } else if (secret.length < 40) {
    warnings.push(
      "Consider using a longer secret (40+ characters) for better security"
    );
  }

  if (secret.length > 64) {
    errors.push("Secret cannot exceed 64 characters");
  }

  // Character type validation
  const hasLower = /[a-z]/.test(secret);
  const hasUpper = /[A-Z]/.test(secret);
  const hasNumber = /\d/.test(secret);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(secret);

  const characterTypes = [hasLower, hasUpper, hasNumber, hasSpecial].filter(
    Boolean
  ).length;

  if (characterTypes < 3) {
    errors.push(
      "Secret must contain at least 3 character types (lowercase, uppercase, numbers, special characters)"
    );
  } else if (characterTypes === 3) {
    warnings.push(
      "Consider including all 4 character types for maximum security"
    );
  }

  // Entropy calculation
  const entropy = calculateEntropy(secret);
  let strength: "weak" | "medium" | "strong" = "weak";

  if (entropy < 3.5) {
    errors.push("Secret has insufficient entropy");
  } else if (entropy < 4.0) {
    warnings.push(
      "Secret has moderate entropy, consider increasing complexity"
    );
    strength = "medium";
  } else {
    strength = "strong";
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    strength,
  };
}

/**
 * Calculates the entropy of a secret
 * @param secret - The secret to analyze
 * @returns Entropy score (higher is better)
 */
function calculateEntropy(secret: string): number {
  const totalChars = secret.length;

  // Calculate entropy using Shannon's formula
  const probabilities = new Map<string, number>();

  for (const char of secret) {
    probabilities.set(char, (probabilities.get(char) || 0) + 1);
  }

  let entropy = 0;
  for (const [, count] of probabilities) {
    const probability = count / totalChars;
    entropy -= probability * Math.log2(probability);
  }

  return entropy;
}

/**
 * Creates a secret rotation plan
 * @returns Rotation plan with new secret and instructions
 */
export function createRotationPlan(): {
  newSecret: string;
  rotationSecret: string;
  instructions: string[];
} {
  const newSecret = generateSecureSecret();
  const rotationSecret = generateSecureSecret();

  const instructions = [
    "1. Set CARELY_JWT_ROTATION_SECRET to the current secret value",
    "2. Set CARELY_JWT_SECRET to the new secret value",
    "3. Set CARELY_JWT_SECRET_AGE to 0",
    "4. Restart the application",
    "5. Monitor for any authentication issues",
    "6. After 24 hours, remove CARELY_JWT_ROTATION_SECRET",
    "7. Update CARELY_JWT_SECRET_AGE to track the new secret's age",
  ];

  return {
    newSecret,
    rotationSecret,
    instructions,
  };
}

/**
 * CLI utility for secret management
 * Run with: npx tsx src/auth/secret-utils.ts
 */
if (require.main === module) {
  const command = process.argv[2];

  switch (command) {
    case "generate":
      console.log("Generated secure secret:", generateSecureSecret());
      break;

    case "validate": {
      const secret = process.argv[3];
      if (!secret) {
        console.error(
          "Usage: npx tsx src/auth/secret-utils.ts validate <secret>"
        );
        process.exit(1);
      }
      const result = validateSecretWithDetails(secret);
      console.log("Validation result:", JSON.stringify(result, null, 2));
      break;
    }

    case "rotate": {
      const plan = createRotationPlan();
      console.log("Rotation plan:", JSON.stringify(plan, null, 2));
      break;
    }

    default:
      console.log(`
JWT Secret Management Utilities

Usage:
  npx tsx src/auth/secret-utils.ts generate
  npx tsx src/auth/secret-utils.ts validate <secret>
  npx tsx src/auth/secret-utils.ts rotate <current-secret>
      `);
  }
}
