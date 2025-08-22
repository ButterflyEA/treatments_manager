-- Migration: Make email column nullable in patients table
-- This migration will update the patients table to allow NULL values for email

ALTER TABLE patients RENAME TO patients_old;
CREATE TABLE patients (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone_number TEXT NOT NULL,
    description TEXT NOT NULL,
    date TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO patients (id, name, email, phone_number, description, date, active, created_at, updated_at)
    SELECT id, name, email, phone_number, description, date, active, created_at, updated_at FROM patients_old;
DROP TABLE patients_old;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_patients_date ON patients(date);
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);
