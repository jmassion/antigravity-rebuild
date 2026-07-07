import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, CheckCircle, AlertCircle, ChevronUp, ChevronDown,
  RotateCcw, X, Loader2, FolderOpen, Trash2, Pause, Play,
  Zap, Archive
} from 'lucide-react';
import { uploadManager, type UploadItem } from '@/lib/upload-manager';
import { toast } from 'sonner';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function formatElapsed(ms: number): string {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

function formatEta(seconds: number): string {
  if (seconds <= 0) return '';
  if (seconds < 60) return `~${Math.ceil(seconds)}s left`;
  if (seconds < 3600) return `~${Math.ceil(seconds / 60)}m left`;
  return `~${(seconds / 3600).toFixed(1)}h left`;
}

function formatSpeed(bytesPerSec: number): string {
  if (bytesPerSec <= 0) return '';
  if (bytesPerSec < 1024) return `${Math.round(bytesPerSec)} B/s`;
  if (bytesPerSec < 1024 * 1024) return `${(bytesPerSec / 1024).toFixed(1)} KB/s`;
  return `${(bytesPerSec / (1024 * 1024)).toFixed(1)} MB/s`;
}

export default function UploadIndicator() {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [, forceUpdate] = useState(0);
  const [prevComplete, setPrevComplete] = useState(0);

  useEffect(() => {
    const unsub = uploadManager.subscribe(setItems);
    return () => { unsub(); };
  }, []);

  // Auto-expand when new items arrive
  useEffect(() => {
    if (items.length > 0 && items.some(i => i.status === 'pending' || i.status === 'uploading')) {
      setExpanded(true);
    }
  }, [items.length]);

  // Toast notifications on completion / failure
  useEffect(() => {
    const stats = uploadManager.stats;
    if (stats.complete > prevComplete && prevComplete > 0) {
      const diff = stats.complete - prevComplete;
      toast.success(`${diff} upload${diff > 1 ? 's' : ''} complete`);
    }
    setPrevComplete(stats.complete);
  }, [items]);

  // Tick for elapsed time + speed display
  useEffect(() => {
    const activeCount = items.filter(i => i.status === 'uploading' || i.status === 'processing').length;
    if (activeCount === 0) return;
    const timer = setInterval(() => forceUpdate(n => n + 1), 1000);
    return () => clearInterval(timer);
  }, [items]);

  const stats = uploadManager.stats;
  if (stats.total === 0) return null;

  const activeCount = stats.uploading + stats.pending + stats.processing;
  const hasErrors = stats.errors > 0;
  const overallProgress = stats.totalBytes > 0
    ? Math.round((stats.uploadedBytes / stats.totalBytes) * 100)
    : 0;
  const isPaused = uploadManager.isPaused;
  const speed = uploadManager.speed;
  const eta = uploadManager.eta;
  const activeBatches = uploadManager.activeBatches;

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-4 right-4 z-50 w-96"
    >
      {/* Header bar */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-t-lg ${!expanded ? 'rounded-b-lg' : ''} bg-card border border-border shadow-lg transition-colors`}
      >
        {isPaused ? (
          <Pause className="w-4 h-4 text-warning flex-shrink-0" />
        ) : activeCount > 0 ? (
          <Loader2 className="w-4 h-4 text-primary animate-spin flex-shrink-0" />
        ) : hasErrors ? (
          <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
        ) : (
          <CheckCircle className="w-4 h-4 text-phase-grow flex-shrink-0" />
        )}
        <div className="flex-1 text-left min-w-0">
          <span className="text-sm font-medium text-foreground block">
            {isPaused
              ? `Paused · ${stats.pending + stats.uploading} remaining`
              : stats.processing > 0
              ? `Processing ${stats.processing} file${stats.processing > 1 ? 's' : ''}...`
              : activeCount > 0
              ? `Uploading ${activeCount} of ${stats.total} files`
              : hasErrors
              ? `${stats.errors} failed · ${stats.complete} done`
              : `${stats.complete} upload${stats.complete > 1 ? 's' : ''} complete`}
          </span>
          {activeCount > 0 && !isPaused && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-2">
              {stats.totalBytes > 0 && (
                <span>{formatBytes(stats.uploadedBytes)} / {formatBytes(stats.totalBytes)} · {overallProgress}%</span>
              )}
              {speed > 0 && (
                <span className="flex items-center gap-0.5">
                  <Zap className="w-2.5 h-2.5" />{formatSpeed(speed)}
                </span>
              )}
              {eta > 0 && <span>{formatEta(eta)}</span>}
            </span>
          )}
        </div>
        {/* Overall progress ring */}
        {activeCount > 0 && !isPaused && (
          <div className="relative w-7 h-7 flex-shrink-0">
            <svg className="w-7 h-7 -rotate-90" viewBox="0 0 28 28">
              <circle cx="14" cy="14" r="12" fill="none" strokeWidth="2" className="stroke-muted" />
              <circle
                cx="14" cy="14" r="12" fill="none" strokeWidth="2"
                className="stroke-primary transition-all duration-300"
                strokeDasharray={`${2 * Math.PI * 12}`}
                strokeDashoffset={`${2 * Math.PI * 12 * (1 - overallProgress / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[8px] font-mono font-bold text-foreground">
              {overallProgress}
            </span>
          </div>
        )}
        {expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
      </button>

      {/* Expanded list */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-card border border-t-0 border-border rounded-b-lg shadow-lg max-h-80 overflow-y-auto scrollbar-thin"
          >
            {/* Active batch summaries */}
            {activeBatches.length > 0 && (
              <div className="px-4 py-2 border-b border-border/50 space-y-1">
                {activeBatches.map(batch => (
                  <div key={batch.id} className="flex items-center gap-2 text-[10px]">
                    <Archive className="w-3 h-3 text-muted-foreground" />
                    <span className="text-foreground font-medium truncate">{batch.folderName}</span>
                    <span className="text-muted-foreground ml-auto">
                      {batch.completedFiles}/{batch.totalFiles}
                      {batch.failedFiles > 0 && <span className="text-destructive ml-1">({batch.failedFiles} failed)</span>}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {items.slice(-20).map(item => (
              <div key={item.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-border/50 last:border-0">
                {item.thumbnail ? (
                  <img src={item.thumbnail} className="w-9 h-9 rounded object-cover flex-shrink-0" alt="" />
                ) : (
                  <div className="w-9 h-9 rounded bg-muted flex items-center justify-center flex-shrink-0">
                    <Upload className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{item.name}</p>

                  {/* Project + folder context */}
                  {(item.projectName || item.targetFolder) && (
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 truncate">
                      <FolderOpen className="w-2.5 h-2.5 inline flex-shrink-0" />
                      {item.projectName}{item.targetFolder && item.targetFolder !== '/' ? ` / ${item.targetFolder}` : ''}
                    </p>
                  )}

                  {/* Progress bar */}
                  {(item.status === 'uploading' || item.status === 'processing') && (
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${
                            item.status === 'processing' ? 'bg-accent' : 'bg-primary'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${item.progress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <span className="text-[9px] font-mono text-muted-foreground w-8 text-right">{item.progress}%</span>
                    </div>
                  )}

                  {/* Retry info */}
                  {item.status === 'pending' && item.retryCount > 0 && (
                    <p className="text-[10px] text-warning flex items-center gap-1 mt-0.5">
                      <RotateCcw className="w-2.5 h-2.5" /> {item.error}
                    </p>
                  )}

                  {/* Error message */}
                  {item.status === 'error' && (
                    <p className="text-[10px] text-destructive mt-0.5 truncate">{item.error || 'Failed'}</p>
                  )}

                  {/* Size + elapsed */}
                  {item.status !== 'error' && (
                    <div className="flex items-center gap-2 mt-0.5">
                      {item.size > 0 && (
                        <span className="text-[9px] text-muted-foreground">{formatBytes(item.size)}</span>
                      )}
                      {item.startedAt && !item.completedAt && (item.status === 'uploading' || item.status === 'processing') && (
                        <span className="text-[9px] text-muted-foreground">{formatElapsed(Date.now() - item.startedAt)}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Status actions */}
                {item.status === 'complete' && <CheckCircle className="w-4 h-4 text-phase-grow flex-shrink-0" />}
                {item.status === 'error' && (
                  <button onClick={() => uploadManager.retryItem(item.id)} className="p-1 hover:bg-muted rounded" title="Retry">
                    <RotateCcw className="w-3.5 h-3.5 text-destructive" />
                  </button>
                )}
                {(item.status === 'error' || item.status === 'complete') && (
                  <button onClick={() => uploadManager.removeItem(item.id)} className="p-1 hover:bg-muted rounded" title="Remove">
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                )}
              </div>
            ))}

            {/* Footer actions */}
            <div className="flex gap-2 px-4 py-2 border-t border-border/50 items-center">
              {/* Pause / Resume */}
              {(activeCount > 0 || isPaused) && (
                <button
                  onClick={(e) => { e.stopPropagation(); uploadManager.togglePause(); }}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                  {isPaused ? 'Resume' : 'Pause'}
                </button>
              )}
              {hasErrors && (
                <button onClick={() => uploadManager.retryFailed()} className="text-xs text-primary hover:underline flex items-center gap-1">
                  <RotateCcw className="w-3 h-3" /> Retry all
                </button>
              )}
              {stats.complete > 0 && (
                <button onClick={() => uploadManager.removeCompleted()} className="text-xs text-muted-foreground hover:underline flex items-center gap-1">
                  <Trash2 className="w-3 h-3" /> Clear done
                </button>
              )}
              <button onClick={() => uploadManager.clearAll()} className="text-xs text-muted-foreground hover:underline ml-auto">
                Clear all
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
