-- Add status column to appointments
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
