-- Migration: add insurance column to user_profiles
-- Adds a JSONB `insurance` column to store insurance provider and policy details.

BEGIN;

ALTER TABLE IF EXISTS user_profiles
  ADD COLUMN IF NOT EXISTS insurance JSONB DEFAULT NULL;

COMMIT;
