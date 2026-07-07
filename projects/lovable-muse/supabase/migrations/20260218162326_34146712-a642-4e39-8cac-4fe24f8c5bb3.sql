
-- Add AI metadata columns to asset_versions
ALTER TABLE public.asset_versions
ADD COLUMN IF NOT EXISTS ai_description text,
ADD COLUMN IF NOT EXISTS ai_tags text[] DEFAULT '{}'::text[];

-- Add delete policy for versions (owner of the parent asset)
CREATE POLICY "Users can delete versions of own assets"
ON public.asset_versions
FOR DELETE
USING (asset_id IN (SELECT assets.id FROM assets WHERE assets.owner_id = auth.uid()));

-- Add update policy for versions
CREATE POLICY "Users can update versions of own assets"
ON public.asset_versions
FOR UPDATE
USING (asset_id IN (SELECT assets.id FROM assets WHERE assets.owner_id = auth.uid()));
