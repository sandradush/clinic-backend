CREATE TABLE IF NOT EXISTS call_logs (
  id SERIAL PRIMARY KEY,
  room_id VARCHAR(64) NOT NULL UNIQUE,
  caller_id INTEGER NOT NULL,
  receiver_id INTEGER NOT NULL,
  appointment_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_call_logs_caller_id ON call_logs(caller_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_receiver_id ON call_logs(receiver_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_appointment_id ON call_logs(appointment_id);
