CREATE TABLE IF NOT EXISTS vitals (
  id SERIAL PRIMARY KEY,
  heart_rate_bpm NUMERIC(6,2) NOT NULL,
  spo2 NUMERIC(5,2) NOT NULL,
  serial_number VARCHAR(255) NOT NULL,
  temperature NUMERIC(5,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vitals_serial_number ON vitals(serial_number);
CREATE INDEX IF NOT EXISTS idx_vitals_created_at ON vitals(created_at);
