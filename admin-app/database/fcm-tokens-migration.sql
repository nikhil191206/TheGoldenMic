-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS admin_fcm_tokens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_email text NOT NULL,
  token text NOT NULL UNIQUE,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admin_fcm_tokens ENABLE ROW LEVEL SECURITY;

-- Drop old broken policy if it exists
DROP POLICY IF EXISTS "service_role_only" ON admin_fcm_tokens;

-- Allow logged-in admin users to save their own FCM token
CREATE POLICY "admins can upsert own token" ON admin_fcm_tokens
  FOR ALL
  USING (auth.email() = admin_email)
  WITH CHECK (auth.email() = admin_email);
