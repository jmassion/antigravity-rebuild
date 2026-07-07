
CREATE TABLE public.docs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  category text NOT NULL DEFAULT 'general',
  title text NOT NULL,
  slug text NOT NULL,
  content text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  tags text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(owner_id, slug)
);

ALTER TABLE public.docs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own docs" ON public.docs FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "Users can create docs" ON public.docs FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users can update own docs" ON public.docs FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Users can delete own docs" ON public.docs FOR DELETE USING (owner_id = auth.uid());

CREATE INDEX idx_docs_owner_category ON public.docs(owner_id, category);
CREATE INDEX idx_docs_slug ON public.docs(owner_id, slug);

CREATE TRIGGER update_docs_updated_at
  BEFORE UPDATE ON public.docs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
