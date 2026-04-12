CREATE TABLE IF NOT EXISTS medical_records (
  record_id SERIAL PRIMARY KEY,
  consultation_id INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  description TEXT
);

CREATE INDEX IF NOT EXISTS idx_medical_records_consultation_id ON medical_records(consultation_id);
