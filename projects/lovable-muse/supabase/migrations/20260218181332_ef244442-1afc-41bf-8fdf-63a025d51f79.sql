
-- 1. App role enum
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'manager', 'member', 'viewer');

-- 2. User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Security definer function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- 4. RLS for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));

-- 5. Team members table
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  member_type TEXT NOT NULL DEFAULT 'placeholder' CHECK (member_type IN ('human', 'ai', 'placeholder')),
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('super_admin', 'admin', 'manager', 'member', 'viewer')),
  title TEXT,
  bio TEXT,
  primary_project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  claimed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- 6. Project team members junction (created BEFORE team_members RLS that references it)
CREATE TABLE public.project_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  team_member_id UUID NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'manager', 'member', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (project_id, team_member_id)
);
ALTER TABLE public.project_team_members ENABLE ROW LEVEL SECURITY;

-- 7. RLS for team_members (now project_team_members exists)
CREATE POLICY "Owners can manage own team members" ON public.team_members FOR ALL TO authenticated
  USING (owner_id = auth.uid());
CREATE POLICY "Users can view team members via projects" ON public.team_members FOR SELECT TO authenticated
  USING (
    owner_id = auth.uid()
    OR id IN (SELECT ptm.team_member_id FROM public.project_team_members ptm JOIN public.projects p ON p.id = ptm.project_id WHERE p.owner_id = auth.uid())
    OR public.has_role(auth.uid(), 'super_admin')
    OR public.has_role(auth.uid(), 'admin')
  );

-- 8. RLS for project_team_members
CREATE POLICY "Project owners can manage project members" ON public.project_team_members FOR ALL TO authenticated
  USING (project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid()));
CREATE POLICY "Users can view project memberships" ON public.project_team_members FOR SELECT TO authenticated
  USING (project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid()) OR public.has_role(auth.uid(), 'super_admin'));

-- 9. FK from tasks and frames to team_members
ALTER TABLE public.tasks ADD CONSTRAINT tasks_assignee_team_member_fkey FOREIGN KEY (assignee_id) REFERENCES public.team_members(id) ON DELETE SET NULL;
ALTER TABLE public.storyboard_frames ADD CONSTRAINT storyboard_frames_assignee_team_member_fkey FOREIGN KEY (assignee_id) REFERENCES public.team_members(id) ON DELETE SET NULL;

-- 10. Triggers
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON public.team_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 11. Update handle_new_user to also create team_member + auto super_admin for first user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE _is_first BOOLEAN;
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  INSERT INTO public.team_members (owner_id, user_id, display_name, member_type, role)
  VALUES (NEW.id, NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email), 'human', 'member');
  SELECT NOT EXISTS (SELECT 1 FROM public.user_roles LIMIT 1) INTO _is_first;
  IF _is_first THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'super_admin');
  END IF;
  RETURN NEW;
END;
$$;
