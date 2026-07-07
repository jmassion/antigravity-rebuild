import { useState } from 'react';
import { Search, Upload, Loader2, CheckCircle2, XCircle, Clock, Cog, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import AppLayout from '@/components/layout/AppLayout';
import FileDropZone from '@/components/shared/FileDropZone';
import ViewToolbar, { ViewMode, groupItems, sortItems } from '@/components/shared/ViewToolbar';
import ListView, { Column } from '@/components/shared/ListView';
import KanbanView from '@/components/shared/KanbanView';
import { useViewPreferences } from '@/hooks/useViewPreferences';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/lib/i18n';

interface UploadLog {
  id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  source: string;
  status: string;
  error_message: string | null;
  asset_id: string | null;
  project_id: string | null;
  folder_path: string;
  started_at: string;
  completed_at: string | null;
  created_at: string;
}

const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  uploading: { icon: Loader2, color: 'bg-primary/10 text-primary', label: 'Uploading' },
  processing: { icon: Cog, color: 'bg-phase-build/20 text-phase-build', label: 'Processing' },
  complete: { icon: CheckCircle2, color: 'bg-phase-grow/20 text-phase-grow', label: 'Complete' },
  error: { icon: XCircle, color: 'bg-destructive/20 text-destructive', label: 'Error' },
};

const sourceLabels: Record<string, string> = {
  local: '💻 Local',
  gdrive: '📁 Google Drive',
  dropbox: '📦 Dropbox',
  onedrive: '☁️ OneDrive',
  'zip-child': '📂 ZIP Extract',
};

function formatSize(bytes: number): string {
  if (bytes === 0) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

function formatDuration(start: string, end: string | null): string {
  if (!end) return '—';
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export default function Uploads() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const vp = useViewPreferences('uploads', { view: 'list', sortBy: 'started_at' });

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['upload-logs', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('upload_logs')
        .select('*')
        .order('started_at', { ascending: false });
      if (error) throw error;
      return data as UploadLog[];
    },
    enabled: !!user,
  });

  const filtered = logs.filter(l => {
    if (!search) return true;
    return l.file_name.toLowerCase().includes(search.toLowerCase()) ||
           l.source.includes(search.toLowerCase()) ||
           l.status.includes(search.toLowerCase());
  });

  const sortKeyFn = (l: UploadLog) => {
    if (vp.sortBy === 'file_name') return l.file_name;
    if (vp.sortBy === 'file_size') return l.file_size;
    if (vp.sortBy === 'status') return l.status;
    return l.started_at;
  };
  const sorted = sortItems(filtered, sortKeyFn, vp.sortDir);

  const groupKeyFn = (l: UploadLog) => {
    if (vp.groupBy === 'status') return statusConfig[l.status]?.label || l.status;
    if (vp.groupBy === 'source') return sourceLabels[l.source] || l.source;
    if (vp.groupBy === 'file_type') return l.file_type;
    return '';
  };
  const grouped = vp.groupBy ? groupItems(sorted, groupKeyFn) : undefined;

  const columns: Column<UploadLog>[] = [
    {
      key: 'status', label: 'Status', className: 'w-[100px]',
      render: (l) => {
        const cfg = statusConfig[l.status] || statusConfig.error;
        const Icon = cfg.icon;
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.color}`}>
            <Icon className={`w-3 h-3 ${l.status === 'uploading' ? 'animate-spin' : ''}`} />
            {cfg.label}
          </span>
        );
      },
    },
    {
      key: 'file_name', label: 'File',
      render: (l) => (
        <div>
          <p className="text-foreground font-medium truncate max-w-[200px]">{l.file_name}</p>
          {l.error_message && <p className="text-destructive text-[10px] truncate">{l.error_message}</p>}
        </div>
      ),
    },
    { key: 'source', label: 'Source', className: 'w-[120px]', render: (l) => <span className="text-muted-foreground">{sourceLabels[l.source] || l.source}</span> },
    { key: 'file_size', label: 'Size', className: 'w-[80px]', render: (l) => <span className="text-muted-foreground">{formatSize(l.file_size)}</span> },
    { key: 'duration', label: 'Duration', className: 'w-[80px]', render: (l) => <span className="text-muted-foreground">{formatDuration(l.started_at, l.completed_at)}</span> },
    { key: 'started_at', label: 'Date', className: 'w-[120px]', render: (l) => <span className="text-muted-foreground">{new Date(l.started_at).toLocaleString()}</span> },
  ];

  const renderGridCard = (log: UploadLog) => {
    const cfg = statusConfig[log.status] || statusConfig.error;
    const Icon = cfg.icon;
    return (
      <div className="rounded-lg border border-border bg-card p-3 hover:border-primary/30 transition-all">
        <div className="flex items-center gap-2 mb-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.color}`}>
            <Icon className={`w-3 h-3 ${log.status === 'uploading' ? 'animate-spin' : ''}`} />
            {cfg.label}
          </span>
          <span className="text-[10px] text-muted-foreground ml-auto">{formatSize(log.file_size)}</span>
        </div>
        <p className="text-xs font-medium text-foreground truncate">{log.file_name}</p>
        <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
          <span>{sourceLabels[log.source] || log.source}</span>
          <span className="flex items-center gap-0.5 ml-auto"><Clock className="w-3 h-3" />{new Date(log.started_at).toLocaleDateString()}</span>
        </div>
        {log.error_message && <p className="text-[10px] text-destructive mt-1 truncate">{log.error_message}</p>}
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-[1400px]">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-bold text-foreground">{t('uploads.title')}</h1>
          <button onClick={() => setShowUpload(!showUpload)}
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
            <Upload className="w-4 h-4" /> Upload Files
          </button>
        </div>

        {showUpload && <div className="mb-6"><FileDropZone /></div>}

        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary border border-border max-w-sm flex-1">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search uploads..."
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1" />
          </div>
          <ViewToolbar
            views={['list', 'grid', 'kanban']}
            view={vp.view} onViewChange={vp.setView}
            groupByOptions={[
              { value: 'status', label: 'Status' },
              { value: 'source', label: 'Source' },
              { value: 'file_type', label: 'File Type' },
            ]}
            groupBy={vp.groupBy} onGroupByChange={vp.setGroupBy}
            sortOptions={[
              { value: 'started_at', label: 'Date' },
              { value: 'file_name', label: 'Name' },
              { value: 'file_size', label: 'Size' },
              { value: 'status', label: 'Status' },
            ]}
            sortBy={vp.sortBy} onSortByChange={vp.setSortBy}
            sortDir={vp.sortDir} onSortDirChange={vp.setSortDir}
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Upload className="w-8 h-8 mb-3 opacity-50" />
            <p className="text-sm">{logs.length === 0 ? 'No uploads yet — upload files above' : 'No uploads match your search'}</p>
          </div>
        ) : vp.view === 'list' ? (
          <ListView items={sorted} columns={columns} keyFn={l => l.id} groups={grouped} />
        ) : vp.view === 'kanban' ? (
          <KanbanView
            columns={grouped || groupItems(sorted, l => statusConfig[l.status]?.label || l.status)}
            renderCard={renderGridCard}
            keyFn={l => l.id}
            columnOrder={['Uploading', 'Processing', 'Complete', 'Error']}
          />
        ) : (
          <div>
            {grouped ? (
              Object.entries(grouped).map(([groupName, items]) => (
                <div key={groupName} className="mb-6">
                  <h3 className="text-xs font-semibold text-foreground mb-3">{groupName} ({items.length})</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {items.map(log => <motion.div key={log.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>{renderGridCard(log)}</motion.div>)}
                  </div>
                </div>
              ))
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {sorted.map(log => <motion.div key={log.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>{renderGridCard(log)}</motion.div>)}
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
