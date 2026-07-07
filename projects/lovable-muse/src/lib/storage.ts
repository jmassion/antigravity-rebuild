import { supabase } from '@/integrations/supabase/client';

export async function uploadAssetFile(
  file: File,
  userId: string,
  onProgress?: (progress: number) => void
): Promise<{ url: string; thumbnailUrl: string | null }> {
  const ext = file.name.split('.').pop() || 'bin';
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from('assets')
    .upload(path, file, { upsert: false });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('assets')
    .getPublicUrl(path);

  // For images, the file URL itself serves as thumbnail
  const thumbnailUrl = file.type.startsWith('image/') ? publicUrl : null;

  return { url: publicUrl, thumbnailUrl };
}

export async function createAssetRecord(params: {
  name: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  thumbnailUrl: string | null;
  ownerId: string;
  projectId?: string;
  tags?: string[];
}) {
  const { data, error } = await supabase
    .from('assets')
    .insert({
      name: params.name,
      file_url: params.fileUrl,
      file_type: params.fileType,
      file_size: params.fileSize,
      thumbnail_url: params.thumbnailUrl,
      owner_id: params.ownerId,
      tags: params.tags || [],
    })
    .select()
    .single();

  if (error) throw error;

  // Link to project if provided
  if (params.projectId && data) {
    await supabase.from('asset_projects').insert({
      asset_id: data.id,
      project_id: params.projectId,
    });
  }

  return data;
}

export async function analyzeAssetWithAI(imageUrl: string, fileName: string) {
  const { data, error } = await supabase.functions.invoke('analyze-asset', {
    body: { imageUrl, fileName },
  });

  if (error) throw error;
  return data as {
    description: string;
    asset_type: string;
    tags: string[];
    colors?: string[];
    mood?: string;
  };
}
