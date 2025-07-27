# JWT Secret Management

This module provides secure JWT secret management with validation, rotation capabilities, and best practices.

## Features

- **Secure Secret Generation**: Cryptographically secure random secrets
- **Secret Validation**: Comprehensive validation of secret strength and requirements
- **Secret Rotation**: Support for seamless secret rotation without downtime
- **Environment Validation**: Proper environment variable handling
- **Development Safety**: Automatic secure secret generation in development

## Environment Variables

### Required
- `CARELY_JWT_SECRET`: The primary JWT signing secret (32-64 characters)

### Optional
- `CARELY_JWT_ROTATION_SECRET`: Secret for rotation (32-64 characters)
- `CARELY_JWT_SECRET_AGE`: Age of current secret in days (for rotation tracking)
- `CARELY_JWT_MAX_AGE_DAYS`: Maximum age before rotation is recommended (default: 90)

## Secret Requirements

### Minimum Requirements
- **Length**: At least 32 characters
- **Character Types**: At least 3 of the following:
  - Lowercase letters (a-z)
  - Uppercase letters (A-Z)
  - Numbers (0-9)
  - Special characters (!@#$%^&*()_+-=[]{}|;':",./<>?)
- **Entropy**: Sufficient randomness (calculated using Shannon's formula)

### Recommended
- **Length**: 40-64 characters
- **Character Types**: All 4 character types
- **Entropy**: High entropy score (>4.0)

## Usage

### Basic Usage
```typescript
import { getJwtSecret, getJwtRotationSecret } from './auth/secret';

// Get the current JWT secret
const secret = getJwtSecret();

// Get the rotation secret (falls back to main secret if not set)
const rotationSecret = getJwtRotationSecret();
```

### Secret Validation
```typescript
import { checkSecretRotation } from './auth/secret';

// Check if secret rotation is needed
const rotation = checkSecretRotation();
if (rotation.needsRotation) {
  console.warn(`Rotation needed: ${rotation.reason}`);
}
```

## Secret Rotation

### Why Rotate Secrets?
- **Security**: Reduces the impact of secret compromise
- **Compliance**: Many security standards require regular rotation
- **Best Practice**: Industry standard for JWT security

### Rotation Process

1. **Generate New Secret**
   ```bash
   npx tsx src/auth/secret-utils.ts generate
   ```

2. **Create Rotation Plan**
   ```bash
   npx tsx src/auth/secret-utils.ts rotate
   ```

3. **Update Environment Variables**
   ```bash
   # Set rotation secret to current secret
   export CARELY_JWT_ROTATION_SECRET="current-secret-value"
   
   # Set new secret
   export CARELY_JWT_SECRET="new-secret-value"
   
   # Reset age counter
   export CARELY_JWT_SECRET_AGE="0"
   ```

4. **Restart Application**
   - The application will now accept tokens signed with both secrets
   - New tokens will be signed with the new secret

5. **Monitor and Clean Up**
   - Monitor for authentication issues
   - After 24 hours, remove `CARELY_JWT_ROTATION_SECRET`
   - Update `CARELY_JWT_SECRET_AGE` to track the new secret's age

### Automated Rotation Check
The system automatically checks for rotation needs:
- On application startup
- On each authentication request (in production)

## Development vs Production

### Development
- If no secret is provided, a secure secret is automatically generated
- Warning messages guide you to set proper environment variables
- Generated secrets are logged for convenience

### Production
- **Required**: `CARELY_JWT_SECRET` must be set
- **Validation**: All secrets are validated for strength
- **Rotation**: Automatic rotation recommendations
- **Security**: No fallback to weak defaults

## Security Best Practices

1. **Never Use Default Secrets**: The default "your_jwt_secret_here" is rejected
2. **Use Strong Secrets**: Follow the minimum requirements above
3. **Rotate Regularly**: Rotate secrets every 90 days or as required by your security policy
4. **Secure Storage**: Store secrets in secure environment variable management systems
5. **Monitor Usage**: Watch for rotation warnings and act on them
6. **Limit Access**: Restrict access to secret management functions

## CLI Utilities

The `secret-utils.ts` file provides command-line utilities:

```bash
# Generate a secure secret
npx tsx src/auth/secret-utils.ts generate

# Validate a secret
npx tsx src/auth/secret-utils.ts validate "your-secret-here"

# Create a rotation plan
npx tsx src/auth/secret-utils.ts rotate
```

## Error Handling

The system provides clear error messages for common issues:

- **Missing Secret**: Clear guidance on setting environment variables
- **Weak Secret**: Detailed feedback on what needs to be improved
- **Invalid Format**: Specific validation errors
- **Rotation Needed**: Warnings when rotation is recommended

## Migration from Old System

If you're migrating from the old system:

1. **Set Environment Variable**: Add `CARELY_JWT_SECRET` to your environment
2. **Validate Secret**: Use the CLI utility to validate your current secret
3. **Update Code**: The new system is backward compatible
4. **Test**: Verify authentication still works
5. **Plan Rotation**: Schedule regular secret rotation

## Troubleshooting

### Common Issues

**"JWT secret is required"**
- Set the `CARELY_JWT_SECRET` environment variable

**"Default JWT secret cannot be used"**
- Replace the default secret with a strong, custom secret

**"Secret has insufficient entropy"**
- Use the CLI utility to generate a stronger secret

**"Secret rotation needed"**
- Follow the rotation process outlined above

### Getting Help

- Use the CLI utilities to diagnose secret issues
- Check the validation output for specific problems
- Review the security requirements above
- Ensure environment variables are properly set 