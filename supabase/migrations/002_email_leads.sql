-- ============================================================
-- Dreams & Omens — Phase 2: Email leads table
-- Run in the Supabase SQL Editor or via supabase db push
-- ============================================================

CREATE TABLE IF NOT EXISTS public.email_leads (
  email      TEXT        PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- No RLS needed — inserts happen via service role key from the API route.
-- The table is not accessible to anon/authenticated roles by default.
