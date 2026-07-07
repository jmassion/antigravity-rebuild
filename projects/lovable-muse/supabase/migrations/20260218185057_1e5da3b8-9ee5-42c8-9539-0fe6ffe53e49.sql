
ALTER TABLE public.storyboards ADD COLUMN tags text[] DEFAULT '{}';
ALTER TABLE public.storyboards ADD COLUMN content_type text DEFAULT 'general';
ALTER TABLE public.projects ADD COLUMN tags text[] DEFAULT '{}';
ALTER TABLE public.projects ADD COLUMN content_type text DEFAULT 'general';
