-- ============================================================================
-- VIEWS FOR SIMPLIFIED FRONTEND QUERIES
-- ============================================================================
-- 
-- PREREQUISITE: This migration requires the base schema to be created first.
-- Run migrations in this order:
--   1. 20260107090000_complete_schema.sql
--   2. 20260107100000_add_contact_email_to_projects.sql
--   3. 20260107100001_add_contact_email_location_to_jobs.sql
--   4. 20260107100002_create_views.sql (this file)
--
-- ============================================================================

-- Check if required tables exist before creating views
DO $$
DECLARE
  missing_tables text[];
BEGIN
  missing_tables := ARRAY[]::text[];

  -- Check for agencies table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'agencies'
  ) THEN
    missing_tables := array_append(missing_tables, 'agencies');
  END IF;

  -- Check for agency_services table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'agency_services'
  ) THEN
    missing_tables := array_append(missing_tables, 'agency_services');
  END IF;

  -- Check for events table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'events'
  ) THEN
    missing_tables := array_append(missing_tables, 'events');
  END IF;

  -- If any tables are missing, raise a helpful error
  IF array_length(missing_tables, 1) > 0 THEN
    RAISE EXCEPTION 'Missing required tables: %. Please run the base schema migration (20260107090000_complete_schema.sql) first! Migration order: 1) 20260107090000_complete_schema.sql, 2) 20260107100000_add_contact_email_to_projects.sql, 3) 20260107100001_add_contact_email_location_to_jobs.sql, 4) 20260107100002_create_views.sql', 
      array_to_string(missing_tables, ', ');
  END IF;
END $$;

-- Drop views if they exist (for clean re-creation)
DROP VIEW IF EXISTS view_event_card;
DROP VIEW IF EXISTS view_agency_card;

-- View for agency cards with aggregated services, industries, and technologies
CREATE OR REPLACE VIEW view_agency_card AS
SELECT 
  a.id,
  a.name,
  a.description,
  a.rating_avg,
  a.review_count,
  a.location_city,
  a.location_country,
  a.employee_range,
  a.created_at,
  -- Aggregate services into array
  COALESCE(
    ARRAY_AGG(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL),
    ARRAY[]::text[]
  ) AS services,
  -- Aggregate industries into array
  COALESCE(
    ARRAY_AGG(DISTINCT i.name) FILTER (WHERE i.name IS NOT NULL),
    ARRAY[]::text[]
  ) AS industries,
  -- Aggregate technologies into array
  COALESCE(
    ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL),
    ARRAY[]::text[]
  ) AS technologies
FROM agencies a
LEFT JOIN agency_services ags ON a.id = ags.agency_id
LEFT JOIN services s ON ags.service_id = s.id
LEFT JOIN agency_industries agi ON a.id = agi.agency_id
LEFT JOIN industries i ON agi.industry_id = i.id
LEFT JOIN agency_technologies agt ON a.id = agt.agency_id
LEFT JOIN technologies t ON agt.technology_id = t.id
GROUP BY a.id, a.name, a.description, a.rating_avg, a.review_count, 
         a.location_city, a.location_country, a.employee_range, a.created_at;

-- View for event cards with organizer name, tags array, and speakers count
-- Note: For full speaker details, use a separate query or enhance this view with JSON aggregation
CREATE OR REPLACE VIEW view_event_card AS
SELECT 
  e.id,
  e.organizer_id,
  e.title,
  e.description,
  e.event_type,
  e.start_at,
  e.end_at,
  e.location_type,
  e.location_label,
  e.cover_image_url,
  e.price_type,
  e.price_amount,
  e.price_currency,
  e.registration_url,
  e.is_featured,
  e.status,
  e.created_at,
  -- Organizer name
  o.name AS organizer_name,
  o.logo_url AS organizer_logo_url,
  -- Aggregate tags into array
  COALESCE(
    ARRAY_AGG(DISTINCT tag.name) FILTER (WHERE tag.name IS NOT NULL),
    ARRAY[]::text[]
  ) AS tags,
  -- Count speakers
  COUNT(DISTINCT es.speaker_id) AS speakers_count,
  -- Aggregate speaker names into array (for basic display)
  COALESCE(
    ARRAY_AGG(DISTINCT sp.name) FILTER (WHERE sp.name IS NOT NULL),
    ARRAY[]::text[]
  ) AS speaker_names
FROM events e
LEFT JOIN organizers o ON e.organizer_id = o.id
LEFT JOIN event_tags et ON e.id = et.event_id
LEFT JOIN tags tag ON et.tag_id = tag.id
LEFT JOIN event_speakers es ON e.id = es.event_id
LEFT JOIN speakers sp ON es.speaker_id = sp.id
WHERE e.status = 'published'  -- Only show published events
GROUP BY e.id, e.organizer_id, e.title, e.description, e.event_type, 
         e.start_at, e.end_at, e.location_type, e.location_label, 
         e.cover_image_url, e.price_type, e.price_amount, e.price_currency,
         e.registration_url, e.is_featured, e.status, e.created_at,
         o.name, o.logo_url;

-- Add comments
COMMENT ON VIEW view_agency_card IS 'Agency data with aggregated services, industries, and technologies arrays for card display';
COMMENT ON VIEW view_event_card IS 'Event data with organizer name, tags array, and speakers count for card display';

-- Grant public read access to views
GRANT SELECT ON view_agency_card TO anon, authenticated;
GRANT SELECT ON view_event_card TO anon, authenticated;

