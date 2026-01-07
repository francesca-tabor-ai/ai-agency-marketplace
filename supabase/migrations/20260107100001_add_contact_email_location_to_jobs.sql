-- Add contact_email and location columns to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS contact_email text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS location text;

-- Add comments
COMMENT ON COLUMN jobs.contact_email IS 'Contact email for job applications';
COMMENT ON COLUMN jobs.location IS 'Job location';

