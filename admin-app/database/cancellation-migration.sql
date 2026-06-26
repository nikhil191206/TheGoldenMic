-- Run in Supabase → SQL Editor

-- 1. Allow 'cancelled' as a payment_status value
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_payment_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_payment_status_check
  CHECK (payment_status IN ('pending', 'confirmed', 'rejected', 'cancelled'));

-- 2. Cancellation tracking columns
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS cancelled_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS refund_percentage INTEGER,
  ADD COLUMN IF NOT EXISTS refund_amount     INTEGER;

-- 3. Allow customers to update (cancel) their own bookings
DROP POLICY IF EXISTS "Allow customer to cancel own booking" ON bookings;
CREATE POLICY "Allow customer to cancel own booking" ON bookings
  FOR UPDATE USING (auth.uid() = user_id);
