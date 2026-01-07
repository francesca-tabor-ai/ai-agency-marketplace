-- ============================================================================
-- AGENCY SIGNUP SCHEMA EXTENSION
-- ============================================================================
-- 
-- Extends the agencies table to support agency signup from /agency-account form
-- Adds owner_user_id, contact info, case studies, certifications, logo, and status
--
-- ============================================================================

-- Add new columns to agencies table
ALTER TABLE agencies 
  ADD COLUMN IF NOT EXISTS owner_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS contact_email text,
  ADD COLUMN IF NOT EXISTS contact_phone text,
  ADD COLUMN IF NOT EXISTS case_studies text,
  ADD COLUMN IF NOT EXISTS certifications_awards text,
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_agencies_owner_user_id ON agencies(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_agencies_status ON agencies(status);

-- Add comments
COMMENT ON COLUMN agencies.owner_user_id IS 'User who owns/created this agency account';
COMMENT ON COLUMN agencies.contact_email IS 'Contact email for the agency';
COMMENT ON COLUMN agencies.contact_phone IS 'Contact phone for the agency';
COMMENT ON COLUMN agencies.case_studies IS 'Case studies or portfolio description';
COMMENT ON COLUMN agencies.certifications_awards IS 'Certifications and awards';
COMMENT ON COLUMN agencies.logo_url IS 'URL to agency logo/profile picture';
COMMENT ON COLUMN agencies.status IS 'Agency approval status: pending, approved, or rejected';

-- Optional: Create agency_requests table for moderation tracking
CREATE TABLE IF NOT EXISTS agency_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  agency_id uuid REFERENCES agencies(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(agency_id) -- One request per agency
);

CREATE INDEX IF NOT EXISTS idx_agency_requests_user_id ON agency_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_agency_requests_agency_id ON agency_requests(agency_id);

COMMENT ON TABLE agency_requests IS 'Tracks agency signup requests for moderation';

-- Ensure join tables exist (they should already exist, but verify)
-- agency_services and agency_industries should already be in the base schema

