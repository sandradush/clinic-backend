-- Create patients table
CREATE TABLE patients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  age INTEGER,
  phone VARCHAR(20),
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create doctors table
CREATE TABLE doctors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  specialty VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE appointments (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status VARCHAR(50) DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample data
INSERT INTO patients (name, age, phone, email) VALUES
('John Doe', 30, '123-456-7890', 'john@email.com'),
('Jane Smith', 25, '098-765-4321', 'jane@email.com');

INSERT INTO doctors (name, specialty, phone, email) VALUES
('Dr. Smith', 'Cardiology', '555-0101', 'smith@clinic.com'),
('Dr. Johnson', 'Pediatrics', '555-0102', 'johnson@clinic.com');

INSERT INTO appointments (patient_id, doctor_id, date, time, status) VALUES
(1, 1, '2024-01-15', '10:00', 'scheduled'),
(2, 2, '2024-01-16', '14:30', 'completed');