
CREATE TABLE public.graph_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.graph_presets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own presets" ON public.graph_presets
  FOR ALL USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
