import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FolderOpen, Cloud, Link, HardDrive } from 'lucide-react';
import { uploadManager } from '@/lib/upload-manager';
import TagInput from '@/components/shared/TagInput';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const cloudProviders = [
  { id: 'gdrive' as const, label: 'Google Drive', hint: 'Paste a shared Google Drive link' },
  { id: 'dropbox' as const, label: 'Dropbox', hint: 'Paste a Dropbox shared link' },
  { id: 'onedrive' as const, label: 'OneDrive', hint: 'Paste a OneDrive share link' },
];

interface FileDropZoneProps {
  projectId?: string;
  projectName?: string;
  targetFolder?: string;
  compact?: boolean;
}

export default function FileDropZone({ projectId, projectName, targetFolder, compact }: FileDropZoneProps) {
  const [cloudOpen, setCloudOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<typeof cloudProviders[number] | null>(null);
  const [cloudUrl, setCloudUrl] = useState('');
  const [folderPath, setFolderPath] = useState(targetFolder || '');
  const [uploadTags, setUploadTags] = useState<string[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    uploadManager.addFiles(acceptedFiles, projectId, folderPath || '/', projectName, uploadTags.length > 0 ? uploadTags : undefined);
  }, [projectId, folderPath, projectName, uploadTags]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: false,
    multiple: true,
  });

  const handleFolderPick = async () => {
    try {
      // @ts-ignore - File System Access API
      const dirHandle = await window.showDirectoryPicker();
      const files: File[] = [];
      const walk = async (handle: any, path: string) => {
        for await (const entry of handle.values()) {
          if (entry.kind === 'file') {
            const file = await entry.getFile();
            // Preserve folder structure in targetFolder
            (file as any).__folderPath = path;
            files.push(file);
          } else if (entry.kind === 'directory') {
            await walk(entry, `${path}/${entry.name}`);
          }
        }
      };
      await walk(dirHandle, dirHandle.name);
      if (files.length > 0) {
        uploadManager.addFolder(files, dirHandle.name, projectId, folderPath || `/${dirHandle.name}`, projectName, uploadTags.length > 0 ? uploadTags : undefined);
      }
    } catch {
      // User cancelled
    }
  };

  const handleCloudImport = () => {
    if (!selectedProvider || !cloudUrl.trim()) return;
    uploadManager.addCloudImport(cloudUrl.trim(), selectedProvider.id, projectId, projectName);
    setCloudUrl('');
    setSelectedProvider(null);
    setCloudOpen(false);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div
          {...getRootProps()}
          className={`flex items-center gap-2 px-3 py-2 rounded-md border border-dashed transition-colors cursor-pointer ${
            isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Drop files or click</span>
        </div>
      </div>
    );
  }

  const supportsFileSystem = 'showDirectoryPicker' in window;

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center p-8 rounded-lg border-2 border-dashed transition-all cursor-pointer ${
          isDragActive
            ? 'border-primary bg-primary/5 glow-primary'
            : 'border-border hover:border-muted-foreground'
        }`}
      >
        <input {...getInputProps()} />
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
          {isDragActive ? (
            <FolderOpen className="w-6 h-6 text-primary" />
          ) : (
            <Upload className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
        <p className="text-sm font-medium text-foreground mb-1">
          {isDragActive ? 'Drop files here' : 'Drag & drop files, folders, or ZIPs'}
        </p>
        <p className="text-xs text-muted-foreground">
          Images, videos, audio, documents, ZIPs — anything goes
        </p>
      </div>

      {/* Folder path targeting */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 flex-1">
          <FolderOpen className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <Input
            placeholder="Target folder (e.g. /renders/v2)"
            value={folderPath}
            onChange={e => setFolderPath(e.target.value)}
            className="h-8 text-xs"
          />
        </div>
      </div>

      {/* Tags for uploaded assets */}
      <div>
        <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Tags (applied to all uploads)</label>
        <TagInput value={uploadTags} onChange={setUploadTags} placeholder="Add tags to uploads..." />
      </div>

      {/* Import options row */}
      <div className="flex items-center gap-2">
        {supportsFileSystem && (
          <Button variant="outline" size="sm" onClick={handleFolderPick} className="gap-1.5 text-xs">
            <HardDrive className="w-3.5 h-3.5" />
            Pick folder
          </Button>
        )}

        <Dialog open={cloudOpen} onOpenChange={setCloudOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Cloud className="w-3.5 h-3.5" />
              Import from cloud
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Import from cloud storage</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              {!selectedProvider ? (
                <div className="grid gap-2">
                  {cloudProviders.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProvider(p)}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 transition-colors text-left"
                    >
                      <Link className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{p.label}</p>
                        <p className="text-xs text-muted-foreground">{p.hint}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <button onClick={() => setSelectedProvider(null)} className="text-xs text-muted-foreground hover:text-foreground">
                    ← Back to providers
                  </button>
                  <p className="text-sm text-muted-foreground">{selectedProvider.hint}</p>
                  <Input
                    placeholder="https://..."
                    value={cloudUrl}
                    onChange={e => setCloudUrl(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCloudImport()}
                  />
                  <Button onClick={handleCloudImport} disabled={!cloudUrl.trim()} className="w-full">
                    Import
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
