import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Loader2, GitCompare, Clock, Tag, MessageSquare, Trash2, RotateCcw } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Props {
  assetId: string;
  assetFileUrl: string;
  onOpenDiff: (versionA: any, versionB: any) => void;
}

export default function VersionHistory({ assetId, assetFileUrl, onOpenDiff }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [notes, setNotes] = useState('');

  const { data: versions = [], isLoading } = useQuery({
    queryKey: ['asset-versions', assetId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('asset_versions')
        .select('*')
        .eq('asset_id', assetId)
        .order('version_number', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (versionId: string) => {
      const { error } = await supabase.from('asset_versions').delete().eq('id', versionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-versions', assetId] });
      toast({ title: 'Version deleted' });
    },
  });

  const onDrop = useCallback(async (files: File[]) => {
    if (!user || files.length === 0) return;
    const file = files[0];
    setUploading(true);

    try {
      const ext = file.name.split('.').pop() || 'bin';
      const storagePath = `${user.id}/${crypto.randomUUID()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from('assets')
        .upload(storagePath, file, { upsert: false });
      if (upErr) throw upErr;

      const { data: { publicUrl } } = supabase.storage.from('assets').getPublicUrl(storagePath);
      const thumbnailUrl = file.type.startsWith('image/') ? publicUrl : null;

      const nextVersion = (versions[0]?.version_number ?? 0) + 1;

      const { data: version, error: dbErr } = await supabase
        .from('asset_versions')
        .insert({
          asset_id: assetId,
          version_number: nextVersion,
          file_url: publicUrl,
          thumbnail_url: thumbnailUrl,
          created_by: user.id,
          notes: notes.trim() || null,
        })
        .select()
        .single();
      if (dbErr) throw dbErr;

      // Update the parent asset to point to the latest version
      await supabase.from('assets').update({
        file_url: publicUrl,
        thumbnail_url: thumbnailUrl,
        updated_at: new Date().toISOString(),
      }).eq('id', assetId);

      // Trigger AI analysis for images
      if (file.type.startsWith('image/') && publicUrl && version) {
        supabase.functions.invoke('analyze-asset', {
          body: { imageUrl: publicUrl, fileName: file.name },
        }).then(({ data }) => {
          if (data) {
            supabase.from('asset_versions').update({
              ai_description: data.description,
              ai_tags: data.tags,
            }).eq('id', version.id);
            // Also update the parent asset
            supabase.from('assets').update({
              ai_description: data.description,
              ai_tags: data.tags,
              tags: data.tags,
            }).eq('id', assetId);
          }
        }).catch(console.error);
      }

      queryClient.invalidateQueries({ queryKey: ['asset-versions', assetId] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      setNotes('');
      toast({ title: `Version ${nextVersion} uploaded` });
    } catch (e) {
      toast({ title: 'Upload failed', description: e instanceof Error ? e.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  }, [user, assetId, versions, notes, queryClient, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    disabled: uploading,
  });

  // Create a "v0" entry from the original asset for comparison
  const originalVersion = {
    id: 'original',
    version_number: 0,
    file_url: assetFileUrl,
    thumbnail_url: assetFileUrl,
    notes: 'Original upload',
    ai_tags: null,
    ai_description: null,
    created_at: null,
  };

  const allVersions = versions.length > 0 ? versions : [];

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5" /> Version History ({allVersions.length} version{allVersions.length !== 1 ? 's' : ''})
      </h3>

      {/* Upload new version */}
      <div className="space-y-2">
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Version notes (optional)..."
          rows={2}
          className="w-full px-2.5 py-1.5 rounded-md bg-secondary border border-border text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary resize-none"
        />
        <div
          {...getRootProps()}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-md border border-dashed transition-colors cursor-pointer ${
            isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
          } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
          ) : (
            <Upload className="w-4 h-4 text-muted-foreground" />
          )}
          <span className="text-xs text-muted-foreground">
            {uploading ? 'Uploading new version...' : 'Drop file to create new version'}
          </span>
        </div>
      </div>

      {/* Version list */}
      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        </div>
      ) : allVersions.length === 0 ? (
        <p className="text-[11px] text-muted-foreground">No versions yet — upload a revision above</p>
      ) : (
        <div className="space-y-2">
          {allVersions.map((v, i) => (
            <div
              key={v.id}
              className="flex items-start gap-3 p-2.5 rounded-lg border border-border bg-secondary/50 hover:bg-secondary transition-colors group"
            >
              {/* Thumbnail */}
              <div className="w-12 h-12 rounded overflow-hidden bg-muted flex-shrink-0">
                {v.thumbnail_url ? (
                  <img src={v.thumbnail_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/40 text-xs">v{v.version_number}</div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground">v{v.version_number}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {v.created_at ? new Date(v.created_at).toLocaleDateString() : ''}
                  </span>
                </div>

                {v.notes && (
                  <p className="text-[11px] text-muted-foreground mt-0.5 flex items-start gap-1">
                    <MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{v.notes}</span>
                  </p>
                )}

                {(v.ai_tags && v.ai_tags.length > 0) && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {v.ai_tags.slice(0, 5).map((tag: string) => (
                      <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {i < allVersions.length - 1 && (
                  <button
                    onClick={() => onOpenDiff(v, allVersions[i + 1])}
                    className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                    title="Compare with previous version"
                  >
                    <GitCompare className="w-3.5 h-3.5" />
                  </button>
                )}
                {/* Compare with original */}
                {allVersions.length > 0 && i === 0 && (
                  <button
                    onClick={() => onOpenDiff(v, originalVersion)}
                    className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                    title="Compare with original"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => deleteMutation.mutate(v.id)}
                  disabled={deleteMutation.isPending}
                  className="p-1 rounded hover:bg-muted text-destructive/50 hover:text-destructive"
                  title="Delete version"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
