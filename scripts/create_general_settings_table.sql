-- Create table for Settings -> General module
-- Run this in your Postgres DB if the table does not exist

CREATE TABLE IF NOT EXISTS general_settings (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  clinic_name VARCHAR(255) NOT NULL,
  default_language VARCHAR(32) NOT NULL CHECK (default_language IN ('English', 'French', 'Kinyarwanda')),
  primary_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
