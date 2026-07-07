
-- 1. Characters table
CREATE TABLE public.characters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text DEFAULT '',
  role text DEFAULT '',
  status text DEFAULT 'concept',
  avatar_url text,
  tags text[] DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own characters" ON public.characters FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "Users can create characters" ON public.characters FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users can update own characters" ON public.characters FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Users can delete own characters" ON public.characters FOR DELETE USING (owner_id = auth.uid());

CREATE TRIGGER update_characters_updated_at BEFORE UPDATE ON public.characters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Custom field definitions
CREATE TABLE public.custom_field_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  entity_type text NOT NULL,
  scope text DEFAULT 'global',
  scope_id uuid,
  field_name text NOT NULL,
  field_label text NOT NULL,
  field_type text DEFAULT 'text',
  options jsonb DEFAULT '[]',
  default_value text,
  sort_order integer DEFAULT 0,
  is_required boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.custom_field_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own field defs" ON public.custom_field_definitions FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "Users can create field defs" ON public.custom_field_definitions FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users can update own field defs" ON public.custom_field_definitions FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Users can delete own field defs" ON public.custom_field_definitions FOR DELETE USING (owner_id = auth.uid());

CREATE TRIGGER update_custom_field_definitions_updated_at BEFORE UPDATE ON public.custom_field_definitions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Custom field values
CREATE TABLE public.custom_field_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  field_id uuid NOT NULL REFERENCES public.custom_field_definitions(id) ON DELETE CASCADE,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  value text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(field_id, entity_id)
);

ALTER TABLE public.custom_field_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own field values" ON public.custom_field_values FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "Users can create field values" ON public.custom_field_values FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users can update own field values" ON public.custom_field_values FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Users can delete own field values" ON public.custom_field_values FOR DELETE USING (owner_id = auth.uid());

CREATE TRIGGER update_custom_field_values_updated_at BEFORE UPDATE ON public.custom_field_values
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Character assets junction
CREATE TABLE public.character_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id uuid NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  label text DEFAULT '',
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(character_id, asset_id)
);

ALTER TABLE public.character_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own character assets" ON public.character_assets FOR SELECT
  USING (character_id IN (SELECT id FROM public.characters WHERE owner_id = auth.uid()));
CREATE POLICY "Users can manage own character assets" ON public.character_assets FOR ALL
  USING (character_id IN (SELECT id FROM public.characters WHERE owner_id = auth.uid()));
