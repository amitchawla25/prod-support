-- Add in_progress_at timestamp to help_requests
-- Records the exact moment a ticket transitions to in_progress status,
-- allowing deadline calculation based on estimated_duration.
ALTER TABLE help_requests ADD COLUMN IF NOT EXISTS in_progress_at timestamptz;
