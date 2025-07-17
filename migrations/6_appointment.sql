CREATE TABLE appointments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  elder_id INT NOT NULL,
  startDateTime TIMESTAMP,
  endDateTime TIMESTAMP,
  details TEXT,
  FOREIGN KEY (elder_id) REFERENCES elders(id)
);