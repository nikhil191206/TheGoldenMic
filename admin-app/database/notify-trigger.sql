-- Enable pg_net extension (allows HTTP calls from Postgres)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Trigger function: calls notify-new-booking edge function on every new booking
CREATE OR REPLACE FUNCTION notify_new_booking()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://jsxnnxscqfbxzirjhmlx.supabase.co/functions/v1/notify-new-booking',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzeG5ueHNjcWZieHppcmpobWx4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDMxMjk5OCwiZXhwIjoyMDk1ODg4OTk4fQ.CGwQzgaOTJuwSXNv-ohjFywXsPfIPdkoDGDw8q00FK4'
    ),
    body := jsonb_build_object('record', row_to_json(NEW))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to bookings table
DROP TRIGGER IF EXISTS on_new_booking ON bookings;
CREATE TRIGGER on_new_booking
  AFTER INSERT ON bookings
  FOR EACH ROW EXECUTE FUNCTION notify_new_booking();
