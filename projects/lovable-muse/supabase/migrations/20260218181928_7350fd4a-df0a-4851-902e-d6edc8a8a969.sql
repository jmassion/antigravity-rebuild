
-- Create links table for external references and tools
CREATE TABLE public.links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL,
  project_id UUID NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT NULL DEFAULT '',
  tool_name TEXT NULL,
  tool_icon_url TEXT NULL,
  tags TEXT[] DEFAULT '{}',
  category TEXT NOT NULL DEFAULT 'general',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own links"
  ON public.links FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "Users can create links"
  ON public.links FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own links"
  ON public.links FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Users can delete own links"
  ON public.links FOR DELETE
  USING (owner_id = auth.uid());

-- Updated_at trigger
CREATE TRIGGER update_links_updated_at
  BEFORE UPDATE ON public.links
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
