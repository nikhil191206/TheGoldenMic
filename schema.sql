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
  ADD COLUMN IF NOT EXISTS user_id             UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS booking_type        TEXT,
  ADD COLUMN IF NOT EXISTS amount_paid         INTEGER;

-- 4. Bulk booking plans
CREATE TABLE IF NOT EXISTS bulk_bookings (
  id                  UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             UUID        REFERENCES auth.users(id) NOT NULL,
  booking_type        TEXT        NOT NULL,
  name                TEXT,
  phone               TEXT,
  email               TEXT,
  start_date          DATE        NOT NULL,
  end_date            DATE        NOT NULL,
  total_hours         DECIMAL     DEFAULT 30,
  used_hours          DECIMAL     DEFAULT 0,
  people_count        INTEGER     NOT NULL,
  amount_paid         INTEGER     NOT NULL,
  txn_id              TEXT,
  txn_screenshot_url  TEXT,
  payment_complete    BOOLEAN     DEFAULT FALSE,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Individual slots booked under a bulk plan
CREATE TABLE IF NOT EXISTS bulk_slots (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  bulk_booking_id   UUID        REFERENCES bulk_bookings(id) NOT NULL,
  user_id           UUID        REFERENCES auth.users(id) NOT NULL,
  booking_date      DATE        NOT NULL,
  time_slot         TEXT        NOT NULL,
  duration          TEXT        NOT NULL,
  studio            TEXT        NOT NULL,
  hours_used        DECIMAL     NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Storage bucket for payment screenshots
--    (or create it manually in Supabase → Storage → New bucket → "txn-screenshots" → Public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('txn-screenshots', 'txn-screenshots', true)
ON CONFLICT (id) DO NOTHING;
