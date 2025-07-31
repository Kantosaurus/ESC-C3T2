ALTER TABLE appointments
ADD COLUMN created_by TEXT,
ADD COLUMN declined TEXT[] DEFAULT '{}';
