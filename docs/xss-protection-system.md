# XSS Protection System Documentation

## Overview

The Carely application implements a comprehensive Cross-Site Scripting (XSS) protection system to prevent malicious script injection and ensure secure rendering of user-generated content.

## Security Issues Fixed

### 1. No Input Sanitization

**Problem**: User inputs were directly rendered without sanitization, allowing malicious scripts to execute.

**Solution**: Implemented comprehensive input sanitization at multiple layers:

- Backend middleware automatically sanitizes all request bodies
- Schema-level sanitization with Zod transformers
- Frontend safe rendering components

### 2. Note Content XSS

**Problem**: Note content could contain malicious scripts that execute when displayed.

**Solution**:

- Rich text sanitization that allows basic formatting but removes dangerous content
- Safe rendering components for note content
- Input validation and sanitization at the API level

### 3. Appointment Details XSS

**Problem**: Appointment details field was vulnerable to script injection.

**Solution**:

- Rich text sanitization for appointment details
- Safe rendering components for appointment information
- Input validation and sanitization

### 4. Address Fields XSS

**Problem**: Address inputs were not sanitized before display.

**Solution**:

- Plain text sanitization for address fields
- Length limits to prevent buffer overflow attacks
- Safe rendering components for address information

## Architecture

### Backend XSS Protection

#### 1. Middleware Layer (`packages/backend/src/security/xss-protection.ts`)

```typescript
// Automatically sanitizes all request bodies
app.use(sanitizeRequestBody);
```

The middleware automatically:

- Detects field types based on field names
- Applies appropriate sanitization
- Logs potential XSS attempts
- Sanitizes before validation

#### 2. Schema-Level Protection (`packages/core/src/security/xss-protected-schemas.ts`)

```typescript
// XSS-protected schemas with automatic sanitization
export const xssProtectedNoteSchema = z.object({
  header: z.string().transform(sanitizeText),
  content: z.string().transform(sanitizeRichText),
  // ...
});
```

#### 3. Handler-Level Protection

All handlers use XSS-protected schemas:

```typescript
// Before
const noteData = newNoteDtoSchema.parse(req.body);

// After
const noteData = xssProtectedNewNoteDtoSchema.parse(req.body);
```

### Frontend XSS Protection

#### 1. Safe Rendering Components (`packages/frontend/src/lib/xss-protection.ts`)

```typescript
// Safe text rendering (no HTML allowed)
<SafeText>{userInput}</SafeText>

// Safe rich text rendering (allows basic formatting)
<SafeRichText>{noteContent}</SafeRichText>

// Safe note content rendering
<SafeNoteContent content={note.content} />
```

#### 2. Component Updates

All components that display user content now use safe rendering:

```typescript
// Before
<p>{note.content}</p>

// After
<SafeNoteContent content={note.content} />
```

## Sanitization Levels

### 1. Plain Text Sanitization

- **Use Case**: Names, addresses, phone numbers
- **Allowed**: Text content only
- **Removed**: All HTML tags and attributes
- **Length Limits**: Applied to prevent buffer overflow

### 2. Rich Text Sanitization

- **Use Case**: Note content, appointment details
- **Allowed**: Basic formatting tags (`<p>`, `<strong>`, `<em>`, etc.)
- **Removed**: Script tags, event handlers, dangerous attributes
- **Security**: Whitelist approach for allowed tags

### 3. Phone Number Sanitization

- **Use Case**: Phone numbers
- **Allowed**: Digits, spaces, dashes, parentheses, plus sign
- **Removed**: All other characters including HTML

## Security Features

### 1. Automatic Detection

The system automatically detects and logs potential XSS attempts:

```typescript
// Logs when content is modified during sanitization
logXSSTAttempt(originalInput, sanitizedInput, fieldName);
```

### 2. Input Validation

All inputs are validated and sanitized before processing:

```typescript
// Validates and sanitizes with custom error messages
const sanitized = validateAndSanitize(input, sanitizer, fieldName);
```

### 3. Length Limits

Prevents buffer overflow attacks by limiting input lengths:

- Names: 100 characters
- Addresses: 200 characters
- Note headers: 50 characters
- Appointment names: 100 characters

### 4. Dangerous Content Detection

Utility functions to detect potentially dangerous content:

```typescript
if (containsDangerousContent(userInput)) {
  // Handle suspicious content
}
```

## Usage Examples

### Backend Usage

#### 1. Using XSS-Protected Schemas

```typescript
import { xssProtectedNewNoteDtoSchema } from "@carely/core";

export const insertNotesHandler = authenticated(async (req, res) => {
  // Automatically sanitizes input
  const notesPayload = xssProtectedNewNoteDtoSchema.parse(req.body);
  // Process sanitized data...
});
```

#### 2. Manual Sanitization

```typescript
import { sanitizeRichText, sanitizeText } from "../security/xss-protection";

const userInput = req.body.content;
const sanitized = sanitizeRichText(userInput);
```

### Frontend Usage

#### 1. Safe Rendering Components

```typescript
import { SafeNoteContent, SafeName, SafeAddress } from "@/lib/xss-protection";

// Safe note content rendering
<SafeNoteContent content={note.content} className="text-gray-800" />

// Safe name rendering
<SafeName name={elder.name} className="font-bold" />

// Safe address rendering
<SafeAddress address={elder.street_address} />
```

#### 2. Custom Safe Components

```typescript
import { escapeHtml } from "@/lib/xss-protection";

const SafeCustomComponent: React.FC<{ content: string }> = ({ content }) => {
  return <div>{escapeHtml(content)}</div>;
};
```

## Testing

### Backend Tests (`packages/backend/src/security/xss-protection.test.ts`)

Comprehensive test suite covering:

- All sanitization functions
- Edge cases and dangerous content
- Input validation
- Logging functionality

### Test Examples

```typescript
describe("sanitizeText", () => {
  it("should remove all HTML tags", () => {
    const input = '<script>alert("xss")</script>Hello <b>World</b>';
    const result = sanitizeText(input);
    expect(result).toBe("Hello World");
  });
});
```

## Security Monitoring

### 1. XSS Attempt Logging

All potential XSS attempts are logged with:

- Original input
- Sanitized output
- Field name
- Timestamp

### 2. Console Warnings

Frontend logs potential XSS attempts to console for development monitoring.

### 3. Error Handling

Graceful error handling for malformed inputs with appropriate error messages.

## Best Practices

### 1. Always Use Safe Components

Never render user content directly:

```typescript
// ❌ Dangerous
<div>{userInput}</div>

// ✅ Safe
<SafeText>{userInput}</SafeText>
```

### 2. Validate and Sanitize

Always validate and sanitize inputs at the API level:

```typescript
// ❌ Unsafe
const data = req.body;

// ✅ Safe
const data = xssProtectedSchema.parse(req.body);
```

### 3. Use Appropriate Sanitization

Choose the right sanitization level for your use case:

```typescript
// For plain text (names, addresses)
sanitizeText(input);

// For rich content (notes, descriptions)
sanitizeRichText(input);

// For phone numbers
sanitizePhone(input);
```

### 4. Monitor and Log

Monitor for potential XSS attempts and investigate suspicious patterns.

## Migration Guide

### Updating Existing Components

1. **Replace direct rendering with safe components**:

   ```typescript
   // Before
   <p>{note.content}</p>

   // After
   <SafeNoteContent content={note.content} />
   ```

2. **Update schemas to use XSS-protected versions**:

   ```typescript
   // Before
   import { noteSchema } from "@carely/core";

   // After
   import { xssProtectedNoteSchema } from "@carely/core";
   ```

3. **Add XSS protection middleware**:
   ```typescript
   // Add to main app
   app.use(sanitizeRequestBody);
   ```

## Security Considerations

### 1. Defense in Depth

The system implements multiple layers of protection:

- Input sanitization
- Schema validation
- Safe rendering
- Content monitoring

### 2. Whitelist Approach

Uses whitelist approach for allowed content rather than blacklist approach.

### 3. Regular Updates

Keep DOMPurify and other security libraries updated.

### 4. Monitoring

Monitor logs for potential XSS attempts and investigate patterns.

## Conclusion

The XSS protection system provides comprehensive protection against cross-site scripting attacks while maintaining functionality and user experience. The multi-layered approach ensures that even if one layer fails, others will catch and prevent malicious content from being executed.
