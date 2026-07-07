
-- Role audit log to track all role changes
CREATE TABLE public.role_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_user_id UUID NOT NULL,
  changed_by UUID NOT NULL,
  previous_role TEXT,
  new_role TEXT NOT NULL,
  action TEXT NOT NULL DEFAULT 'assign', -- assign, revoke, invite, bulk_invite
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.role_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins/super_admins can view audit logs
CREATE POLICY "Admins can view audit logs"
ON public.role_audit_log
FOR SELECT
USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin'));

-- Only admins/super_admins can create audit logs
CREATE POLICY "Admins can create audit logs"
ON public.role_audit_log
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin'));
