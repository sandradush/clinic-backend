-- Create user_profiles table to store user medical/profile details
-- Run this in your Postgres DB if the table does not exist

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  dob DATE,
  gender VARCHAR(32),
  phone VARCHAR(64),
  blood_group VARCHAR(16),
  allergies JSONB,
  chronic_conditions JSONB,
  current_medications JSONB,
  emergency_contact_name VARCHAR(255),
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Example upsert usage:
-- INSERT INTO user_profiles (user_id, dob, gender, phone, blood_group, allergies, chronic_conditions, current_medications, emergency_contact_name, address)
-- VALUES (1, '1990-01-01', 'female', '+123456789', 'O+', '["pollen"]', '["hypertension"]', '["lisinopril"]', 'Jane Doe', '123 Main St')
-- ON CONFLICT (user_id) DO UPDATE SET
--   dob = EXCLUDED.dob,
--   gender = EXCLUDED.gender,
--   phone = EXCLUDED.phone,
--   blood_group = EXCLUDED.blood_group,
--   allergies = EXCLUDED.allergies,
--   chronic_conditions = EXCLUDED.chronic_conditions,
--   current_medications = EXCLUDED.current_medications,
--   emergency_contact_name = EXCLUDED.emergency_contact_name,
--   address = EXCLUDED.address,
--   updated_at = NOW();
