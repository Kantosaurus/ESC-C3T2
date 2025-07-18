# Database Schema

```mermaid
erDiagram
		Caregiver {
			TEXT id PK "Primary key, matches authentication provider's JWT sub"
			String name "Caregiver's name"
			String phone "Caregiver's phone number, optional"
			String address "Caregiver's address, optional"
		}

		Elder {
			INT id PK "Primary key, matches authentication provider's JWT sub"
			String name "Elder's name"
			String phone "Elder's phone number, optional"
			String address "Elder's address, optional"
		}

		Appointment {
			INT id PK "Primary key, unique identifier for the appointment"
			INT elderId FK "Foreign key referencing Elder"
			DATETIME startDateTime "Start date and time of the appointment"
			DATETIME endDateTime "End date and time of the appointment"
			JSONB details "Additional details about the appointment, stored as JSON"
		}

		Note {
			INT id PK "Primary key, unique identifier for the note"
			String header "Header of the note"
			TEXT content "Content description of the note"
			TEXT caregiver_id FK "Foreign key, matches authentication provider's JWT sub"
			INT assigned_elder_id "FK "Foreign key referencing Elder"
			INT appointment_id FK "Foreign key referencing Appointment, optional"
			DATETIME created_at "Timestamp when the note was created"
			DATETIME updated_at "Timestamp when the note was updated"
		}

		Caregiver ||--o{ Elder : "has"
		Elder ||--o{ Caregiver : "is cared for by"
		Elder ||--o{ Appointment : "has"
		Elder ||--o{ Note : "has"
```
