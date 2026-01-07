# Seed Script Instructions

## Prerequisites

**IMPORTANT:** You must run the migration file BEFORE running the seed script!

## Step-by-Step Setup

### Step 1: Run the Migration

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Open the file: `supabase/migrations/20260107090000_complete_schema.sql`
4. Copy the **entire contents** of the file
5. Paste into the SQL Editor
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. Wait for it to complete successfully

This creates all the tables, indexes, RLS policies, and triggers.

### Step 2: Run the Seed Script

1. Still in the SQL Editor
2. Open the file: `supabase/seed_complete.sql`
3. Copy the **entire contents** of the file
4. Paste into the SQL Editor
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. Wait for it to complete successfully

This populates the database with demo data.

## Verification

After running both scripts, you should be able to:

1. Query agencies:
   ```sql
   SELECT * FROM agencies;
   ```

2. Query events:
   ```sql
   SELECT * FROM events WHERE status = 'published';
   ```

3. Query lookup tables:
   ```sql
   SELECT * FROM services;
   SELECT * FROM industries;
   ```

## Troubleshooting

### Error: "Table does not exist"
- **Solution:** Run the migration file first (Step 1)

### Error: "Relation already exists"
- **Solution:** The migration has already been run. You can skip Step 1 and go directly to Step 2

### Error: "Duplicate key value"
- **Solution:** The seed script is idempotent and safe to rerun. If you see this, it means the data already exists, which is fine.

## Using Supabase CLI (Alternative)

If you're using the Supabase CLI:

```bash
# Run migrations
supabase db push

# Or run seed directly (if configured)
supabase db seed
```

