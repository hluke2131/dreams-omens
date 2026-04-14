-- ============================================================
-- Dreams & Omens — Phase 4 Migration
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Add insight column to symbols table for caching AI-generated pattern insights.
-- Generated once per symbol, stored so we don't re-call OpenAI on every page load.
ALTER TABLE public.symbols
  ADD COLUMN IF NOT EXISTS insight TEXT;
