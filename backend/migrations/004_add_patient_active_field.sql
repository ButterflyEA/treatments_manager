-- Add active field to patients table
ALTER TABLE patients ADD COLUMN active BOOLEAN NOT NULL DEFAULT 1;

-- Create index on active field for better query performance
CREATE INDEX IF NOT EXISTS idx_patients_active ON patients(active);
