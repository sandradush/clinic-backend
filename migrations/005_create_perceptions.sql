-- Create perceptions table
CREATE TABLE IF NOT EXISTS perceptions (
  id SERIAL PRIMARY KEY,
  appointment_id INTEGER NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
