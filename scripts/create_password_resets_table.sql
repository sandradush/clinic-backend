-- Migration: create password_resets table for secure password reset tokens
-- Run with: psql "postgres://<user>:<pass>@<host>:<port>/<db>" -f scripts/create_password_resets_table.sql

CREATE TABLE IF NOT EXISTS password_resets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(128) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  ip_address VARCHAR(128)
);

CREATE INDEX IF NOT EXISTS idx_password_resets_user_id_created_at ON password_resets (user_id, created_at);

-- Note: token_hash stores HMAC-SHA256 hex string (64 chars) but allocate larger in case of different algorithms.
