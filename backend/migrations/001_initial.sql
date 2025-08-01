-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    description TEXT NOT NULL,
    date TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index on date for better query performance
CREATE INDEX IF NOT EXISTS idx_patients_date ON patients(date);

-- Create index on email for uniqueness checks if needed later
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);
