# Notes and Calendar System Changes

This document outlines the changes made to handlers and entities that affect the notes and calendar functionality in the Carely application. This information is crucial for team members working on branches that modify the same files to understand the current state and avoid conflicts.

## Database Schema Changes

### Notes Table (`migrations/7_note.sql`)

The notes table was created with the following structure:

```sql
CREATE TABLE notes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    header VARCHAR(30) NOT NULL,
    content TEXT,
    caregiver_id TEXT,
    assigned_elder_id BIGINT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (caregiver_id) REFERENCES caregivers(id),
    FOREIGN KEY (assigned_elder_id) REFERENCES elders(id)
);
```

**Key Changes:**

- `id`: Auto-incrementing primary key
- `header`: Limited to 30 characters initially (later increased to 80 in migration 10)
- `content`: TEXT field for note content
- `caregiver_id`: References the caregiver who created the note
- `assigned_elder_id`: References the elder the note is about
- `created_at` and `updated_at`: Timestamp fields for tracking

### Notes Header Size Update (`migrations/10_notes_header_size.sql`)

```sql
ALTER TABLE notes
    ALTER COLUMN header TYPE VARCHAR(80);
```

This migration increased the header field size from 30 to 80 characters.

### Appointments Table (`migrations/6_appointment.sql`)

The appointments table was created with:

```sql
CREATE TABLE appointments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  elder_id INT NOT NULL,
  startDateTime TIMESTAMP,
  endDateTime TIMESTAMP,
  details TEXT,
  name TEXT,
  FOREIGN KEY (elder_id) REFERENCES elders(id)
);
```

### Appointment Enhancements (`migrations/8_appointment_loc_accept.sql`)

```sql
ALTER TABLE appointments
ADD COLUMN loc TEXT,
ADD COLUMN accepted TEXT;
```

Added location and acceptance tracking fields.

### Appointment ID Rename (`migrations/9_appointment_id_rename.sql`)

```sql
ALTER TABLE appointments RENAME id to appt_id;
```

Changed the primary key column name from `id` to `appt_id` for clarity.

## Core Schema Definitions

### Note Schema (`packages/core/src/note/note.schema.ts`)

```typescript
export const noteSchema = z.object({
  id: z.coerce.number(),
  header: z.string().max(80, "Header must be at most 80 characters long"),
  content: z
    .string()
    .max(5000, "Content must be at most 5000 characters long")
    .nullish(),
  caregiver_id: z.coerce.string(),
  assigned_elder_id: z.coerce.number(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const newNoteDtoSchema = noteSchema.pick({
  header: true,
  content: true,
  assigned_elder_id: true,
});
```

### Appointment Schema (`packages/core/src/appointment/appointment.schema.ts`)

```typescript
export const appointmentSchema = z.object({
  appt_id: z.coerce.number().optional(),
  elder_id: z.coerce.number(),
  startDateTime: z.coerce.date(),
  endDateTime: z.coerce.date(),
  details: z.string().nullish(),
  name: z.string(),
  loc: z.string().nullish(),
  accepted: z.string().nullish(),
});
```

## Note Handlers (`packages/backend/src/note/note.handler.ts`)

### Available Endpoints

1. **GET `/api/notes/details`** - `getNotesHandler`

   - Returns all notes for the authenticated caregiver
   - Includes elder names through JOIN operations

2. **GET `/api/notes/:id`** - `getNoteByIdHandler`

   - Returns a specific note by ID
   - Includes access control to ensure caregiver can only access their own notes

3. **GET `/api/notes/elder/:elderId`** - `getNotesByElderIdHandler`

   - Returns all notes for a specific elder
   - Includes caregiver names for shared notes

4. **POST `/api/notes/new`** - `insertNotesHandler`

   - Creates a new note
   - Validates input using `newNoteDtoSchema`
   - Automatically sets timestamps and caregiver_id

5. **POST `/api/notes/edit`** - `updateNotesHandler`

   - Updates an existing note
   - Validates input using note schema
   - Updates the `updated_at` timestamp

6. **POST `/api/notes/delete`** - `deleteNotesHandler`
   - Deletes a note by ID
   - Returns success status

### Key Features

- **Access Control**: All handlers use the `authenticated` middleware
- **Input Validation**: Uses Zod schemas for request validation
- **Error Handling**: Comprehensive error handling with appropriate HTTP status codes
- **Authorization**: Caregivers can only access notes they created or notes for elders they care for

## Note Entities (`packages/backend/src/note/note.entity.ts`)

### Database Operations

1. **`getNotesDetails(caregiverId: string)`**

   - Retrieves all notes for a caregiver with elder names
   - Uses JOIN with `caregiver_elder` and `elders` tables
   - Orders by `updated_at DESC`

2. **`getNoteDetails(noteId: number)`**

   - Retrieves a specific note by ID
   - Returns single note object

3. **`insertNotes(noteDetails)`**

   - Inserts a new note
   - Sets `created_at` and `updated_at` timestamps
   - Returns the created note

4. **`updateNotes(noteDetails)`**

   - Updates an existing note
   - Updates `updated_at` timestamp
   - Returns the updated note

5. **`deleteNotes(id: number)`**

   - Deletes a note by ID
   - Throws error if note not found

6. **`getNotesByElderId(elderId: number, caregiverId: string)`**
   - Retrieves notes for a specific elder
   - Includes caregiver names
   - Only returns notes for elders the caregiver has access to

## Appointment Handlers (`packages/backend/src/appointment/appointment.handler.ts`)

### Available Endpoints

1. **POST `/api/appointment/new`** - `createAppointmentHandler`

   - Creates a new appointment
   - Validates appointment times and checks for conflicts
   - Returns the created appointment

2. **GET `/api/appointments/:elder_id`** - `getAppointmentsHandler`

   - Returns all appointments for a specific elder

3. **GET `/api/appointment/:elder_id/:appt_id`** - `getAppointmentHandler`

   - Returns a specific appointment

4. **POST `/api/appointment/delete`** - `deleteAppointmentHandler`

   - Deletes an appointment

5. **PATCH `/api/appointment/update`** - `updateAppointmentHandler`

   - Updates an existing appointment
   - Validates times and checks for conflicts

6. **GET `/api/appointment/pending`** - `getPendingAppointmentsHandler`

   - Returns pending appointments for the authenticated caregiver

7. **GET `/api/appointment/all`** - `getAllAppointmentsForCaregiverHandler`

   - Returns all appointments for the authenticated caregiver

8. **POST `/api/appointment/accept`** - `acceptAppointmentHandler`

   - Accepts or rejects an appointment
   - Supports undo functionality

9. **POST `/api/appointment/import-ics`** - `importIcsFileHandler`
   - Imports appointments from ICS calendar files
   - Parses events and creates appointments

### Key Features

- **Conflict Detection**: Prevents overlapping appointments
- **Time Validation**: Ensures end time is after start time
- **ICS Import**: Supports importing calendar files
- **Acceptance System**: Tracks appointment acceptance status

## Appointment Entities (`packages/backend/src/appointment/appointment.entity.ts`)

### Database Operations

1. **`insertAppointment(appt)`**

   - Inserts a new appointment
   - Returns the created appointment with all fields

2. **`getAppointmentsForElder(elder_id: number)`**

   - Retrieves all appointments for a specific elder
   - Returns array of appointments

3. **`getAppointmentForElder(elder_id: number, appt_id: number)`**

   - Retrieves a specific appointment for an elder

4. **`deleteAppointment(appt)`**

   - Deletes an appointment by elder_id and appt_id
   - Throws error if not found

5. **`updateAppointment(appt)`**

   - Updates an existing appointment
   - Returns the updated appointment

6. **`getPendingAppointments(caregiver_id: string)`**

   - Retrieves pending appointments for a caregiver
   - Uses JOIN with elders and caregiver_elder tables

7. **`getAllAppointmentsForCaregiver(caregiver_id: string)`**

   - Retrieves all appointments for a caregiver
   - Orders by startDateTime ASC

8. **`acceptAppointment(caregiver_id, elder_id, appt_id)`**
   - Updates appointment acceptance status
   - Supports null caregiver_id for rejection

## Dashboard Integration

### Upcoming Appointments Handler (`packages/backend/src/dashboard/upcoming-appointments.handler.ts`)

**Endpoint**: `GET /api/dashboard/upcoming-appointments`

- Returns upcoming appointments for the authenticated caregiver
- Filters appointments that start in the future
- Orders by start time ascending
- Limited to 10 results
- Uses JOIN with caregiver_elder table for access control

## API Route Registration (`packages/backend/src/index.ts`)

### Notes Routes

```typescript
app.get("/api/notes/details", getNotesHandler);
app.get("/api/notes/:id", getNoteByIdHandler);
app.get("/api/notes/elder/:elderId", getNotesByElderIdHandler);
app.post("/api/notes/new", insertNotesHandler);
app.post("/api/notes/delete", deleteNotesHandler);
app.post("/api/notes/edit", updateNotesHandler);
```

### Appointment Routes

```typescript
app.post("/api/appointment/accept", acceptAppointmentHandler);
app.post("/api/appointment/new", createAppointmentHandler);
app.get("/api/appointments/:elder_id", getAppointmentsHandler);
app.get("/api/appointment/:elder_id/:appt_id", getAppointmentHandler);
app.post("/api/appointment/delete", deleteAppointmentHandler);
app.patch("/api/appointment/update", updateAppointmentHandler);
app.get("/api/appointment/pending", getPendingAppointmentsHandler);
app.get("/api/appointment/all", getAllAppointmentsForCaregiverHandler);
app.post("/api/appointment/import-ics", importIcsFileHandler);
```

### Dashboard Routes

```typescript
app.get("/api/dashboard/upcoming-appointments", getUpcomingAppointmentsHandler);
```

## Security and Access Control

### Authentication

- All endpoints use the `authenticated` middleware
- User ID is extracted from JWT token in `res.locals.user.userId`

### Authorization

- **Notes**: Caregivers can only access notes they created or notes for elders they care for
- **Appointments**: Caregivers can only access appointments for elders they care for
- **Access Control**: Uses JOIN operations with `caregiver_elder` table to enforce permissions

### Input Validation

- All inputs are validated using Zod schemas
- Request body and parameters are strictly typed
- Error responses include appropriate HTTP status codes

## Error Handling

### Common Error Patterns

- **400 Bad Request**: Invalid input data
- **403 Forbidden**: Access denied
- **404 Not Found**: Resource not found
- **409 Conflict**: Appointment time conflicts
- **500 Internal Server Error**: Server-side errors

### Error Response Format

```typescript
{
  error: "Error message",
  details?: any // Additional error details when available
}
```

## Testing Considerations

### Note Tests

- Located in `packages/backend/src/note/tests/`
- Tests for both entity and handler functions
- Covers CRUD operations and access control

### Appointment Tests

- Located in `packages/backend/src/appointment/`
- Tests for appointment creation, updates, and conflict detection
- Covers ICS import functionality

## Integration Points

### Frontend Integration

- Notes functionality integrated in elder and caregiver profile pages
- Calendar functionality available in dedicated calendar page
- Dashboard shows upcoming appointments
- ICS import available in calendar interface

### Database Relationships

- Notes link to caregivers and elders through foreign keys
- Appointments link to elders through foreign keys
- Caregiver-elder relationships managed through `caregiver_elder` table

## Migration Order

The migrations should be applied in this order:

1. `1_caregiver.sql` - Creates caregivers table
2. `2_elder.sql` - Creates elders table
3. `6_appointment.sql` - Creates appointments table
4. `7_note.sql` - Creates notes table
5. `8_appointment_loc_accept.sql` - Adds location and acceptance fields
6. `9_appointment_id_rename.sql` - Renames appointment ID column
7. `10_notes_header_size.sql` - Increases note header size

## Potential Conflicts

When working on branches that modify these files, be aware of:

1. **Schema Changes**: Any changes to note or appointment schemas
2. **Handler Modifications**: Changes to authentication, validation, or business logic
3. **Entity Updates**: Database query modifications
4. **Route Changes**: New endpoints or modified existing ones
5. **Frontend Integration**: Changes to API contracts

## Best Practices for Collaboration

1. **Communication**: Discuss schema changes with the team before implementing
2. **Testing**: Ensure all changes are properly tested
3. **Documentation**: Update this document when making significant changes
4. **Migration Safety**: Never modify existing migrations, create new ones instead
5. **API Compatibility**: Maintain backward compatibility when possible
