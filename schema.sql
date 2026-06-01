-- Run this in the Supabase SQL Editor to create the bookings table
-- Project: The Golden Mic

CREATE TABLE IF NOT EXISTS bookings (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name            TEXT        NOT NULL,
  gender          TEXT        NOT NULL,
  age             INTEGER     NOT NULL,
  singer_idol     TEXT,
  booking_date    DATE        NOT NULL,
  time_slot       TEXT        NOT NULL,
  duration        TEXT        NOT NULL,
  studio          TEXT        NOT NULL,
  payment_complete BOOLEAN    DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
