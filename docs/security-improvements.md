# Security Improvements

This document outlines the security improvements implemented to address frontend security vulnerabilities in the Carely application.

## Issues Addressed

### 1. JWT Token Storage Security

**Problem**: JWT tokens were stored in plain text in localStorage, making them vulnerable to XSS attacks.

**Solution**:

- Implemented encrypted token storage using sessionStorage instead of localStorage
- Added XOR encryption for token storage (with fallback to plain text if encryption fails)
- Tokens are now cleared when browser tab is closed (sessionStorage behavior)
- Removed token information logging to console for security

**Files Modified**:

- `packages/frontend/src/auth/token.ts` - Secure token storage implementation
- `packages/frontend/src/lib/http.ts` - Updated to use secure token functions
- `packages/frontend/src/auth/redirect.page.tsx` - Updated to use secure token storage

### 2. Google Maps API Key Exposure

**Problem**: Google Maps API key was exposed in frontend code and environment variables, with no domain restrictions.

**Solution**:

- Created backend proxy endpoints for all Google Maps API calls
- Moved API key to backend environment variables only
- Implemented proper input validation for all proxy endpoints
- Added rate limiting and authentication to prevent abuse
- Removed API key from frontend environment variables

**Files Modified**:

- `packages/backend/src/misc/google-maps-proxy.ts` - New proxy handlers
- `packages/backend/src/index.ts` - Added proxy routes with validation
- `packages/backend/src/security/input-validation.ts` - Added validation schemas
- `packages/frontend/src/components/ui/address-form.tsx` - Updated to use proxy
- `packages/frontend/src/elder/new-elder-page.tsx` - Updated geocoding
- `packages/frontend/src/elder/edit-elder-page.tsx` - Updated geocoding
- `packages/frontend/src/lib/env.ts` - Removed API key

### 3. Client-Side Validation Only

**Problem**: Application relied solely on frontend validation, which can be bypassed.

**Solution**:

- Enhanced existing server-side validation with comprehensive schemas
- Added validation for all Google Maps proxy endpoints
- Implemented proper error handling and validation middleware
- Maintained client-side validation for better UX while ensuring server-side security

**Files Modified**:

- `packages/backend/src/security/input-validation.ts` - Enhanced validation schemas
- `packages/backend/src/index.ts` - Added validation middleware to routes

## Security Features Implemented

### Token Security

- **Encryption**: XOR encryption for stored tokens
- **Storage**: sessionStorage instead of localStorage
- **Lifetime**: Tokens cleared when browser tab closes
- **Error Handling**: Graceful fallback if encryption fails

### API Security

- **Proxy Pattern**: All external API calls go through backend
- **Authentication**: All proxy endpoints require authentication
- **Rate Limiting**: Prevents abuse of external APIs
- **Input Validation**: Comprehensive server-side validation
- **Error Handling**: Proper error responses without exposing internals

### Data Validation

- **Server-Side**: All inputs validated on server before processing
- **Client-Side**: Maintained for better user experience
- **Schema-Based**: Using Zod for type-safe validation
- **Comprehensive**: Covers all endpoints and data types

## Environment Variables

### Backend (.env)

```bash
# Google Maps API (backend only)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Other existing variables...
```

### Frontend (.env.local)

```bash
# Backend URL only (no API keys)
VITE_BACKEND_URL=http://localhost:3000
```

## API Endpoints

### Google Maps Proxy Endpoints

- `GET /api/maps/geocode` - Geocode address to coordinates
- `GET /api/maps/places/autocomplete` - Get place suggestions
- `GET /api/maps/places/details` - Get detailed place information

All endpoints require authentication and include input validation.

## Security Best Practices

### Token Management

1. Tokens are encrypted before storage
2. Tokens are stored in sessionStorage (cleared on tab close)
3. No token information logged to console
4. Automatic cleanup on expiration

### API Security

1. All external API calls proxied through backend
2. API keys never exposed to frontend
3. Input validation on all endpoints
4. Rate limiting to prevent abuse
5. Proper error handling without information leakage

### Data Validation

1. Server-side validation for all inputs
2. Client-side validation for UX
3. Schema-based validation using Zod
4. Comprehensive error messages for debugging

## Testing Security

### Token Security Testing

```javascript
// Test token encryption/decryption
const token = "test.jwt.token";
setToken(token);
const retrieved = getToken();
console.log(token === retrieved); // Should be true
```

### API Security Testing

```bash
# Test unauthenticated access (should fail)
curl http://localhost:3000/api/maps/geocode?address=test

# Test with authentication (should work)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/maps/geocode?address=test
```

## Monitoring and Logging

### Security Events

- Failed authentication attempts
- Rate limit violations
- Validation failures
- API proxy errors

### Logging Guidelines

- No sensitive data in logs
- Error details for debugging
- Security event tracking
- Performance monitoring

## Future Improvements

### Enhanced Encryption

- Consider using Web Crypto API for stronger encryption
- Implement key rotation for stored tokens
- Add integrity checks for stored data

### API Security

- Implement API key rotation
- Add request signing for additional security
- Consider using service accounts for Google Maps

### Monitoring

- Add security event monitoring
- Implement alerting for suspicious activity
- Add performance monitoring for proxy endpoints

## Compliance

These security improvements help ensure:

- **Data Protection**: Sensitive data is properly encrypted and stored
- **API Security**: External API keys are protected from exposure
- **Input Validation**: All inputs are properly validated
- **Authentication**: Proper token management and validation
- **Error Handling**: Secure error responses without information leakage
