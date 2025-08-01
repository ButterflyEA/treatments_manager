-- Create treatments table
CREATE TABLE IF NOT EXISTS treatments (
    id TEXT PRIMARY KEY NOT NULL,
    patient_id TEXT NOT NULL,
    summary TEXT NOT NULL,
    date TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- Create index on patient_id for better query performance
CREATE INDEX IF NOT EXISTS idx_treatments_patient_id ON treatments(patient_id);

-- Create index on date for better query performance
CREATE INDEX IF NOT EXISTS idx_treatments_date ON treatments(date);
