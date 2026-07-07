
-- Security definer function to check project-scoped access
-- Levels: owner > admin > editor > viewer
CREATE OR REPLACE FUNCTION public.has_project_access(
  _user_id UUID,
  _project_id UUID,
  _min_role TEXT DEFAULT 'viewer'
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- Project owner always has full access
    SELECT 1 FROM public.projects
    WHERE id = _project_id AND owner_id = _user_id
  )
  OR EXISTS (
    -- Check project_team_members via team_members.user_id
    SELECT 1
    FROM public.project_team_members ptm
    JOIN public.team_members tm ON tm.id = ptm.team_member_id
    WHERE ptm.project_id = _project_id
      AND tm.user_id = _user_id
      AND (
        CASE _min_role
          WHEN 'viewer' THEN ptm.role IN ('viewer','editor','admin','owner')
          WHEN 'editor' THEN ptm.role IN ('editor','admin','owner')
          WHEN 'admin'  THEN ptm.role IN ('admin','owner')
          WHEN 'owner'  THEN ptm.role = 'owner'
          ELSE FALSE
        END
      )
  )
  OR public.has_role(_user_id, 'super_admin')
$$;
