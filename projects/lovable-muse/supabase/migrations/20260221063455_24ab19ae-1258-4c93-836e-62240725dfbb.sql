
-- Canvas layouts table for persisting user arrangements
CREATE TABLE public.canvas_layouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'Default',
  layout JSONB NOT NULL DEFAULT '{}',
  viewport JSONB NOT NULL DEFAULT '{"x":0,"y":0,"zoom":1}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.canvas_layouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own canvas layouts"
ON public.canvas_layouts FOR SELECT
USING (owner_id = auth.uid());

CREATE POLICY "Users can create canvas layouts"
ON public.canvas_layouts FOR INSERT
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own canvas layouts"
ON public.canvas_layouts FOR UPDATE
USING (owner_id = auth.uid());

CREATE POLICY "Users can delete own canvas layouts"
ON public.canvas_layouts FOR DELETE
USING (owner_id = auth.uid());

CREATE TRIGGER update_canvas_layouts_updated_at
BEFORE UPDATE ON public.canvas_layouts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
