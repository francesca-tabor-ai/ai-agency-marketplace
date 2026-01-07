/*
  # Seed Data for AI Agency Marketplace
  
  This script seeds initial data for:
  - Agencies (public read)
  - Events (public read)
  
  Note: This assumes profiles and agencies tables already exist.
  For production, you may want to create actual user profiles first.
*/

-- Insert seed agencies
-- Note: These reference profiles which should exist in auth.users
-- For seeding purposes, we'll create agencies that can be linked to profiles later
-- In a real scenario, you'd create profiles first, then agencies

-- First, let's create some placeholder profiles for agencies
-- (In production, these would be created through the auth system)
-- For now, we'll insert agencies that can be updated when real profiles are created

-- Insert seed events
INSERT INTO events (title, type, description, location, date, duration, organizer, organizer_logo, ticket_price, ticket_price_type, tags, speakers, image_url, registration_url) VALUES
(
  'AI Summit 2025',
  'conference',
  'Join industry leaders and experts for a three-day summit exploring the future of AI and its impact across industries.',
  'New York, USA',
  '2025-04-15',
  '3 days',
  'Tech Conferences Inc.',
  'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=300',
  999.00,
  'paid',
  ARRAY['AI', 'Machine Learning', 'Innovation', 'Technology'],
  '[
    {"name": "Dr. Sarah Johnson", "title": "AI Research Director", "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150"},
    {"name": "Michael Chen", "title": "Chief AI Officer", "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150"},
    {"name": "Emily Brown", "title": "ML Engineer", "image": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150"}
  ]'::jsonb,
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=2000',
  'https://example.com/register/ai-summit-2025'
),
(
  'Machine Learning Workshop Series',
  'workshop',
  'Hands-on workshop series covering advanced machine learning techniques and practical implementations.',
  'Virtual',
  '2025-03-20',
  '4 weeks',
  'AI Education Hub',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=300',
  499.00,
  'paid',
  ARRAY['Machine Learning', 'Deep Learning', 'Python', 'TensorFlow'],
  '[
    {"name": "John Smith", "title": "Senior ML Engineer", "image": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150"},
    {"name": "Alice Wong", "title": "Data Scientist", "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150"}
  ]'::jsonb,
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2000',
  'https://example.com/register/ml-workshop'
),
(
  'AI in Healthcare Webinar',
  'webinar',
  'Discover how artificial intelligence is revolutionizing healthcare delivery and patient care.',
  'Virtual',
  '2025-03-10',
  '2 hours',
  'HealthTech Alliance',
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=300',
  0.00,
  'free',
  ARRAY['Healthcare', 'AI', 'Innovation', 'MedTech'],
  '[
    {"name": "Dr. James Wilson", "title": "Medical AI Researcher", "image": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150"}
  ]'::jsonb,
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=2000',
  'https://example.com/register/healthcare-webinar'
),
(
  'AI Hackathon 2025',
  'hackathon',
  '48-hour hackathon bringing together developers, designers, and AI enthusiasts to build innovative solutions.',
  'San Francisco, USA',
  '2025-05-01',
  '48 hours',
  'Tech Innovation Labs',
  'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=300',
  0.00,
  'free',
  ARRAY['Hackathon', 'AI', 'Innovation', 'Coding'],
  '[
    {"name": "David Martinez", "title": "Senior Developer", "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150"},
    {"name": "Lisa Park", "title": "AI Product Manager", "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150"}
  ]'::jsonb,
  'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=2000',
  'https://example.com/register/hackathon-2025'
),
(
  'Deep Learning Masterclass',
  'training',
  'Comprehensive training program on deep learning architectures, neural networks, and advanced techniques.',
  'London, UK',
  '2025-06-15',
  '5 days',
  'AI Academy',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=300',
  2499.00,
  'paid',
  ARRAY['Deep Learning', 'Neural Networks', 'PyTorch', 'Advanced AI'],
  '[
    {"name": "Prof. Robert Taylor", "title": "AI Professor", "image": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150"},
    {"name": "Dr. Maria Garcia", "title": "Research Scientist", "image": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150"}
  ]'::jsonb,
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=2000',
  'https://example.com/register/deep-learning-masterclass'
),
(
  'AI Networking Meetup',
  'meetup',
  'Monthly networking event for AI professionals, researchers, and enthusiasts to connect and share insights.',
  'Berlin, Germany',
  '2025-03-25',
  '2 hours',
  'AI Community Berlin',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=300',
  0.00,
  'free',
  ARRAY['Networking', 'AI', 'Community'],
  '[]'::jsonb,
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2000',
  'https://example.com/register/berlin-meetup'
)
ON CONFLICT DO NOTHING;

-- Note: For agencies, we need to have profiles first
-- This is a template that shows what agencies would look like
-- In production, you would:
-- 1. Create user accounts through Supabase Auth
-- 2. Create profiles for those users
-- 3. Then create agencies linked to those profiles

-- Example agency data structure (commented out - requires profiles to exist first):
/*
INSERT INTO agencies (id, services_offered, industry_specialties, case_studies, certifications, agency_rating) VALUES
(
  'profile-uuid-here', -- This would be a real profile ID
  ARRAY['AI Development', 'Machine Learning', 'Data Analytics', 'Computer Vision'],
  ARRAY['Healthcare', 'Finance', 'Technology'],
  '[
    {"title": "Healthcare AI Platform", "description": "Built ML platform for patient diagnosis", "url": "https://example.com/case-study-1"},
    {"title": "Financial Fraud Detection", "description": "Developed AI system for fraud prevention", "url": "https://example.com/case-study-2"}
  ]'::jsonb,
  ARRAY['ISO 27001', 'AWS Certified'],
  4.8
);
*/

-- For now, agencies will be created when users register as agencies
-- This seed file focuses on Events which are public and don't require user accounts

