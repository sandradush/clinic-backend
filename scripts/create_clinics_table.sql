-- Migration: create clinics table
-- Run with psql or your DB migration tooling

CREATE TABLE IF NOT EXISTS clinics (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  primary_address TEXT NOT NULL,
  default_language VARCHAR(16) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Optional index for lookups by name
CREATE INDEX IF NOT EXISTS idx_clinics_name ON clinics (name);
