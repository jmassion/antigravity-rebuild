
-- Style guide entries: each row is one option within a category
CREATE TABLE public.style_guide_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'general',
  label TEXT NOT NULL DEFAULT '',
  value TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  tags TEXT[] DEFAULT '{}'::text[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.style_guide_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own style guide entries"
  ON public.style_guide_entries FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "Users can create style guide entries"
  ON public.style_guide_entries FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own style guide entries"
  ON public.style_guide_entries FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Users can delete own style guide entries"
  ON public.style_guide_entries FOR DELETE
  USING (owner_id = auth.uid());

-- Auto-update timestamp
CREATE TRIGGER update_style_guide_entries_updated_at
  BEFORE UPDATE ON public.style_guide_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
