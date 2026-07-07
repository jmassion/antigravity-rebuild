-- Enable realtime for upload_logs so progress is visible across tabs/sessions
ALTER PUBLICATION supabase_realtime ADD TABLE public.upload_logs;

-- Add a progress column to upload_logs for granular tracking
ALTER TABLE public.upload_logs ADD COLUMN IF NOT EXISTS progress smallint NOT NULL DEFAULT 0;