# Supabase Backend Setup Guide

This guide explains how to set up the Supabase backend for the AI Agency Marketplace.

## Prerequisites

1. A Supabase project (create one at [supabase.com](https://supabase.com))
2. Supabase CLI installed (optional, for local development)
3. Environment variables configured in your `.env` file:
   ```
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

## Database Setup

### 1. Run Migrations

The migrations are located in `supabase/migrations/`. They should be run in order:

1. **20250223105605_snowy_garden.sql** - Initial schema (profiles, agencies, projects, quotes, reviews, messages, notifications)
2. **20250223121048_blue_coral.sql** - People listing schema
3. **20260107085547_events_jobs_schema.sql** - Events and Jobs tables with updated RLS policies

#### Using Supabase Dashboard:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run each migration file in order
4. Verify tables are created in the Table Editor

#### Using Supabase CLI:

```bash
# Link your project (if not already linked)
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### 2. Seed Initial Data

Run the seed script to populate Events (and optionally Agencies):

#### Using Supabase Dashboard:

1. Go to SQL Editor
2. Copy and paste the contents of `supabase/seed.sql`
3. Execute the script

#### Using Supabase CLI:

```bash
supabase db reset  # This will run all migrations and seed data
```

**Note:** The seed script currently only seeds Events data, as Agencies require user profiles to be created first through the authentication system.

## Row Level Security (RLS) Policies

The following RLS policies are configured:

### Public Read Access:
- **Agencies**: Anyone can view agency profiles
- **Events**: Anyone can view all events

### Authenticated Access:
- **Projects**: 
  - Users can create projects (auth required)
  - Users can only view their own projects
- **Jobs**:
  - Users can create jobs (auth required)
  - Users can only view their own jobs
  - Users can update their own jobs

## Testing the Setup

### 1. Test Public Read Access

```javascript
// In your browser console or a test script
import { supabase } from './lib/supabase';

// Should work without authentication
const { data: events } = await supabase.from('events').select('*');
console.log('Events:', events);

const { data: agencies } = await supabase.from('agencies').select('*');
console.log('Agencies:', agencies);
```

### 2. Test Authenticated Access

```javascript
// Sign in first
const { data: { user } } = await supabase.auth.signInWithPassword({
  email: 'your-email@example.com',
  password: 'your-password'
});

// Create a project (should work)
const { data: project, error } = await supabase
  .from('projects')
  .insert([{
    business_id: user.id,
    title: 'Test Project',
    description: 'Test description',
    required_services: ['AI Development'],
    industry: 'Technology',
    budget_range: { min: 10000, max: 25000, currency: 'USD' },
    timing: 'short-term',
    status: 'open'
  }]);

// View own projects (should work)
const { data: myProjects } = await supabase
  .from('projects')
  .select('*')
  .eq('business_id', user.id);
```

## Creating Test Agencies

Since agencies require user profiles, you'll need to:

1. Create user accounts through Supabase Auth (sign up)
2. Create profiles for those users
3. Create agencies linked to those profiles

Example:

```sql
-- After creating a user through auth, create their profile
INSERT INTO profiles (id, first_name, last_name, email, role, company_name, location)
VALUES (
  'user-uuid-from-auth',
  'John',
  'Doe',
  'john@agency.com',
  'agency',
  'AI Solutions Pro',
  'San Francisco, USA'
);

-- Then create the agency
INSERT INTO agencies (id, services_offered, industry_specialties, agency_rating)
VALUES (
  'user-uuid-from-auth',
  ARRAY['AI Development', 'Machine Learning', 'Data Analytics'],
  ARRAY['Healthcare', 'Finance', 'Technology'],
  4.8
);
```

## Troubleshooting

### RLS Policy Errors

If you get "permission denied" errors:
1. Check that RLS is enabled on the table
2. Verify the policy conditions match your use case
3. Ensure you're authenticated when required

### Foreign Key Errors

If you get foreign key constraint errors:
1. Ensure parent records exist (e.g., profiles before agencies)
2. Check that IDs match between related tables
3. Verify the foreign key relationships in the schema

### Migration Order

Always run migrations in chronological order (by filename timestamp).

## Next Steps

- Set up authentication flows in your frontend
- Create user registration that automatically creates profiles
- Implement agency onboarding flow
- Add more seed data as needed

