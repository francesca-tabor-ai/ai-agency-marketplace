/*
  # Events and Jobs Schema for AI Agency Marketplace

  1. New Tables
    - `events`
      - Public events (conferences, workshops, webinars, etc.)
      - Public read access for all users
      - No auth required to view
    
    - `jobs`
      - Job postings by businesses
      - Auth required to create
      - Users can only read their own job postings

  2. Security
    - RLS enabled on all tables
    - Public read for events
    - Auth required for jobs (create/read own)
*/

-- Events table
CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type text NOT NULL CHECK (type IN ('conference', 'webinar', 'workshop', 'hackathon', 'meetup', 'training', 'networking')),
  description text NOT NULL,
  location text NOT NULL,
  date date NOT NULL,
  duration text NOT NULL,
  organizer text NOT NULL,
  organizer_logo text,
  ticket_price numeric(10,2),
  ticket_price_type text CHECK (ticket_price_type IN ('paid', 'free')) DEFAULT 'paid',
  tags text[] NOT NULL DEFAULT '{}',
  speakers jsonb DEFAULT '[]',
  image_url text,
  registration_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Jobs table
CREATE TABLE jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  company_name text NOT NULL,
  company_logo text,
  location text NOT NULL,
  employment_type text NOT NULL CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'internship')),
  salary_range jsonb NOT NULL, -- {min: number, max: number, currency: string}
  required_skills text[] NOT NULL DEFAULT '{}',
  industry text NOT NULL,
  application_deadline date,
  posted_date date DEFAULT CURRENT_DATE,
  qualifications jsonb DEFAULT '{}', -- {education: string, experience_level: string, certifications: string[]}
  company_info jsonb DEFAULT '{}', -- {website: string, contact_email: string}
  benefits text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'filled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Events policies: Public read access
CREATE POLICY "Public can view all events"
  ON events FOR SELECT
  TO public
  USING (true);

-- Jobs policies: Auth required to create, users can only read their own
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

-- Update agencies policy to allow public read (not just authenticated)
DROP POLICY IF EXISTS "Public can view agency profiles" ON agencies;
CREATE POLICY "Public can view agency profiles"
  ON agencies FOR SELECT
  TO public
  USING (true);

-- Update projects policy: Users can only read their own projects
DROP POLICY IF EXISTS "Anyone can view open projects" ON projects;
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (business_id = auth.uid());

-- Create indexes for better query performance
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_type ON events(type);
CREATE INDEX idx_events_tags ON events USING GIN(tags);
CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_industry ON jobs(industry);
CREATE INDEX idx_jobs_skills ON jobs USING GIN(required_skills);
CREATE INDEX idx_agencies_services ON agencies USING GIN(services_offered);
CREATE INDEX idx_agencies_industries ON agencies USING GIN(industry_specialties);

-- Create updated_at triggers for new tables
CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

