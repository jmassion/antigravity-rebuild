// Global background upload manager - persists across page navigation
import { supabase } from '@/integrations/supabase/client';

export type UploadStatus = 'pending' | 'uploading' | 'processing' | 'complete' | 'error' | 'paused';

export interface UploadItem {
  id: string;
  file: File;
  name: string;
  size: number;
  progress: number;
  status: UploadStatus;
  error?: string;
  thumbnail?: string;
  projectId?: string;
  projectName?: string;
  targetFolder?: string;
  assetId?: string;
  retryCount: number;
  source: 'local' | 'gdrive' | 'dropbox' | 'onedrive' | 'zip-child';
  logId?: string;
  startedAt?: number;
  completedAt?: number;
  userTags?: string[];
  /** Bytes uploaded so far (for speed calculation) */
  bytesUploaded: number;
  /** Part of a bulk folder upload */
  batchId?: string;
}

export interface BatchInfo {
  id: string;
  folderName: string;
  totalFiles: number;
  completedFiles: number;
  failedFiles: number;
}

type Listener = (items: UploadItem[]) => void;

const MAX_RETRIES = 3;
const RETRY_DELAYS = [2000, 5000, 15000];

class UploadManager {
  private items: UploadItem[] = [];
  private listeners: Set<Listener> = new Set();
  private activeCount = 0;
  private concurrency = 3;
  private realtimeChannel: any = null;
  private _isPaused = false;
  /** speed samples: { timestamp, bytes } */
  private speedSamples: { ts: number; bytes: number }[] = [];
  private batches: Map<string, BatchInfo> = new Map();

  get isPaused() { return this._isPaused; }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.items);
    return () => { this.listeners.delete(listener); };
  }

  private notify() {
    this.listeners.forEach(l => l([...this.items]));
  }

  /** Pause the queue — active uploads finish, but no new ones start */
  pause() {
    this._isPaused = true;
    this.notify();
  }

  /** Resume the queue — start processing pending items */
  resume() {
    this._isPaused = false;
    this.notify();
    this.processQueue();
  }

  togglePause() {
    if (this._isPaused) this.resume();
    else this.pause();
  }

  /** Start listening to realtime upload_logs changes (cross-tab sync) */
  startRealtimeSync() {
    if (this.realtimeChannel) return;
    this.realtimeChannel = supabase
      .channel('upload-progress')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'upload_logs',
      }, (payload: any) => {
        const row = payload.new;
        if (!row) return;
        const item = this.items.find(i => i.logId === row.id);
        if (item) {
          if (row.status === 'complete' && item.status !== 'complete') {
            this.updateItem(item.id, { status: 'complete', progress: 100, completedAt: Date.now() });
          } else if (row.status === 'error' && item.status !== 'error') {
            this.updateItem(item.id, { status: 'error', error: row.error_message || 'Failed' });
          }
        }
      })
      .subscribe();
  }

  stopRealtimeSync() {
    if (this.realtimeChannel) {
      supabase.removeChannel(this.realtimeChannel);
      this.realtimeChannel = null;
    }
  }

  addFiles(files: File[], projectId?: string, targetFolder?: string, projectName?: string, userTags?: string[], batchId?: string) {
    const newItems: UploadItem[] = files.map(file =>
      this.createItem(file, projectId, targetFolder, 'local', projectName, userTags, batchId)
    );
    this.items = [...this.items, ...newItems];

    // Update batch count
    if (batchId) {
      const batch = this.batches.get(batchId);
      if (batch) {
        batch.totalFiles += newItems.length;
      }
    }

    this.notify();
    this.startRealtimeSync();
    this.processQueue();
  }

  /** Add a bulk folder upload — groups files under a single batchId */
  addFolder(files: File[], folderName: string, projectId?: string, targetFolder?: string, projectName?: string, userTags?: string[]) {
    const batchId = crypto.randomUUID();
    this.batches.set(batchId, {
      id: batchId,
      folderName,
      totalFiles: files.length,
      completedFiles: 0,
      failedFiles: 0,
    });
    this.addFiles(files, projectId, targetFolder, projectName, userTags, batchId);
  }

  addCloudImport(url: string, provider: 'gdrive' | 'dropbox' | 'onedrive', projectId?: string, projectName?: string) {
    const item: UploadItem = {
      id: crypto.randomUUID(),
      file: new File([], 'cloud-import'),
      name: `Importing from ${provider}...`,
      size: 0,
      progress: 0,
      status: 'uploading',
      projectId,
      projectName,
      retryCount: 0,
      source: provider,
      startedAt: Date.now(),
      bytesUploaded: 0,
    };
    this.items = [...this.items, item];
    this.notify();
    this.startRealtimeSync();
    this.importFromCloud(item, url, provider);
  }

  private createItem(file: File, projectId?: string, targetFolder?: string, source: UploadItem['source'] = 'local', projectName?: string, userTags?: string[], batchId?: string): UploadItem {
    return {
      id: crypto.randomUUID(),
      file,
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'pending',
      projectId,
      projectName,
      targetFolder,
      thumbnail: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      retryCount: 0,
      source,
      startedAt: Date.now(),
      userTags,
      bytesUploaded: 0,
      batchId,
    };
  }

  private async processQueue() {
    if (this._isPaused) return;
    const pending = this.items.filter(i => i.status === 'pending');
    const available = this.concurrency - this.activeCount;
    const batch = pending.slice(0, Math.max(0, available));

    for (const item of batch) {
      this.activeCount++;
      this.uploadItem(item).finally(() => {
        this.activeCount--;
        this.processQueue();
      });
    }
  }

  private async uploadItem(item: UploadItem) {
    this.updateItem(item.id, { status: 'uploading', progress: 5 });

    let logId: string | null = null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        let fileType = 'document';
        if (item.file.type.startsWith('image/')) fileType = 'image';
        else if (item.file.type.startsWith('video/')) fileType = 'video';
        else if (item.file.type.startsWith('audio/')) fileType = 'audio';
        const { data: logRow } = await supabase.from('upload_logs').insert({
          owner_id: user.id,
          file_name: item.name,
          file_size: item.size,
          file_type: fileType,
          source: item.source,
          status: 'uploading',
          project_id: item.projectId || null,
          folder_path: item.targetFolder || '/',
          progress: 5,
        }).select('id').single();
        if (logRow) {
          logId = logRow.id;
          this.updateItem(item.id, { logId: logRow.id });
        }
      }
    } catch { /* non-critical */ }

    const updateLogProgress = (progress: number, status?: string) => {
      if (logId) {
        supabase.from('upload_logs').update({
          progress,
          ...(status ? { status } : {}),
        }).eq('id', logId).then();
      }
    };

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let displayName = user.email || 'unknown';
      try {
        const { data: profile } = await supabase.from('profiles').select('display_name').eq('user_id', user.id).single();
        if (profile?.display_name) displayName = profile.display_name;
      } catch { /* use email fallback */ }
      const uploadedByTag = `uploaded_by:${displayName}`;

      const isZip = item.file.name.toLowerCase().endsWith('.zip') ||
        item.file.type === 'application/zip' ||
        item.file.type === 'application/x-zip-compressed';

      const ext = item.file.name.split('.').pop() || 'bin';
      const storagePath = `${user.id}/${crypto.randomUUID()}.${ext}`;

      // Upload to storage
      this.updateItem(item.id, { progress: 20, bytesUploaded: Math.floor(item.size * 0.2) });
      this.recordSpeed(Math.floor(item.size * 0.2));
      updateLogProgress(20);
      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(storagePath, item.file, { upsert: false });

      if (uploadError) throw uploadError;
      this.updateItem(item.id, { progress: 50, bytesUploaded: Math.floor(item.size * 0.5) });
      this.recordSpeed(Math.floor(item.size * 0.3));
      updateLogProgress(50);

      const { data: { publicUrl } } = supabase.storage.from('assets').getPublicUrl(storagePath);

      // If ZIP, trigger server-side extraction
      if (isZip) {
        this.updateItem(item.id, { status: 'processing', progress: 60, name: `Extracting ${item.file.name}...` });
        updateLogProgress(60, 'processing');
        const { data: extractData, error: extractError } = await supabase.functions.invoke('extract-zip', {
          body: { storagePath, projectId: item.projectId, fileName: item.file.name },
        });
        if (extractError) throw new Error(extractError.message || 'ZIP extraction failed');

        const extractedCount = extractData?.extractedCount || 0;
        this.updateItem(item.id, {
          status: 'complete', progress: 100, completedAt: Date.now(),
          name: `${item.file.name} (${extractedCount} files extracted)`,
          bytesUploaded: item.size,
        });
        this.finishBatchItem(item, true);
        if (logId) supabase.from('upload_logs').update({ status: 'complete', progress: 100, completed_at: new Date().toISOString() }).eq('id', logId).then();
        return;
      }

      const thumbnailUrl = item.file.type.startsWith('image/') ? publicUrl : null;
      let fileType = 'document';
      if (item.file.type.startsWith('image/')) fileType = 'image';
      else if (item.file.type.startsWith('video/')) fileType = 'video';
      else if (item.file.type.startsWith('audio/')) fileType = 'audio';

      this.updateItem(item.id, { progress: 70, bytesUploaded: Math.floor(item.size * 0.7) });
      this.recordSpeed(Math.floor(item.size * 0.2));
      updateLogProgress(70);

      const { data: asset, error: dbError } = await supabase
        .from('assets')
        .insert({
          name: item.file.name,
          file_url: publicUrl,
          file_type: fileType,
          file_size: item.file.size,
          thumbnail_url: thumbnailUrl,
          owner_id: user.id,
          tags: [uploadedByTag, ...(item.userTags || [])],
        })
        .select()
        .single();

      if (dbError) throw dbError;
      this.updateItem(item.id, { progress: 85, assetId: asset.id, bytesUploaded: Math.floor(item.size * 0.85) });
      updateLogProgress(85);

      if (item.projectId && asset) {
        await supabase.from('asset_projects').insert({
          asset_id: asset.id,
          project_id: item.projectId,
          folder_path: item.targetFolder || '/',
        });
      }

      // AI analysis for images (fire and forget)
      if (fileType === 'image' && publicUrl) {
        supabase.functions.invoke('analyze-asset', {
          body: { imageUrl: publicUrl, fileName: item.file.name },
        }).then(({ data }) => {
          if (data && asset) {
            supabase.from('assets').update({
              ai_description: data.description,
              ai_tags: data.tags,
              tags: data.tags,
            }).eq('id', asset.id);
          }
        }).catch(console.error);
      }

      this.updateItem(item.id, { status: 'complete', progress: 100, completedAt: Date.now(), bytesUploaded: item.size });
      this.finishBatchItem(item, true);
      if (logId) supabase.from('upload_logs').update({ status: 'complete', progress: 100, asset_id: asset?.id || null, completed_at: new Date().toISOString() }).eq('id', logId).then();
    } catch (e) {
      const currentItem = this.items.find(i => i.id === item.id);
      const retryCount = currentItem?.retryCount ?? 0;

      if (retryCount < MAX_RETRIES) {
        const delay = RETRY_DELAYS[retryCount] || 15000;
        this.updateItem(item.id, {
          status: 'pending',
          retryCount: retryCount + 1,
          progress: 0,
          bytesUploaded: 0,
          error: `Retry ${retryCount + 1}/${MAX_RETRIES} in ${delay / 1000}s...`,
        });
        updateLogProgress(0, 'uploading');
        setTimeout(() => this.processQueue(), delay);
      } else {
        this.updateItem(item.id, {
          status: 'error',
          error: e instanceof Error ? e.message : 'Upload failed',
        });
        this.finishBatchItem(item, false);
        if (logId) supabase.from('upload_logs').update({ status: 'error', progress: 0, error_message: e instanceof Error ? e.message : 'Upload failed', completed_at: new Date().toISOString() }).eq('id', logId).then();
      }
    }
  }

  private async importFromCloud(item: UploadItem, url: string, provider: string) {
    try {
      this.updateItem(item.id, { progress: 10 });
      const { data, error } = await supabase.functions.invoke('import-cloud-file', {
        body: { url, provider, projectId: item.projectId },
      });
      if (error) throw new Error(error.message || 'Cloud import failed');

      const isExtractedZip = data?.extracted === true;
      this.updateItem(item.id, {
        status: 'complete',
        progress: 100,
        completedAt: Date.now(),
        name: isExtractedZip
          ? `${data.fileName} (${data.extractedCount} files extracted)`
          : (data?.fileName || `Imported from ${provider}`),
        assetId: data?.assetId,
      });
    } catch (e) {
      const currentItem = this.items.find(i => i.id === item.id);
      const retryCount = currentItem?.retryCount ?? 0;

      if (retryCount < MAX_RETRIES) {
        const delay = RETRY_DELAYS[retryCount] || 15000;
        this.updateItem(item.id, {
          status: 'pending',
          retryCount: retryCount + 1,
          progress: 0,
          error: `Retry ${retryCount + 1}/${MAX_RETRIES}...`,
        });
        setTimeout(() => {
          const retry = this.items.find(i => i.id === item.id);
          if (retry && retry.status === 'pending') {
            this.updateItem(item.id, { status: 'uploading' });
            this.importFromCloud({ ...retry, status: 'uploading' } as any, url, provider);
          }
        }, delay);
      } else {
        this.updateItem(item.id, {
          status: 'error',
          error: e instanceof Error ? e.message : 'Import failed',
        });
      }
    }
  }

  private updateItem(id: string, updates: Partial<UploadItem>) {
    this.items = this.items.map(i => i.id === id ? { ...i, ...updates } : i);
    this.notify();
  }

  private recordSpeed(bytes: number) {
    const now = Date.now();
    this.speedSamples.push({ ts: now, bytes });
    // Keep only last 10 seconds of samples
    this.speedSamples = this.speedSamples.filter(s => now - s.ts < 10000);
  }

  private finishBatchItem(item: UploadItem, success: boolean) {
    if (!item.batchId) return;
    const batch = this.batches.get(item.batchId);
    if (!batch) return;
    if (success) batch.completedFiles++;
    else batch.failedFiles++;
  }

  /** Current upload speed in bytes/second (rolling 10s window) */
  get speed(): number {
    if (this.speedSamples.length < 2) return 0;
    const now = Date.now();
    const recent = this.speedSamples.filter(s => now - s.ts < 10000);
    if (recent.length < 2) return 0;
    const totalBytes = recent.reduce((sum, s) => sum + s.bytes, 0);
    const elapsed = (now - recent[0].ts) / 1000;
    return elapsed > 0 ? totalBytes / elapsed : 0;
  }

  /** Estimated time remaining in seconds */
  get eta(): number {
    const sp = this.speed;
    if (sp <= 0) return 0;
    const remaining = this.stats.totalBytes - this.stats.uploadedBytes;
    return remaining / sp;
  }

  getBatch(batchId: string): BatchInfo | undefined {
    return this.batches.get(batchId);
  }

  get activeBatches(): BatchInfo[] {
    return Array.from(this.batches.values()).filter(b => b.completedFiles + b.failedFiles < b.totalFiles);
  }

  retryFailed() {
    this.items = this.items.map(i =>
      i.status === 'error' ? { ...i, status: 'pending' as UploadStatus, progress: 0, error: undefined, retryCount: 0, bytesUploaded: 0 } : i
    );
    this.notify();
    this.processQueue();
  }

  retryItem(id: string) {
    this.items = this.items.map(i =>
      i.id === id && i.status === 'error' ? { ...i, status: 'pending' as UploadStatus, progress: 0, error: undefined, retryCount: 0, bytesUploaded: 0 } : i
    );
    this.notify();
    this.processQueue();
  }

  removeItem(id: string) {
    this.items = this.items.filter(i => i.id !== id);
    this.notify();
  }

  removeCompleted() {
    this.items = this.items.filter(i => i.status !== 'complete');
    this.notify();
  }

  clearAll() {
    this.items = [];
    this.batches.clear();
    this.speedSamples = [];
    this.notify();
    this.stopRealtimeSync();
  }

  get stats() {
    return {
      total: this.items.length,
      pending: this.items.filter(i => i.status === 'pending').length,
      uploading: this.items.filter(i => i.status === 'uploading').length,
      processing: this.items.filter(i => i.status === 'processing').length,
      complete: this.items.filter(i => i.status === 'complete').length,
      errors: this.items.filter(i => i.status === 'error').length,
      paused: this.items.filter(i => i.status === 'paused').length,
      totalBytes: this.items.reduce((s, i) => s + i.size, 0),
      uploadedBytes: this.items.reduce((s, i) => s + i.bytesUploaded, 0),
    };
  }
}

export const uploadManager = new UploadManager();
