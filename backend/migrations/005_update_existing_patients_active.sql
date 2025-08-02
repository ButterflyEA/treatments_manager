-- Update all existing patients to be active by default
-- This ensures any patients that were created before the active field was added
-- are set to active status
UPDATE patients SET active = 1 WHERE active IS NULL OR active = 0;
