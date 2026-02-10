-- Create medicals table
CREATE TABLE IF NOT EXISTS medicals (
  id SERIAL PRIMARY KEY,
  appointment_id INTEGER NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  medical_name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
