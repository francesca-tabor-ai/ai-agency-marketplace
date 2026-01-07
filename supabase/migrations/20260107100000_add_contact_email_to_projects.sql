-- Add contact_email column to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS contact_email text;

-- Add comment
COMMENT ON COLUMN projects.contact_email IS 'Contact email for the project';

