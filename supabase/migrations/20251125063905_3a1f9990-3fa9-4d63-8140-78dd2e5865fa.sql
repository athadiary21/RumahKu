-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule keep-alive ping every 2 days at 12:00 PM
-- This will prevent Supabase from pausing the database due to inactivity
SELECT cron.schedule(
  'keep-alive-ping',
  '0 12 */2 * *',
  $$
  SELECT
    net.http_post(
        url:='https://npefzvebmnzipfgdwhca.supabase.co/functions/v1/keep-alive',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wZWZ6dmVibW56aXBmZ2R3aGNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNDI1NjEsImV4cCI6MjA3NzcxODU2MX0.g3bcVn13JlZy3K3p4G7bbmE3QU3A6LwEHNDSW1ZswAA"}'::jsonb,
        body:='{"source": "cron"}'::jsonb
    ) as request_id;
  $$
);