import { useState, useRef } from 'react';
import { X, Search, Loader2, ImageIcon, Upload, Link, Clock, FolderOpen, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { uploadManager } from '@/lib/upload-manager';

interface AssetPickerProps {
  onSelect: (assetId: string) => void;
  onClose: () => void;
  projectId?: string;
  multiSelect?: boolean;
  onMultiSelect?: (assetIds: string[]) => void;
}

export default function AssetPicker({ onSelect, onClose, projectId, multiSelect, onMultiSelect }: AssetPickerProps) {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'project' | 'recent' | 'all'>('project');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [cloudUrl, setCloudUrl] = useState('');
  const [showCloudInput, setShowCloudInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Assets in this project
  const { data: projectAssets = [] } = useQuery({
    queryKey: ['assets-picker-project', user?.id, projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const { data, error } = await supabase
        .from('asset_projects')
        .select('asset_id, assets(id, name, thumbnail_url, file_type, updated_at)')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((ap: any) => ap.assets).filter(Boolean);
    },
    enabled: !!user && !!projectId,
  });

  // All assets (recent first)
  const { data: allAssets = [], isLoading } = useQuery({
    queryKey: ['assets-picker-all', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assets')
        .select('id, name, thumbnail_url, file_type, updated_at')
        .order('updated_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const recentAssets = allAssets.slice(0, 50);

  const getAssets = () => {
    if (tab === 'project' && projectId) return projectAssets;
    if (tab === 'recent') return recentAssets;
    return allAssets;
  };

  const assets = getAssets();
  const filtered = assets.filter((a: any) =>
    !search || a.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleFileUpload = (files: FileList | null) => {
    if (!files || !user) return;
    uploadManager.addFiles(Array.from(files), projectId);
  };

  const handleCloudImport = () => {
    if (!cloudUrl.trim()) return;
    let provider: 'gdrive' | 'dropbox' | 'onedrive' = 'gdrive';
    if (cloudUrl.includes('dropbox')) provider = 'dropbox';
    else if (cloudUrl.includes('onedrive') || cloudUrl.includes('1drv')) provider = 'onedrive';
    uploadManager.addCloudImport(cloudUrl, provider, projectId);
    setCloudUrl('');
    setShowCloudInput(false);
  };

  const toggleSelect = (id: string) => {
    if (!multiSelect) {
      onSelect(id);
      return;
    }
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const confirmMulti = () => {
    if (onMultiSelect) onMultiSelect(Array.from(selectedIds));
    onClose();
  };

  const tabs = projectId
    ? [
        { key: 'project' as const, label: 'This Project', icon: FolderOpen },
        { key: 'recent' as const, label: 'Recent', icon: Clock },
        { key: 'all' as const, label: 'All Assets', icon: ImageIcon },
      ]
    : [
        { key: 'recent' as const, label: 'Recent', icon: Clock },
        { key: 'all' as const, label: 'All Assets', icon: ImageIcon },
      ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-lg w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">
            {multiSelect ? 'Select Assets' : 'Select Asset'}
          </h3>
          <button onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-3 pt-2 pb-1">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                tab === t.key ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <t.icon className="w-3 h-3" /> {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="px-3 py-2 border-b border-border">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-secondary border border-border">
            <Search className="w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search assets..."
              className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none flex-1"
              autoFocus
            />
          </div>
        </div>

        {/* Upload actions */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={e => handleFileUpload(e.target.files)}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-secondary border border-border text-[11px] text-foreground hover:bg-secondary/80 transition-colors"
          >
            <Upload className="w-3 h-3" /> Upload File
          </button>
          <button
            onClick={() => setShowCloudInput(!showCloudInput)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-secondary border border-border text-[11px] text-foreground hover:bg-secondary/80 transition-colors"
          >
            <Link className="w-3 h-3" /> From URL
          </button>
        </div>

        {/* Cloud URL input */}
        {showCloudInput && (
          <div className="px-3 py-2 border-b border-border flex gap-2">
            <input
              value={cloudUrl}
              onChange={e => setCloudUrl(e.target.value)}
              placeholder="Paste Dropbox, Google Drive, or OneDrive link..."
              className="flex-1 px-2.5 py-1.5 rounded-md bg-secondary border border-border text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
              onKeyDown={e => e.key === 'Enter' && handleCloudImport()}
            />
            <button
              onClick={handleCloudImport}
              disabled={!cloudUrl.trim()}
              className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 disabled:opacity-50"
            >
              Import
            </button>
          </div>
        )}

        {/* Asset grid */}
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">
              {tab === 'project' ? 'No assets in this project yet' : 'No assets found'}
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {filtered.map((asset: any) => (
                <button
                  key={asset.id}
                  onClick={() => toggleSelect(asset.id)}
                  className={`rounded-md border overflow-hidden transition-all text-left ${
                    selectedIds.has(asset.id)
                      ? 'border-primary ring-1 ring-primary bg-primary/5'
                      : 'border-border bg-secondary hover:border-primary/40'
                  }`}
                >
                  <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden relative">
                    {asset.thumbnail_url ? (
                      <img src={asset.thumbnail_url} alt={asset.name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-muted-foreground/40" />
                    )}
                    {multiSelect && selectedIds.has(asset.id) && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Plus className="w-3 h-3 text-primary-foreground rotate-45" />
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] p-1.5 text-foreground truncate">{asset.name}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Multi-select footer */}
        {multiSelect && selectedIds.size > 0 && (
          <div className="flex items-center justify-between px-3 py-2.5 border-t border-border bg-secondary/30">
            <span className="text-xs text-muted-foreground">{selectedIds.size} selected</span>
            <button
              onClick={confirmMulti}
              className="px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90"
            >
              Assign {selectedIds.size} Assets
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
