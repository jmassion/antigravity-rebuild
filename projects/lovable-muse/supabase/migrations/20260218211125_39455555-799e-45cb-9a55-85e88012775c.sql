
-- Junction table for linking storyboards to multiple projects
CREATE TABLE public.storyboard_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  storyboard_id UUID NOT NULL REFERENCES public.storyboards(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(storyboard_id, project_id)
);

-- Enable RLS
ALTER TABLE public.storyboard_projects ENABLE ROW LEVEL SECURITY;

-- Users can view storyboard-project links for their own storyboards
CREATE POLICY "Users can view own storyboard-projects"
ON public.storyboard_projects
FOR SELECT
USING (storyboard_id IN (SELECT id FROM storyboards WHERE owner_id = auth.uid()));

-- Users can manage storyboard-project links for their own storyboards
CREATE POLICY "Users can manage own storyboard-projects"
ON public.storyboard_projects
FOR ALL
USING (storyboard_id IN (SELECT id FROM storyboards WHERE owner_id = auth.uid()));
