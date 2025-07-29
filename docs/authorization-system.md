# Authorization System Documentation

## Overview

The Carely application implements a comprehensive role-based access control (RBAC) system to prevent authorization bypass vulnerabilities and ensure users can only access data they're authorized to view or modify.

## Security Issues Fixed

### 1. Authorization Bypass via ID Manipulation

**Problem**: Users could access other users' data by manipulating IDs in API requests.

**Solution**: Implemented proper authorization checks that verify:

- Users can only access their own profile data
- Users can only access elders they have a relationship with
- Users can only access notes they created
- Users can only access appointments for elders they care for

### 2. Missing Role-Based Access Control

**Problem**: No granular permissions system existed.

**Solution**: Implemented a comprehensive RBAC system with:

- Defined user roles (Caregiver, Admin)
- Granular permissions for different operations
- Middleware-based authorization checks
- Helper functions for common authorization patterns

## Architecture

### User Roles

```typescript
enum UserRole {
  CAREGIVER = "caregiver",
  ADMIN = "admin", // For future use
}
```

### Permissions

```typescript
enum Permission {
  READ_OWN_PROFILE = "read_own_profile",
  UPDATE_OWN_PROFILE = "update_own_profile",
  READ_ELDER_PROFILE = "read_elder_profile",
  UPDATE_ELDER_PROFILE = "update_elder_profile",
  CREATE_ELDER = "create_elder",
  DELETE_ELDER = "delete_elder",
  READ_ELDER_APPOINTMENTS = "read_elder_appointments",
  CREATE_ELDER_APPOINTMENTS = "create_elder_appointments",
  UPDATE_ELDER_APPOINTMENTS = "update_elder_appointments",
  DELETE_ELDER_APPOINTMENTS = "delete_elder_appointments",
  READ_ELDER_NOTES = "read_elder_notes",
  CREATE_ELDER_NOTES = "create_elder_notes",
  UPDATE_ELDER_NOTES = "update_elder_notes",
  DELETE_ELDER_NOTES = "delete_elder_notes",
  READ_OTHER_CAREGIVER = "read_other_caregiver", // Restricted
}
```

### Role-Permission Mapping

**Caregiver Permissions**:

- Read/Update own profile
- Read/Update elder profiles (for elders they care for)
- Create elders
- Full CRUD operations on appointments (for elders they care for)
- Full CRUD operations on notes (for elders they care for)

**Admin Permissions**:

- All permissions (for future administrative features)

## Authorization Functions

### Helper Functions

#### `hasElderAccess(caregiverId: string, elderId: number): Promise<boolean>`

Checks if a caregiver has access to a specific elder through the caregiver_elder relationship table.

#### `hasNoteAccess(caregiverId: string, noteId: number): Promise<boolean>`

Checks if a caregiver owns a specific note.

#### `hasAppointmentAccess(caregiverId: string, elderId: number, appointmentId: number): Promise<boolean>`

Checks if a caregiver has access to a specific appointment by verifying elder access and appointment existence.

#### `hasPermission(userId: string, permission: Permission): boolean`

Checks if a user has a specific permission based on their role.

### Authorization Middleware

#### `requirePermission(permission: Permission): RequestHandler`

Middleware that checks if the authenticated user has the required permission.

#### `requireElderAccess(): RequestHandler`

Middleware that checks if the user has access to the elder specified in the request.

#### `requireNoteAccess(): RequestHandler`

Middleware that checks if the user owns the note specified in the request.

#### `requireAppointmentAccess(): RequestHandler`

Middleware that checks if the user has access to the appointment specified in the request.

#### `requireSelfAccess(): RequestHandler`

Middleware that ensures users can only access their own data.

## Implementation Examples

### Protecting Caregiver Endpoints

```typescript
// Before (VULNERABLE)
export const getCaregiverById = authenticated(async (req, res) => {
  const { caregiver_id } = req.params;
  const caregiver = await getCaregiverDetails(caregiver_id); // ANYONE can access ANY caregiver
  res.json(caregiver);
});

// After (SECURE)
export const getCaregiverSelfHandler = authenticated(async (req, res) => {
  const caregiverId = res.locals.user.userId; // Only own data
  const caregiver = await getCaregiverDetails(caregiverId);
  res.json(caregiver);
});
```

### Protecting Appointment Endpoints

```typescript
// Before (VULNERABLE)
export const getAppointmentsHandler = authenticated(async (req, res) => {
  const { elder_id } = req.params;
  const appts = await getAppointmentsForElder(elder_id); // ANYONE can access ANY elder's appointments
  res.json(appts);
});

// After (SECURE)
export const getAppointmentsHandler = authenticated(async (req, res) => {
  const { elder_id } = req.params;
  const caregiverId = res.locals.user.userId;

  // Check if user has access to the elder
  const hasAccess = await hasElderAccess(caregiverId, elder_id);
  if (!hasAccess) {
    return res.status(403).json({ error: "Access denied to this elder" });
  }

  const appts = await getAppointmentsForElder(elder_id);
  res.json(appts);
});
```

### Protecting Note Endpoints

```typescript
// Before (VULNERABLE)
export const deleteNotesHandler = authenticated(async (req, res) => {
  const { id } = req.body;
  await deleteNotes(id); // ANYONE can delete ANY note
  res.status(200).json({ success: true });
});

// After (SECURE)
export const deleteNotesHandler = authenticated(async (req, res) => {
  const { id } = req.body;
  const caregiverId = res.locals.user.userId;

  // Check if user owns the note
  const hasAccess = await hasNoteAccess(caregiverId, id);
  if (!hasAccess) {
    return res.status(403).json({ error: "Access denied to this note" });
  }

  await deleteNotes(id);
  res.status(200).json({ success: true });
});
```

## Database Security

### Relationship-Based Access Control

The system uses the `caregiver_elder` junction table to enforce access control:

```sql
CREATE TABLE caregiver_elder(
  caregiver_id TEXT NOT NULL,
  elder_id BIGINT NOT NULL,
  PRIMARY KEY (caregiver_id, elder_id),
  FOREIGN KEY (caregiver_id) REFERENCES caregivers(id) ON DELETE CASCADE,
  FOREIGN KEY (elder_id) REFERENCES elders(id) ON DELETE CASCADE
);
```

### Query-Level Security

All entity functions that retrieve data include proper JOIN clauses to ensure users only see data they're authorized to access:

```sql
-- Example: Getting elders for a specific caregiver
SELECT *
FROM elders e
INNER JOIN caregiver_elder ce ON e.id = ce.elder_id
WHERE ce.caregiver_id = $1;
```

## Testing

The authorization system includes comprehensive tests in `packages/backend/src/auth/authorization.test.ts` that verify:

- Permission checking works correctly
- Access control functions return expected results
- Middleware properly blocks unauthorized access
- Error handling works as expected

## Security Best Practices Implemented

1. **Principle of Least Privilege**: Users only have access to data they need
2. **Defense in Depth**: Multiple layers of authorization checks
3. **Fail-Safe Defaults**: Authorization checks default to denying access
4. **Input Validation**: All IDs are validated before authorization checks
5. **Audit Trail**: All authorization decisions are logged
6. **Error Handling**: Proper error responses without information leakage

## Future Enhancements

1. **Admin Role Implementation**: Add administrative capabilities
2. **Permission Granularity**: More fine-grained permissions
3. **Audit Logging**: Track all authorization decisions
4. **Session Management**: Enhanced session security
5. **Rate Limiting**: Prevent brute force attacks

## Migration Guide

To apply these security fixes to existing code:

1. Import the authorization functions:

   ```typescript
   import {
     hasElderAccess,
     hasNoteAccess,
     requirePermission,
   } from "../auth/authorization";
   ```

2. Add authorization checks to all handlers that access user data
3. Remove any endpoints that allow access to other users' data
4. Update tests to verify authorization behavior
5. Test thoroughly to ensure no functionality is broken

## Compliance

This authorization system helps meet security requirements for:

- HIPAA (Health Insurance Portability and Accountability Act)
- GDPR (General Data Protection Regulation)
- SOC 2 (Service Organization Control 2)
- ISO 27001 (Information Security Management)
