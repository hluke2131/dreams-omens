-- ============================================================
-- Dreams & Omens — Initial Schema
-- Run this in the Supabase SQL Editor (or via supabase db push)
-- ============================================================

-- ── profiles ────────────────────────────────────────────────
-- One row per auth user.  Created via trigger on auth.users.

CREATE TABLE IF NOT EXISTS public.profiles (
  id                           UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                        TEXT,
  subscription_tier            TEXT        NOT NULL DEFAULT 'free'
                                           CHECK (subscription_tier IN ('free', 'basic', 'reflect_plus')),
  stripe_customer_id           TEXT,
  stripe_subscription_id       TEXT,
  subscription_status          TEXT        NOT NULL DEFAULT 'inactive'
                                           CHECK (subscription_status IN ('active', 'inactive', 'past_due', 'canceled')),
  subscription_period_end      TIMESTAMPTZ,
  -- Monthly usage counter (server-side gate for authenticated users)
  monthly_interpretation_count INTEGER     NOT NULL DEFAULT 0,
  monthly_count_reset_date     DATE        NOT NULL DEFAULT CURRENT_DATE,
  created_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();


-- ── user_settings ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id         UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  concise_answers BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();


-- ── interpretations ──────────────────────────────────────────
-- Cloud-saved interpretations for Reflect+ subscribers only.

CREATE TABLE IF NOT EXISTS public.interpretations (
  id         TEXT        PRIMARY KEY,   -- Date.now() or "{ts}_{lens}"
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type       TEXT        NOT NULL CHECK (type IN ('dream', 'omen')),
  input      TEXT        NOT NULL,
  tags       TEXT[]      NOT NULL DEFAULT '{}',
  lens       TEXT        NOT NULL DEFAULT 'none'
                         CHECK (lens IN ('none', 'archetypal', 'cognitive', 'cultural')),
  result     TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS interpretations_user_id_idx
  ON public.interpretations (user_id, created_at DESC);


-- ── symbols ──────────────────────────────────────────────────
-- Extracted symbols per user; count incremented each time a symbol recurs.

CREATE TABLE IF NOT EXISTS public.symbols (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name               TEXT        NOT NULL,
  count              INTEGER     NOT NULL DEFAULT 1,
  last_seen_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  interpretation_ids TEXT[]      NOT NULL DEFAULT '{}',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT symbols_user_name_unique UNIQUE (user_id, name)
);

CREATE INDEX IF NOT EXISTS symbols_user_id_count_idx
  ON public.symbols (user_id, count DESC);


-- ── increment_monthly_usage ─────────────────────────────────
-- Called from /api/interpret after a successful interpretation.
-- Increments the counter, resetting it if we've rolled into a new month.

CREATE OR REPLACE FUNCTION public.increment_monthly_usage(uid UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.profiles
  SET
    monthly_interpretation_count = CASE
      WHEN monthly_count_reset_date < DATE_TRUNC('month', CURRENT_DATE)
      THEN 1
      ELSE monthly_interpretation_count + 1
    END,
    monthly_count_reset_date = CASE
      WHEN monthly_count_reset_date < DATE_TRUNC('month', CURRENT_DATE)
      THEN CURRENT_DATE
      ELSE monthly_count_reset_date
    END
  WHERE id = uid;
END;
$$;


-- ── Row Level Security ───────────────────────────────────────

ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interpretations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symbols          ENABLE ROW LEVEL SECURITY;

-- profiles: users can only read/update their own row
CREATE POLICY "profiles: own row" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- user_settings: own row only
CREATE POLICY "user_settings: own row" ON public.user_settings
  FOR ALL USING (auth.uid() = user_id);

-- interpretations: own rows only
CREATE POLICY "interpretations: own rows" ON public.interpretations
  FOR ALL USING (auth.uid() = user_id);

-- symbols: own rows only
CREATE POLICY "symbols: own rows" ON public.symbols
  FOR ALL USING (auth.uid() = user_id);
