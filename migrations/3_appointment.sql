CREATE TABLE appointments (
  id TEXT PRIMARY KEY,
  elder_id INT NOT NULL,
  startDateTime DATETIME,
  endDateTime DATETIME,
  title TEXT NOT NULL,
  details TEXT,
  FOREIGN KEY (elder_id) REFERENCES elders(id)
);