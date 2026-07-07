
CREATE TABLE public.upload_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  asset_id uuid NULL REFERENCES public.assets(id) ON DELETE SET NULL,
  file_name text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  file_type text NOT NULL DEFAULT 'document',
  source text NOT NULL DEFAULT 'local',
  status text NOT NULL DEFAULT 'uploading',
  error_message text NULL,
  project_id uuid NULL REFERENCES public.projects(id) ON DELETE SET NULL,
  folder_path text DEFAULT '/',
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.upload_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own upload logs" ON public.upload_logs FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "Users can create upload logs" ON public.upload_logs FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users can update own upload logs" ON public.upload_logs FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Users can delete own upload logs" ON public.upload_logs FOR DELETE USING (owner_id = auth.uid());

CREATE INDEX idx_upload_logs_owner ON public.upload_logs(owner_id, started_at DESC);
