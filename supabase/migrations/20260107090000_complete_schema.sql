/*
  # Complete AI Agency Marketplace Schema
  
  This migration creates the complete database schema for AIAM including:
  - User profiles with auto-creation trigger
  - Agencies with many-to-many relationships
  - Projects and Jobs with proper relationships
  - Events with organizers, tags, and speakers
  - All necessary indexes and RLS policies
  
  NOTE: This migration drops existing tables if they exist to ensure a clean schema.
  Use with caution in production!
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- DROP EXISTING TABLES (if any) - In reverse dependency order
-- ============================================================================

-- Drop triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop tables in reverse dependency order (children before parents)
-- Note: CASCADE will automatically drop dependent objects (foreign keys, indexes, etc.)

-- Event-related tables
DROP TABLE IF EXISTS event_speakers CASCADE;
DROP TABLE IF EXISTS event_tags CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS speakers CASCADE;
DROP TABLE IF EXISTS organizers CASCADE;

-- Job-related tables
DROP TABLE IF EXISTS job_benefits CASCADE;
DROP TABLE IF EXISTS job_skills CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;

-- Project-related tables
DROP TABLE IF EXISTS project_services CASCADE;
DROP TABLE IF EXISTS projects CASCADE;

-- Agency-related tables
DROP TABLE IF EXISTS agency_technologies CASCADE;
DROP TABLE IF EXISTS agency_industries CASCADE;
DROP TABLE IF EXISTS agency_services CASCADE;
DROP TABLE IF EXISTS agencies CASCADE;

-- Legacy tables from previous migrations (if they exist)
DROP TABLE IF EXISTS people_reviews CASCADE;
DROP TABLE IF EXISTS people CASCADE;
DROP TABLE IF EXISTS quotes CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;

-- Core tables
DROP TABLE IF EXISTS profiles CASCADE;

-- Lookup tables
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS benefits CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS technologies CASCADE;
DROP TABLE IF EXISTS industries CASCADE;
DROP TABLE IF EXISTS services CASCADE;

-- ============================================================================
-- PROFILES
-- ============================================================================

CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- ============================================================================
-- LOOKUP TABLES
-- ============================================================================

CREATE TABLE services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE industries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE technologies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE benefits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- ============================================================================
-- AGENCIES
-- ============================================================================

CREATE TABLE agencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  rating_avg numeric(3,2) DEFAULT 0.00,
  review_count int DEFAULT 0,
  location_city text,
  location_country text,
  employee_range text,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE agency_services (
  agency_id uuid REFERENCES agencies(id) ON DELETE CASCADE,
  service_id uuid REFERENCES services(id) ON DELETE CASCADE,
  PRIMARY KEY (agency_id, service_id)
);

CREATE TABLE agency_industries (
  agency_id uuid REFERENCES agencies(id) ON DELETE CASCADE,
  industry_id uuid REFERENCES industries(id) ON DELETE CASCADE,
  PRIMARY KEY (agency_id, industry_id)
);

CREATE TABLE agency_technologies (
  agency_id uuid REFERENCES agencies(id) ON DELETE CASCADE,
  technology_id uuid REFERENCES technologies(id) ON DELETE CASCADE,
  PRIMARY KEY (agency_id, technology_id)
);

-- ============================================================================
-- PROJECTS
-- ============================================================================

CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  industry text NOT NULL,
  budget_range text NOT NULL,
  project_timing text NOT NULL,
  location_preference text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'in-progress', 'completed')),
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE project_services (
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  service_id uuid REFERENCES services(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, service_id)
);

-- ============================================================================
-- JOBS
-- ============================================================================

CREATE TABLE jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  employment_type text NOT NULL CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'internship')),
  industry text NOT NULL,
  salary_min numeric(10,2),
  salary_max numeric(10,2),
  application_deadline date,
  education_required text,
  experience_level text CHECK (experience_level IN ('entry', 'mid', 'senior', 'expert')),
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft', 'closed', 'filled')),
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE job_skills (
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  skill_id uuid REFERENCES skills(id) ON DELETE CASCADE,
  PRIMARY KEY (job_id, skill_id)
);

CREATE TABLE job_benefits (
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  benefit_id uuid REFERENCES benefits(id) ON DELETE CASCADE,
  PRIMARY KEY (job_id, benefit_id)
);

-- ============================================================================
-- EVENTS
-- ============================================================================

CREATE TABLE organizers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text,
  website_url text,
  contact_email text,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE speakers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  title text,
  company text,
  photo_url text,
  bio text,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id uuid REFERENCES organizers(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('conference', 'webinar', 'workshop', 'hackathon', 'meetup', 'training', 'networking')),
  start_at date NOT NULL,
  end_at date,
  location_type text CHECK (location_type IN ('in-person', 'virtual', 'hybrid')),
  location_label text,
  cover_image_url text,
  price_type text NOT NULL CHECK (price_type IN ('free', 'paid')),
  price_amount numeric(10,2),
  price_currency text DEFAULT 'USD',
  registration_url text,
  is_featured boolean DEFAULT false NOT NULL,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft', 'cancelled', 'completed')),
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE event_tags (
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, tag_id)
);

CREATE TABLE event_speakers (
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  speaker_id uuid REFERENCES speakers(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, speaker_id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Agencies indexes
CREATE INDEX idx_agencies_location_country ON agencies(location_country);
CREATE INDEX idx_agencies_rating_avg ON agencies(rating_avg DESC);
CREATE INDEX idx_agencies_location_city ON agencies(location_city);
CREATE INDEX idx_agencies_created_at ON agencies(created_at DESC);

-- Events indexes
CREATE INDEX idx_events_start_at ON events(start_at);
CREATE INDEX idx_events_event_type ON events(event_type);
CREATE INDEX idx_events_price_type ON events(price_type);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_is_featured ON events(is_featured) WHERE is_featured = true;
CREATE INDEX idx_events_organizer_id ON events(organizer_id);

-- Projects indexes
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_industry ON projects(industry);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

-- Jobs indexes
CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_industry ON jobs(industry);
CREATE INDEX idx_jobs_employment_type ON jobs(employment_type);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);

-- Join table indexes
CREATE INDEX idx_agency_services_agency_id ON agency_services(agency_id);
CREATE INDEX idx_agency_services_service_id ON agency_services(service_id);
CREATE INDEX idx_agency_industries_agency_id ON agency_industries(agency_id);
CREATE INDEX idx_agency_industries_industry_id ON agency_industries(industry_id);
CREATE INDEX idx_agency_technologies_agency_id ON agency_technologies(agency_id);
CREATE INDEX idx_agency_technologies_technology_id ON agency_technologies(technology_id);
CREATE INDEX idx_project_services_project_id ON project_services(project_id);
CREATE INDEX idx_project_services_service_id ON project_services(service_id);
CREATE INDEX idx_job_skills_job_id ON job_skills(job_id);
CREATE INDEX idx_job_skills_skill_id ON job_skills(skill_id);
CREATE INDEX idx_job_benefits_job_id ON job_benefits(job_id);
CREATE INDEX idx_job_benefits_benefit_id ON job_benefits(benefit_id);
CREATE INDEX idx_event_tags_event_id ON event_tags(event_id);
CREATE INDEX idx_event_tags_tag_id ON event_tags(tag_id);
CREATE INDEX idx_event_speakers_event_id ON event_speakers(event_id);
CREATE INDEX idx_event_speakers_speaker_id ON event_speakers(speaker_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_speakers ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- PROFILES
-- ----------------------------------------------------------------------------

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- AGENCIES - Public Read Access
-- ----------------------------------------------------------------------------

CREATE POLICY "Public can view agencies"
  ON agencies FOR SELECT
  TO public
  USING (true);

-- ----------------------------------------------------------------------------
-- LOOKUP TABLES - Public Read, Service Role Write
-- ----------------------------------------------------------------------------

-- Services: Public read, service_role write
CREATE POLICY "Public can view services"
  ON services FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Service role can manage services"
  ON services FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Industries: Public read, service_role write
CREATE POLICY "Public can view industries"
  ON industries FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Service role can manage industries"
  ON industries FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Technologies: Public read, service_role write
CREATE POLICY "Public can view technologies"
  ON technologies FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Service role can manage technologies"
  ON technologies FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Skills: Public read, service_role write
CREATE POLICY "Public can view skills"
  ON skills FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Service role can manage skills"
  ON skills FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Benefits: Public read, service_role write
CREATE POLICY "Public can view benefits"
  ON benefits FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Service role can manage benefits"
  ON benefits FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Tags: Public read, service_role write
CREATE POLICY "Public can view tags"
  ON tags FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Service role can manage tags"
  ON tags FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- AGENCY JOIN TABLES - Public Read Access
-- ----------------------------------------------------------------------------

CREATE POLICY "Public can view agency_services"
  ON agency_services FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can view agency_industries"
  ON agency_industries FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can view agency_technologies"
  ON agency_technologies FOR SELECT
  TO public
  USING (true);

-- ----------------------------------------------------------------------------
-- PROJECTS - Authenticated Create, Owner Read/Update/Delete
-- ----------------------------------------------------------------------------

CREATE POLICY "Authenticated users can create projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- PROJECT SERVICES - Follow Project Access
-- ----------------------------------------------------------------------------

CREATE POLICY "Users can view project_services for their projects"
  ON project_services FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_services.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert project_services for their projects"
  ON project_services FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_services.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update project_services for their projects"
  ON project_services FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_services.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete project_services for their projects"
  ON project_services FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_services.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- JOBS - Authenticated Create, Owner Read/Update/Delete
-- ----------------------------------------------------------------------------

CREATE POLICY "Authenticated users can create jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own jobs"
  ON jobs FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own jobs"
  ON jobs FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- JOB SKILLS - Follow Job Access
-- ----------------------------------------------------------------------------

CREATE POLICY "Users can view job_skills for their jobs"
  ON job_skills FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = job_skills.job_id
      AND jobs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert job_skills for their jobs"
  ON job_skills FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = job_skills.job_id
      AND jobs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update job_skills for their jobs"
  ON job_skills FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = job_skills.job_id
      AND jobs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete job_skills for their jobs"
  ON job_skills FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = job_skills.job_id
      AND jobs.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- JOB BENEFITS - Follow Job Access
-- ----------------------------------------------------------------------------

CREATE POLICY "Users can view job_benefits for their jobs"
  ON job_benefits FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = job_benefits.job_id
      AND jobs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert job_benefits for their jobs"
  ON job_benefits FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = job_benefits.job_id
      AND jobs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update job_benefits for their jobs"
  ON job_benefits FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = job_benefits.job_id
      AND jobs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete job_benefits for their jobs"
  ON job_benefits FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = job_benefits.job_id
      AND jobs.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- EVENTS - Public Read Access
-- ----------------------------------------------------------------------------

CREATE POLICY "Public can view published events"
  ON events FOR SELECT
  TO public
  USING (status = 'published');

-- ----------------------------------------------------------------------------
-- ORGANIZERS - Public Read Access
-- ----------------------------------------------------------------------------

CREATE POLICY "Public can view organizers"
  ON organizers FOR SELECT
  TO public
  USING (true);

-- ----------------------------------------------------------------------------
-- SPEAKERS - Public Read Access
-- ----------------------------------------------------------------------------

CREATE POLICY "Public can view speakers"
  ON speakers FOR SELECT
  TO public
  USING (true);

-- ----------------------------------------------------------------------------
-- EVENT JOIN TABLES - Public Read Access
-- ----------------------------------------------------------------------------

CREATE POLICY "Public can view event_tags"
  ON event_tags FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can view event_speakers"
  ON event_speakers FOR SELECT
  TO public
  USING (true);

-- ============================================================================
-- AUTO-CREATE PROFILE TRIGGER
-- ============================================================================

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant necessary permissions for the trigger function
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO authenticated;

-- ============================================================================
-- POLICY TEST CHECKLIST
-- ============================================================================

/*
  RLS Policy Test Checklist
  =========================
  
  Test each policy to ensure proper access control:
  
  PUBLIC READ ACCESS (should work without authentication):
  [ ] SELECT from agencies (should succeed)
  [ ] SELECT from services (should succeed)
  [ ] SELECT from industries (should succeed)
  [ ] SELECT from technologies (should succeed)
  [ ] SELECT from skills (should succeed)
  [ ] SELECT from benefits (should succeed)
  [ ] SELECT from tags (should succeed)
  [ ] SELECT from agency_services (should succeed)
  [ ] SELECT from agency_industries (should succeed)
  [ ] SELECT from agency_technologies (should succeed)
  [ ] SELECT from events WHERE status = 'published' (should succeed)
  [ ] SELECT from organizers (should succeed)
  [ ] SELECT from speakers (should succeed)
  [ ] SELECT from event_tags (should succeed)
  [ ] SELECT from event_speakers (should succeed)
  
  PUBLIC READ ACCESS (should fail):
  [ ] SELECT from events WHERE status != 'published' (should fail for public)
  [ ] SELECT from projects (should fail for public)
  [ ] SELECT from jobs (should fail for public)
  
  AUTHENTICATED USER TESTS (as user A):
  [ ] INSERT into projects with user_id = user A (should succeed)
  [ ] SELECT from projects WHERE user_id = user A (should succeed)
  [ ] SELECT from projects WHERE user_id = user B (should fail)
  [ ] UPDATE projects WHERE user_id = user A (should succeed)
  [ ] UPDATE projects WHERE user_id = user B (should fail)
  [ ] DELETE projects WHERE user_id = user A (should succeed)
  [ ] DELETE projects WHERE user_id = user B (should fail)
  [ ] INSERT into jobs with user_id = user A (should succeed)
  [ ] SELECT from jobs WHERE user_id = user A (should succeed)
  [ ] SELECT from jobs WHERE user_id = user B (should fail)
  [ ] UPDATE jobs WHERE user_id = user A (should succeed)
  [ ] UPDATE jobs WHERE user_id = user B (should fail)
  [ ] DELETE jobs WHERE user_id = user A (should succeed)
  [ ] DELETE jobs WHERE user_id = user B (should fail)
  [ ] SELECT own profile (should succeed)
  [ ] SELECT other user's profile (should fail)
  [ ] UPDATE own profile (should succeed)
  [ ] UPDATE other user's profile (should fail)
  
  JOIN TABLE TESTS (as user A with project A):
  [ ] SELECT from project_services WHERE project_id = project A (should succeed)
  [ ] INSERT into project_services WHERE project_id = project A (should succeed)
  [ ] INSERT into project_services WHERE project_id = project B (should fail)
  [ ] SELECT from job_skills WHERE job_id = job A (should succeed)
  [ ] INSERT into job_skills WHERE job_id = job A (should succeed)
  [ ] INSERT into job_skills WHERE job_id = job B (should fail)
  [ ] SELECT from job_benefits WHERE job_id = job A (should succeed)
  [ ] INSERT into job_benefits WHERE job_id = job A (should succeed)
  [ ] INSERT into job_benefits WHERE job_id = job B (should fail)
  
  SERVICE ROLE TESTS (using service_role key):
  [ ] INSERT into services (should succeed)
  [ ] UPDATE services (should succeed)
  [ ] DELETE services (should succeed)
  [ ] INSERT into industries (should succeed)
  [ ] UPDATE industries (should succeed)
  [ ] DELETE industries (should succeed)
  [ ] INSERT into technologies (should succeed)
  [ ] UPDATE technologies (should succeed)
  [ ] DELETE technologies (should succeed)
  [ ] INSERT into skills (should succeed)
  [ ] UPDATE skills (should succeed)
  [ ] DELETE skills (should succeed)
  [ ] INSERT into benefits (should succeed)
  [ ] UPDATE benefits (should succeed)
  [ ] DELETE benefits (should succeed)
  [ ] INSERT into tags (should succeed)
  [ ] UPDATE tags (should succeed)
  [ ] DELETE tags (should succeed)
  
  AUTHENTICATED USER WRITE TESTS (should fail):
  [ ] INSERT into services as authenticated user (should fail)
  [ ] UPDATE services as authenticated user (should fail)
  [ ] DELETE services as authenticated user (should fail)
  [ ] INSERT into industries as authenticated user (should fail)
  [ ] UPDATE industries as authenticated user (should fail)
  [ ] DELETE industries as authenticated user (should fail)
  
  PROFILE AUTO-CREATION TEST:
  [ ] Create new user via auth.signUp()
  [ ] Verify profile row is automatically created
  [ ] Verify profile.id matches auth.users.id
  [ ] Verify profile.full_name is set from metadata or email
  
  Example test queries:
  
  -- Test public read (run without auth)
  SELECT * FROM agencies LIMIT 1;
  SELECT * FROM services LIMIT 1;
  SELECT * FROM events WHERE status = 'published' LIMIT 1;
  
  -- Test authenticated user (run with user token)
  -- As user A:
  INSERT INTO projects (user_id, title, description, industry, budget_range, project_timing)
  VALUES (auth.uid(), 'Test Project', 'Description', 'Tech', '$10k-$25k', 'short-term');
  
  SELECT * FROM projects WHERE user_id = auth.uid();
  
  -- Test service role (run with service_role key)
  INSERT INTO services (name) VALUES ('Test Service');
  UPDATE services SET name = 'Updated Service' WHERE name = 'Test Service';
  DELETE FROM services WHERE name = 'Updated Service';
*/

