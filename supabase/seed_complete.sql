/*
  # Complete Seed Data for AI Agency Marketplace
  
  This script seeds demo data matching the current UI:
  - Lookup tables (services, industries, technologies, skills, benefits, tags)
  - 3 agencies with join table relationships
  - Events with organizers, speakers, tags and their join tables
  
  Safe to rerun: Uses ON CONFLICT DO NOTHING for idempotency
  
  IMPORTANT: Run the migration file (20260107090000_complete_schema.sql) FIRST
  before running this seed script!
*/

-- ============================================================================
-- VERIFY TABLES EXIST
-- ============================================================================

DO $$
BEGIN
  -- Check if required tables exist
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'services') THEN
    RAISE EXCEPTION 'Table "services" does not exist. Please run the migration file (20260107090000_complete_schema.sql) first!';
  END IF;
  
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'agencies') THEN
    RAISE EXCEPTION 'Table "agencies" does not exist. Please run the migration file (20260107090000_complete_schema.sql) first!';
  END IF;
  
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'events') THEN
    RAISE EXCEPTION 'Table "events" does not exist. Please run the migration file (20260107090000_complete_schema.sql) first!';
  END IF;
END $$;

-- ============================================================================
-- LOOKUP TABLES
-- ============================================================================

-- Services
INSERT INTO services (name) VALUES
  ('AI Development'),
  ('Machine Learning'),
  ('NLP'),
  ('Computer Vision'),
  ('Robotics'),
  ('Data Analytics'),
  ('AI Consulting')
ON CONFLICT (name) DO NOTHING;

-- Industries
INSERT INTO industries (name) VALUES
  ('Healthcare'),
  ('Finance'),
  ('Retail'),
  ('Manufacturing'),
  ('Technology'),
  ('Education'),
  ('Other')
ON CONFLICT (name) DO NOTHING;

-- Technologies
INSERT INTO technologies (name) VALUES
  ('TensorFlow'),
  ('PyTorch'),
  ('AWS'),
  ('Google Cloud'),
  ('Azure'),
  ('Python'),
  ('Node.js'),
  ('React')
ON CONFLICT (name) DO NOTHING;

-- Skills
INSERT INTO skills (name) VALUES
  ('Python'),
  ('TensorFlow'),
  ('PyTorch'),
  ('Machine Learning'),
  ('Natural Language Processing'),
  ('Computer Vision'),
  ('Deep Learning'),
  ('Data Science'),
  ('AI Development'),
  ('Cloud Computing'),
  ('Docker'),
  ('Kubernetes')
ON CONFLICT (name) DO NOTHING;

-- Benefits
INSERT INTO benefits (name) VALUES
  ('Health Insurance'),
  ('Dental Insurance'),
  ('Vision Insurance'),
  ('401(k)'),
  ('Remote Work'),
  ('Flexible Hours'),
  ('Professional Development'),
  ('Stock Options'),
  ('Paid Time Off'),
  ('Parental Leave')
ON CONFLICT (name) DO NOTHING;

-- Tags (for events)
INSERT INTO tags (name) VALUES
  ('AI'),
  ('Machine Learning'),
  ('Innovation'),
  ('Technology'),
  ('Deep Learning'),
  ('Python'),
  ('TensorFlow'),
  ('Healthcare'),
  ('MedTech'),
  ('Networking'),
  ('Workshop'),
  ('Conference')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- AGENCIES
-- ============================================================================

DO $$
DECLARE
  agency1_uuid uuid;
  agency2_uuid uuid;
  agency3_uuid uuid;
  service_id_val uuid;
  industry_id_val uuid;
  tech_id_val uuid;
  organizer1_uuid uuid;
  organizer2_uuid uuid;
  organizer3_uuid uuid;
  event1_uuid uuid;
  event2_uuid uuid;
  event3_uuid uuid;
  speaker_id_val uuid;
  tag_id_val uuid;
  speaker1_uuid uuid;
  speaker2_uuid uuid;
  speaker3_uuid uuid;
  speaker4_uuid uuid;
  speaker5_uuid uuid;
  speaker6_uuid uuid;
BEGIN
  -- Agency 1: AI Solutions Pro
  -- Check if exists first, if not insert
  SELECT id INTO agency1_uuid FROM agencies WHERE name = 'AI Solutions Pro' LIMIT 1;
  
  IF agency1_uuid IS NULL THEN
    INSERT INTO agencies (name, description, rating_avg, review_count, location_city, location_country, employee_range)
    VALUES (
      'AI Solutions Pro',
      'Leading AI development agency specializing in machine learning solutions for healthcare, finance, and technology sectors. We deliver cutting-edge AI implementations with measurable business outcomes.',
      4.8,
      47,
      'San Francisco',
      'USA',
      '11-50 employees'
    )
    RETURNING id INTO agency1_uuid;
  ELSE
    -- Update existing agency
    UPDATE agencies SET
      description = 'Leading AI development agency specializing in machine learning solutions for healthcare, finance, and technology sectors. We deliver cutting-edge AI implementations with measurable business outcomes.',
      rating_avg = 4.8,
      review_count = 47,
      location_city = 'San Francisco',
      location_country = 'USA',
      employee_range = '11-50 employees'
    WHERE id = agency1_uuid;
  END IF;
  
  -- Agency Services
  FOR service_id_val IN SELECT id FROM services WHERE name IN ('AI Development', 'Machine Learning', 'Data Analytics', 'Computer Vision')
  LOOP
    INSERT INTO agency_services (agency_id, service_id)
    VALUES (agency1_uuid, service_id_val)
    ON CONFLICT DO NOTHING;
  END LOOP;
  
  -- Agency Industries
  FOR industry_id_val IN SELECT id FROM industries WHERE name IN ('Healthcare', 'Finance', 'Technology')
  LOOP
    INSERT INTO agency_industries (agency_id, industry_id)
    VALUES (agency1_uuid, industry_id_val)
    ON CONFLICT DO NOTHING;
  END LOOP;
  
  -- Agency Technologies
  FOR tech_id_val IN SELECT id FROM technologies WHERE name IN ('TensorFlow', 'PyTorch', 'Python', 'AWS')
  LOOP
    INSERT INTO agency_technologies (agency_id, technology_id)
    VALUES (agency1_uuid, tech_id_val)
    ON CONFLICT DO NOTHING;
  END LOOP;
  
  -- Agency 2: Neural Dynamics
  SELECT id INTO agency2_uuid FROM agencies WHERE name = 'Neural Dynamics' LIMIT 1;
  
  IF agency2_uuid IS NULL THEN
    INSERT INTO agencies (name, description, rating_avg, review_count, location_city, location_country, employee_range)
    VALUES (
      'Neural Dynamics',
      'Specialized in natural language processing and AI consulting. We help businesses leverage AI to transform their operations and drive innovation.',
      4.6,
      32,
      'London',
      'UK',
      '1-10 employees'
    )
    RETURNING id INTO agency2_uuid;
  ELSE
    UPDATE agencies SET
      description = 'Specialized in natural language processing and AI consulting. We help businesses leverage AI to transform their operations and drive innovation.',
      rating_avg = 4.6,
      review_count = 32,
      location_city = 'London',
      location_country = 'UK',
      employee_range = '1-10 employees'
    WHERE id = agency2_uuid;
  END IF;
  
  -- Agency 2 Services
  FOR service_id_val IN SELECT id FROM services WHERE name IN ('Natural Language Processing', 'AI Consulting', 'Machine Learning')
  LOOP
    INSERT INTO agency_services (agency_id, service_id)
    VALUES (agency2_uuid, service_id_val)
    ON CONFLICT DO NOTHING;
  END LOOP;
  
  -- Agency 2 Industries
  FOR industry_id_val IN SELECT id FROM industries WHERE name IN ('Retail', 'Manufacturing', 'Education')
  LOOP
    INSERT INTO agency_industries (agency_id, industry_id)
    VALUES (agency2_uuid, industry_id_val)
    ON CONFLICT DO NOTHING;
  END LOOP;
  
  -- Agency 2 Technologies
  FOR tech_id_val IN SELECT id FROM technologies WHERE name IN ('Python', 'TensorFlow', 'Google Cloud')
  LOOP
    INSERT INTO agency_technologies (agency_id, technology_id)
    VALUES (agency2_uuid, tech_id_val)
    ON CONFLICT DO NOTHING;
  END LOOP;
  
  -- Agency 3: DataMind Technologies
  SELECT id INTO agency3_uuid FROM agencies WHERE name = 'DataMind Technologies' LIMIT 1;
  
  IF agency3_uuid IS NULL THEN
    INSERT INTO agencies (name, description, rating_avg, review_count, location_city, location_country, employee_range)
    VALUES (
      'DataMind Technologies',
      'Enterprise AI solutions provider with expertise in data analytics, robotics, and computer vision. We build scalable AI systems for large organizations.',
      4.9,
      68,
      'Berlin',
      'Germany',
      '51-200 employees'
    )
    RETURNING id INTO agency3_uuid;
  ELSE
    UPDATE agencies SET
      description = 'Enterprise AI solutions provider with expertise in data analytics, robotics, and computer vision. We build scalable AI systems for large organizations.',
      rating_avg = 4.9,
      review_count = 68,
      location_city = 'Berlin',
      location_country = 'Germany',
      employee_range = '51-200 employees'
    WHERE id = agency3_uuid;
  END IF;
  
  -- Agency 3 Services
  FOR service_id_val IN SELECT id FROM services WHERE name IN ('Data Analytics', 'AI Development', 'Robotics')
  LOOP
    INSERT INTO agency_services (agency_id, service_id)
    VALUES (agency3_uuid, service_id_val)
    ON CONFLICT DO NOTHING;
  END LOOP;
  
  -- Agency 3 Industries
  FOR industry_id_val IN SELECT id FROM industries WHERE name IN ('Automotive', 'Technology', 'Healthcare')
  LOOP
    INSERT INTO agency_industries (agency_id, industry_id)
    VALUES (agency3_uuid, industry_id_val)
    ON CONFLICT DO NOTHING;
  END LOOP;
  
  -- Agency 3 Technologies
  FOR tech_id_val IN SELECT id FROM technologies WHERE name IN ('PyTorch', 'Azure', 'Python', 'Docker')
  LOOP
    INSERT INTO agency_technologies (agency_id, technology_id)
    VALUES (agency3_uuid, tech_id_val)
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- ============================================================================
-- EVENTS
-- ============================================================================

DO $$
DECLARE
  organizer1_uuid uuid;
  organizer2_uuid uuid;
  organizer3_uuid uuid;
  event1_uuid uuid;
  event2_uuid uuid;
  event3_uuid uuid;
  speaker_id_val uuid;
  tag_id_val uuid;
BEGIN
  -- Organizer 1: Tech Conferences Inc.
  SELECT id INTO organizer1_uuid FROM organizers WHERE name = 'Tech Conferences Inc.' LIMIT 1;
  
  IF organizer1_uuid IS NULL THEN
    INSERT INTO organizers (name, logo_url, website_url, contact_email)
    VALUES (
      'Tech Conferences Inc.',
      'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=300',
      'https://techconferences.example.com',
      'info@techconferences.example.com'
    )
    RETURNING id INTO organizer1_uuid;
  END IF;
  
  -- Organizer 2: AI Education Hub
  SELECT id INTO organizer2_uuid FROM organizers WHERE name = 'AI Education Hub' LIMIT 1;
  
  IF organizer2_uuid IS NULL THEN
    INSERT INTO organizers (name, logo_url, website_url, contact_email)
    VALUES (
      'AI Education Hub',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=300',
      'https://aieducation.example.com',
      'contact@aieducation.example.com'
    )
    RETURNING id INTO organizer2_uuid;
  END IF;
  
  -- Organizer 3: HealthTech Alliance
  SELECT id INTO organizer3_uuid FROM organizers WHERE name = 'HealthTech Alliance' LIMIT 1;
  
  IF organizer3_uuid IS NULL THEN
    INSERT INTO organizers (name, logo_url, website_url, contact_email)
    VALUES (
      'HealthTech Alliance',
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=300',
      'https://healthtech.example.com',
      'hello@healthtech.example.com'
    )
    RETURNING id INTO organizer3_uuid;
  END IF;
  
  -- Event 1: AI Summit 2025
  SELECT id INTO event1_uuid FROM events WHERE title = 'AI Summit 2025' LIMIT 1;
  
  IF event1_uuid IS NULL THEN
    INSERT INTO events (
      organizer_id, title, description, event_type, start_at, end_at,
      location_type, location_label, cover_image_url,
      price_type, price_amount, price_currency, registration_url, is_featured, status
    )
    VALUES (
      organizer1_uuid,
      'AI Summit 2025',
      'Join industry leaders and experts for a three-day summit exploring the future of AI and its impact across industries.',
      'conference',
      '2025-04-15',
      '2025-04-17',
      'in-person',
      'New York, USA',
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=2000',
      'paid',
      999.00,
      'USD',
      'https://example.com/register/ai-summit-2025',
      true,
      'published'
    )
    RETURNING id INTO event1_uuid;
  END IF;
  
  -- Speakers for Event 1 (insert or get existing)
  -- Speaker 1: Dr. Sarah Johnson
  SELECT id INTO speaker1_uuid FROM speakers WHERE name = 'Dr. Sarah Johnson' LIMIT 1;
  IF speaker1_uuid IS NULL THEN
    INSERT INTO speakers (name, title, company, photo_url, bio)
    VALUES ('Dr. Sarah Johnson', 'AI Research Director', 'Tech Innovations Lab', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150', 'Leading researcher in AI and machine learning with 15+ years of experience.')
    RETURNING id INTO speaker1_uuid;
  END IF;
  
  -- Speaker 2: Michael Chen
  SELECT id INTO speaker2_uuid FROM speakers WHERE name = 'Michael Chen' LIMIT 1;
  IF speaker2_uuid IS NULL THEN
    INSERT INTO speakers (name, title, company, photo_url, bio)
    VALUES ('Michael Chen', 'Chief AI Officer', 'Global Tech Corp', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150', 'Expert in enterprise AI implementations and strategy.')
    RETURNING id INTO speaker2_uuid;
  END IF;
  
  -- Speaker 3: Emily Brown
  SELECT id INTO speaker3_uuid FROM speakers WHERE name = 'Emily Brown' LIMIT 1;
  IF speaker3_uuid IS NULL THEN
    INSERT INTO speakers (name, title, company, photo_url, bio)
    VALUES ('Emily Brown', 'ML Engineer', 'AI Solutions Pro', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150', 'Specialized in deep learning and neural network architectures.')
    RETURNING id INTO speaker3_uuid;
  END IF;
  
  -- Link speakers to event
  INSERT INTO event_speakers (event_id, speaker_id) VALUES (event1_uuid, speaker1_uuid) ON CONFLICT DO NOTHING;
  INSERT INTO event_speakers (event_id, speaker_id) VALUES (event1_uuid, speaker2_uuid) ON CONFLICT DO NOTHING;
  INSERT INTO event_speakers (event_id, speaker_id) VALUES (event1_uuid, speaker3_uuid) ON CONFLICT DO NOTHING;
  
  -- Link tags to event
  FOR tag_id_val IN SELECT id FROM tags WHERE name IN ('AI', 'Machine Learning', 'Innovation', 'Technology')
  LOOP
    INSERT INTO event_tags (event_id, tag_id)
    VALUES (event1_uuid, tag_id_val)
    ON CONFLICT DO NOTHING;
  END LOOP;
  
  -- Event 2: Machine Learning Workshop Series
  SELECT id INTO event2_uuid FROM events WHERE title = 'Machine Learning Workshop Series' LIMIT 1;
  
  IF event2_uuid IS NULL THEN
    INSERT INTO events (
      organizer_id, title, description, event_type, start_at, end_at,
      location_type, location_label, cover_image_url,
      price_type, price_amount, price_currency, registration_url, is_featured, status
    )
    VALUES (
      organizer2_uuid,
      'Machine Learning Workshop Series',
      'Hands-on workshop series covering advanced machine learning techniques and practical implementations.',
      'workshop',
      '2025-03-20',
      '2025-04-10',
      'virtual',
      'Virtual',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2000',
      'paid',
      499.00,
      'USD',
      'https://example.com/register/ml-workshop',
      false,
      'published'
    )
    RETURNING id INTO event2_uuid;
  END IF;
  
  -- Speakers for Event 2
  -- Speaker 4: John Smith
  SELECT id INTO speaker4_uuid FROM speakers WHERE name = 'John Smith' LIMIT 1;
  IF speaker4_uuid IS NULL THEN
    INSERT INTO speakers (name, title, company, photo_url, bio)
    VALUES ('John Smith', 'Senior ML Engineer', 'Data Science Co', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150', 'Expert in machine learning and data science with focus on practical applications.')
    RETURNING id INTO speaker4_uuid;
  END IF;
  
  -- Speaker 5: Alice Wong
  SELECT id INTO speaker5_uuid FROM speakers WHERE name = 'Alice Wong' LIMIT 1;
  IF speaker5_uuid IS NULL THEN
    INSERT INTO speakers (name, title, company, photo_url, bio)
    VALUES ('Alice Wong', 'Data Scientist', 'AI Research Institute', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150', 'Specialized in deep learning and neural networks.')
    RETURNING id INTO speaker5_uuid;
  END IF;
  
  -- Link speakers to event
  INSERT INTO event_speakers (event_id, speaker_id) VALUES (event2_uuid, speaker4_uuid) ON CONFLICT DO NOTHING;
  INSERT INTO event_speakers (event_id, speaker_id) VALUES (event2_uuid, speaker5_uuid) ON CONFLICT DO NOTHING;
  
  -- Link tags to event
  FOR tag_id_val IN SELECT id FROM tags WHERE name IN ('Machine Learning', 'Deep Learning', 'Python', 'TensorFlow')
  LOOP
    INSERT INTO event_tags (event_id, tag_id)
    VALUES (event2_uuid, tag_id_val)
    ON CONFLICT DO NOTHING;
  END LOOP;
  
  -- Event 3: AI in Healthcare Webinar
  SELECT id INTO event3_uuid FROM events WHERE title = 'AI in Healthcare Webinar' LIMIT 1;
  
  IF event3_uuid IS NULL THEN
    INSERT INTO events (
      organizer_id, title, description, event_type, start_at, end_at,
      location_type, location_label, cover_image_url,
      price_type, price_amount, price_currency, registration_url, is_featured, status
    )
    VALUES (
      organizer3_uuid,
      'AI in Healthcare Webinar',
      'Discover how artificial intelligence is revolutionizing healthcare delivery and patient care.',
      'webinar',
      '2025-03-10',
      '2025-03-10',
      'virtual',
      'Virtual',
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=2000',
      'free',
      0.00,
      'USD',
      'https://example.com/register/healthcare-webinar',
      false,
      'published'
    )
    RETURNING id INTO event3_uuid;
  END IF;
  
  -- Speakers for Event 3
  -- Speaker 6: Dr. James Wilson
  SELECT id INTO speaker6_uuid FROM speakers WHERE name = 'Dr. James Wilson' LIMIT 1;
  IF speaker6_uuid IS NULL THEN
    INSERT INTO speakers (name, title, company, photo_url, bio)
    VALUES ('Dr. James Wilson', 'Medical AI Researcher', 'HealthTech Research Center', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150', 'Leading researcher in medical AI applications and patient care innovation.')
    RETURNING id INTO speaker6_uuid;
  END IF;
  
  -- Link speaker to event
  INSERT INTO event_speakers (event_id, speaker_id) VALUES (event3_uuid, speaker6_uuid) ON CONFLICT DO NOTHING;
  
  -- Link tags to event
  FOR tag_id_val IN SELECT id FROM tags WHERE name IN ('Healthcare', 'AI', 'Innovation', 'MedTech')
  LOOP
    INSERT INTO event_tags (event_id, tag_id)
    VALUES (event3_uuid, tag_id_val)
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

