-- ══════════════════════════════════════════════
--  The Golden Mic — Supabase Schema
--  Run this in the Supabase SQL Editor
-- ══════════════════════════════════════════════

-- 1. Create bookings table (fresh setup)
CREATE TABLE IF NOT EXISTS bookings (
  id                  UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name                TEXT        NOT NULL,
  gender              TEXT        NOT NULL,
  age                 INTEGER     NOT NULL,
  phone               TEXT,
  email               TEXT,
  people_count        INTEGER,
  singer_idol         TEXT,
  booking_date        DATE        NOT NULL,
  time_slot           TEXT        NOT NULL,
  duration            TEXT        NOT NULL,
  studio              TEXT        NOT NULL,
  txn_id              TEXT,
  txn_screenshot_url  TEXT,
  payment_complete    BOOLEAN     DEFAULT FALSE,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 2. If table already exists, add new columns
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS phone               TEXT,
  ADD COLUMN IF NOT EXISTS email               TEXT,
  ADD COLUMN IF NOT EXISTS people_count        INTEGER,
  ADD COLUMN IF NOT EXISTS txn_id              TEXT,
  ADD COLUMN IF NOT EXISTS txn_screenshot_url  TEXT,
  ADD COLUMN IF NOT EXISTS user_id             UUID REFERENCES auth.users(id);

-- 3. Storage bucket for payment screenshots
--    (or create it manually in Supabase → Storage → New bucket → "txn-screenshots" → Public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('txn-screenshots', 'txn-screenshots', true)
ON CONFLICT (id) DO NOTHING;
