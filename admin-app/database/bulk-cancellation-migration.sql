-- Run in Supabase → SQL Editor

ALTER TABLE bulk_bookings
  ADD COLUMN IF NOT EXISTS cancelled_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS refund_percentage INTEGER,
  ADD COLUMN IF NOT EXISTS refund_amount     INTEGER;

ALTER TABLE bulk_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow customer to read own bulk booking" ON bulk_bookings;
CREATE POLICY "Allow customer to read own bulk booking" ON bulk_bookings
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow customer to cancel own bulk booking" ON bulk_bookings;
CREATE POLICY "Allow customer to cancel own bulk booking" ON bulk_bookings
  FOR UPDATE USING (auth.uid() = user_id);
