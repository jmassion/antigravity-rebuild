
-- Plans table: structured creative plans between prompts and deliverables
CREATE TABLE public.plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL,
  title TEXT NOT NULL,
  brief TEXT DEFAULT '',
  goals TEXT[] DEFAULT '{}',
  deliverables TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft',
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  content_type TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own plans" ON public.plans FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "Users can create plans" ON public.plans FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users can update own plans" ON public.plans FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Users can delete own plans" ON public.plans FOR DELETE USING (owner_id = auth.uid());

CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON public.plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Provenance edges: directed relationships between any two entities
-- source_type/target_type: 'prompt','plan','asset','storyboard','project','doc','link','task'
CREATE TABLE public.provenance_edges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL,
  source_type TEXT NOT NULL,
  source_id UUID NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  relationship TEXT NOT NULL DEFAULT 'derived_from',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.provenance_edges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own provenance" ON public.provenance_edges FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "Users can create provenance" ON public.provenance_edges FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users can delete own provenance" ON public.provenance_edges FOR DELETE USING (owner_id = auth.uid());
