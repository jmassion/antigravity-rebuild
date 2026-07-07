
-- Profiles table for user info
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Projects
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  phase TEXT NOT NULL DEFAULT 'start' CHECK (phase IN ('start', 'build', 'grow')),
  thumbnail_url TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own projects" ON public.projects FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Users can create projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Users can delete own projects" ON public.projects FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- Project members (for shared access)
CREATE TABLE public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer', 'editor', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id)
);
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view memberships" ON public.project_members FOR SELECT TO authenticated USING (user_id = auth.uid() OR project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid()));
CREATE POLICY "Owners can manage members" ON public.project_members FOR ALL TO authenticated USING (project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid()));

-- Assets (files that can exist in multiple places)
CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'image',
  file_size BIGINT DEFAULT 0,
  thumbnail_url TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ai_description TEXT,
  ai_tags TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own assets" ON public.assets FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Users can create assets" ON public.assets FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users can update own assets" ON public.assets FOR UPDATE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Users can delete own assets" ON public.assets FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- Asset-Project junction (asset can be in many projects)
CREATE TABLE public.asset_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  folder_path TEXT DEFAULT '/',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(asset_id, project_id, folder_path)
);
ALTER TABLE public.asset_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own asset-projects" ON public.asset_projects FOR SELECT TO authenticated USING (asset_id IN (SELECT id FROM public.assets WHERE owner_id = auth.uid()));
CREATE POLICY "Users can manage asset-projects" ON public.asset_projects FOR ALL TO authenticated USING (asset_id IN (SELECT id FROM public.assets WHERE owner_id = auth.uid()));

-- Asset versions
CREATE TABLE public.asset_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  version_number INT NOT NULL DEFAULT 1,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  notes TEXT DEFAULT '',
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.asset_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view versions of own assets" ON public.asset_versions FOR SELECT TO authenticated USING (asset_id IN (SELECT id FROM public.assets WHERE owner_id = auth.uid()));
CREATE POLICY "Users can create versions" ON public.asset_versions FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

-- Storyboards
CREATE TABLE public.storyboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.storyboards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own storyboards" ON public.storyboards FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Users can create storyboards" ON public.storyboards FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users can update own storyboards" ON public.storyboards FOR UPDATE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Users can delete own storyboards" ON public.storyboards FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- Storyboard frames (a frame references an asset, same asset can be in multiple storyboards)
CREATE TABLE public.storyboard_frames (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storyboard_id UUID NOT NULL REFERENCES public.storyboards(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  sort_order INT NOT NULL DEFAULT 0,
  title TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  duration_seconds NUMERIC(8,2) DEFAULT 3.0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'revision')),
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  audio_url TEXT,
  annotations JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.storyboard_frames ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view frames of own storyboards" ON public.storyboard_frames FOR SELECT TO authenticated USING (storyboard_id IN (SELECT id FROM public.storyboards WHERE owner_id = auth.uid()));
CREATE POLICY "Users can manage frames" ON public.storyboard_frames FOR ALL TO authenticated USING (storyboard_id IN (SELECT id FROM public.storyboards WHERE owner_id = auth.uid()));

-- Tasks (assignable to frames or assets)
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  frame_id UUID REFERENCES public.storyboard_frames(id) ON DELETE SET NULL,
  asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  due_date TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own tasks" ON public.tasks FOR SELECT TO authenticated USING (created_by = auth.uid() OR assignee_id = auth.uid());
CREATE POLICY "Users can create tasks" ON public.tasks FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can update relevant tasks" ON public.tasks FOR UPDATE TO authenticated USING (created_by = auth.uid() OR assignee_id = auth.uid());
CREATE POLICY "Users can delete own tasks" ON public.tasks FOR DELETE TO authenticated USING (created_by = auth.uid());

-- Timestamp update trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON public.assets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_storyboards_updated_at BEFORE UPDATE ON public.storyboards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_storyboard_frames_updated_at BEFORE UPDATE ON public.storyboard_frames FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage bucket for assets
INSERT INTO storage.buckets (id, name, public) VALUES ('assets', 'assets', true);

CREATE POLICY "Authenticated users can upload assets" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Anyone can view assets" ON storage.objects FOR SELECT USING (bucket_id = 'assets');
CREATE POLICY "Users can update own assets" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own assets" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]);
