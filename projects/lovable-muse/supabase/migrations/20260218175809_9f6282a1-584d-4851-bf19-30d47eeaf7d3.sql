
-- Frame versions table for historical versioning of storyboard frames
CREATE TABLE public.frame_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  frame_id UUID NOT NULL REFERENCES public.storyboard_frames(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  title TEXT,
  notes TEXT DEFAULT '',
  duration_seconds NUMERIC DEFAULT 3.0,
  status TEXT NOT NULL DEFAULT 'draft',
  asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  audio_url TEXT,
  annotations JSONB DEFAULT '[]'::jsonb,
  ai_tags TEXT[] DEFAULT '{}'::text[],
  ai_description TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  snapshot_reason TEXT DEFAULT 'manual'
);

-- Index for fast lookups
CREATE INDEX idx_frame_versions_frame_id ON public.frame_versions(frame_id);
CREATE INDEX idx_frame_versions_created_at ON public.frame_versions(frame_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.frame_versions ENABLE ROW LEVEL SECURITY;

-- RLS: users can view versions of frames they own (through storyboard ownership)
CREATE POLICY "Users can view frame versions"
ON public.frame_versions
FOR SELECT
USING (
  frame_id IN (
    SELECT sf.id FROM storyboard_frames sf
    JOIN storyboards s ON sf.storyboard_id = s.id
    WHERE s.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can create frame versions"
ON public.frame_versions
FOR INSERT
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete own frame versions"
ON public.frame_versions
FOR DELETE
USING (created_by = auth.uid());

-- Add ai_tags column to storyboard_frames for auto-tagging
ALTER TABLE public.storyboard_frames ADD COLUMN IF NOT EXISTS ai_tags TEXT[] DEFAULT '{}'::text[];
ALTER TABLE public.storyboard_frames ADD COLUMN IF NOT EXISTS ai_description TEXT;
