-- ============================================================================
-- RLS POLICIES FOR AGENCY SIGNUP
-- ============================================================================
-- 
-- Policies to allow authenticated users to create and manage their own agencies
-- Public read only for approved agencies
--
-- ============================================================================

-- Enable RLS on agencies (should already be enabled, but ensure it)
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they conflict (we'll recreate them)
DROP POLICY IF EXISTS "Public can read approved agencies" ON agencies;
DROP POLICY IF EXISTS "Users can insert their own agency" ON agencies;
DROP POLICY IF EXISTS "Users can update their own agency" ON agencies;
DROP POLICY IF EXISTS "Users can delete their own agency" ON agencies;

-- Public read: only approved agencies
CREATE POLICY "Public can read approved agencies" ON agencies
  FOR SELECT
  USING (status = 'approved');

-- Authenticated users can read their own agency (regardless of status)
CREATE POLICY "Users can read their own agency" ON agencies
  FOR SELECT
  TO authenticated
  USING (owner_user_id = auth.uid());

-- Authenticated users can insert their own agency
CREATE POLICY "Users can insert their own agency" ON agencies
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_user_id = auth.uid());

-- Authenticated users can update their own agency
CREATE POLICY "Users can update their own agency" ON agencies
  FOR UPDATE
  TO authenticated
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

-- Authenticated users can delete their own agency
CREATE POLICY "Users can delete their own agency" ON agencies
  FOR DELETE
  TO authenticated
  USING (owner_user_id = auth.uid());

-- ============================================================================
-- AGENCY SERVICES JOIN TABLE RLS
-- ============================================================================

-- Enable RLS on agency_services
ALTER TABLE agency_services ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public can read agency services for approved agencies" ON agency_services;
DROP POLICY IF EXISTS "Users can manage services for their own agency" ON agency_services;

-- Public read: only for approved agencies
CREATE POLICY "Public can read agency services for approved agencies" ON agency_services
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM agencies
      WHERE agencies.id = agency_services.agency_id
      AND agencies.status = 'approved'
    )
  );

-- Authenticated users can read services for their own agency
CREATE POLICY "Users can read services for their own agency" ON agency_services
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agencies
      WHERE agencies.id = agency_services.agency_id
      AND agencies.owner_user_id = auth.uid()
    )
  );

-- Authenticated users can insert/delete services for their own agency
CREATE POLICY "Users can manage services for their own agency" ON agency_services
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agencies
      WHERE agencies.id = agency_services.agency_id
      AND agencies.owner_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agencies
      WHERE agencies.id = agency_services.agency_id
      AND agencies.owner_user_id = auth.uid()
    )
  );

-- ============================================================================
-- AGENCY INDUSTRIES JOIN TABLE RLS
-- ============================================================================

-- Enable RLS on agency_industries
ALTER TABLE agency_industries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public can read agency industries for approved agencies" ON agency_industries;
DROP POLICY IF EXISTS "Users can manage industries for their own agency" ON agency_industries;

-- Public read: only for approved agencies
CREATE POLICY "Public can read agency industries for approved agencies" ON agency_industries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM agencies
      WHERE agencies.id = agency_industries.agency_id
      AND agencies.status = 'approved'
    )
  );

-- Authenticated users can read industries for their own agency
CREATE POLICY "Users can read industries for their own agency" ON agency_industries
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agencies
      WHERE agencies.id = agency_industries.agency_id
      AND agencies.owner_user_id = auth.uid()
    )
  );

-- Authenticated users can insert/delete industries for their own agency
CREATE POLICY "Users can manage industries for their own agency" ON agency_industries
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agencies
      WHERE agencies.id = agency_industries.agency_id
      AND agencies.owner_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agencies
      WHERE agencies.id = agency_industries.agency_id
      AND agencies.owner_user_id = auth.uid()
    )
  );

-- ============================================================================
-- AGENCY REQUESTS TABLE RLS
-- ============================================================================

-- Enable RLS on agency_requests
ALTER TABLE agency_requests ENABLE ROW LEVEL SECURITY;

-- Users can only see their own requests
CREATE POLICY "Users can manage their own agency requests" ON agency_requests
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- STORAGE POLICIES FOR AGENCY LOGOS
-- ============================================================================

-- Note: Storage policies need to be created via Supabase Dashboard or CLI
-- The SQL below is a reference, but storage policies are typically managed differently

-- Create bucket if it doesn't exist (this might need to be done via Dashboard)
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('agency-logos', 'agency-logos', true)
-- ON CONFLICT (id) DO NOTHING;

-- Policy: Authenticated users can upload to their own folder
-- CREATE POLICY "Users can upload their own agency logos" ON storage.objects
--   FOR INSERT
--   TO authenticated
--   WITH CHECK (
--     bucket_id = 'agency-logos' AND
--     (storage.foldername(name))[1] = auth.uid()::text
--   );

-- Policy: Public can read agency logos
-- CREATE POLICY "Public can read agency logos" ON storage.objects
--   FOR SELECT
--   USING (bucket_id = 'agency-logos');

-- Policy: Users can update/delete their own logos
-- CREATE POLICY "Users can manage their own agency logos" ON storage.objects
--   FOR ALL
--   TO authenticated
--   USING (
--     bucket_id = 'agency-logos' AND
--     (storage.foldername(name))[1] = auth.uid()::text
--   )
--   WITH CHECK (
--     bucket_id = 'agency-logos' AND
--     (storage.foldername(name))[1] = auth.uid()::text
--   );

