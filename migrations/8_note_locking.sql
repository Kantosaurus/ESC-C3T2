ALTER TABLE notes
ADD COLUMN locked_by TEXT REFERENCES caregivers(id);