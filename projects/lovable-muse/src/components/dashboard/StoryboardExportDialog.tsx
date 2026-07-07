import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X, Download, Image, FileVideo, FileText, Music, Package, Loader2, Check
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { zipSync, strToU8 } from 'fflate';
import { useToast } from '@/hooks/use-toast';

interface Frame {
  id: string;
  sort_order: number;
  title: string | null;
  notes: string | null;
  duration_seconds: number | null;
  status: string;
  audio_url?: string | null;
  annotations?: any[] | null;
  assets?: { thumbnail_url: string | null; name: string | null; file_url?: string; file_type?: string } | null;
}

interface StoryboardExportDialogProps {
  frames: Frame[];
  storyboardName: string;
  onClose: () => void;
}

type ExportType = 'images' | 'video' | 'pdf' | 'audio' | 'package';

function sanitize(name: string) {
  return (name || 'untitled').replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase();
}

async function fetchBlob(url: string): Promise<Blob | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.blob();
  } catch { return null; }
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 200);
}

export default function StoryboardExportDialog({ frames, storyboardName, onClose }: StoryboardExportDialogProps) {
  const { toast } = useToast();
  const [exporting, setExporting] = useState<ExportType | null>(null);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState<Set<ExportType>>(new Set());

  const hasAudio = frames.some(f => f.audio_url);
  const hasImages = frames.some(f => f.assets?.thumbnail_url || f.assets?.file_url);
  const safeName = sanitize(storyboardName);

  // --- Image ZIP ---
  const exportImages = async () => {
    setExporting('images');
    setProgress(0);
    const files: Record<string, Uint8Array> = {};
    for (let i = 0; i < frames.length; i++) {
      const f = frames[i];
      const url = f.assets?.thumbnail_url || f.assets?.file_url;
      if (url) {
        const blob = await fetchBlob(url);
        if (blob) {
          const ext = url.split('.').pop()?.split('?')[0] || 'jpg';
          const name = `${String(i + 1).padStart(2, '0')}-${sanitize(f.title || 'frame')}.${ext}`;
          const buf = await blob.arrayBuffer();
          files[name] = new Uint8Array(buf) as any;
        }
      }
      setProgress(((i + 1) / frames.length) * 100);
    }
    const zipped = zipSync(files) as unknown as ArrayBuffer;
    triggerDownload(new Blob([zipped], { type: 'application/zip' }), `${safeName}-images.zip`);
    setDone(prev => new Set([...prev, 'images']));
    setExporting(null);
  };

  // --- Video WebM ---
  const exportVideo = async () => {
    setExporting('video');
    setProgress(0);

    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d')!;
    const stream = canvas.captureStream(30);
    const mimeType = MediaRecorder.isTypeSupported('video/webm; codecs=vp9') ? 'video/webm; codecs=vp9' : 'video/webm';
    const recorder = new MediaRecorder(stream, { mimeType });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

    const recordPromise = new Promise<Blob>((resolve) => {
      recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' }));
    });

    recorder.start();

    for (let i = 0; i < frames.length; i++) {
      const f = frames[i];
      const dur = (f.duration_seconds || 3) * 1000;
      const url = f.assets?.thumbnail_url || f.assets?.file_url;

      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, 1920, 1080);

      if (url) {
        try {
          const img = document.createElement('img');
          img.crossOrigin = 'anonymous';
          await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = rej; img.src = url; });
          const scale = Math.min(1920 / img.width, 1080 / img.height);
          const w = img.width * scale;
          const h = img.height * scale;
          ctx.drawImage(img, (1920 - w) / 2, (1080 - h) / 2, w, h);
        } catch { /* blank frame */ }
      } else {
        ctx.fillStyle = '#333';
        ctx.font = '48px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(f.title || `Frame ${i + 1}`, 960, 540);
      }

      // Hold frame for its duration
      await new Promise(res => setTimeout(res, dur));
      setProgress(((i + 1) / frames.length) * 100);
    }

    recorder.stop();
    const blob = await recordPromise;
    triggerDownload(blob, `${safeName}.webm`);
    setDone(prev => new Set([...prev, 'video']));
    setExporting(null);
  };

  // --- PDF-style HTML ---
  const exportPdf = async () => {
    setExporting('pdf');
    setProgress(0);

    const imageDataUrls: string[] = [];
    for (let i = 0; i < frames.length; i++) {
      const url = frames[i].assets?.thumbnail_url || frames[i].assets?.file_url;
      if (url) {
        const blob = await fetchBlob(url);
        if (blob) {
          const reader = new FileReader();
          const dataUrl = await new Promise<string>((res) => { reader.onload = () => res(reader.result as string); reader.readAsDataURL(blob); });
          imageDataUrls.push(dataUrl);
        } else {
          imageDataUrls.push('');
        }
      } else {
        imageDataUrls.push('');
      }
      setProgress(((i + 1) / frames.length) * 80);
    }

    const rows = frames.map((f, i) => {
      const annotations = Array.isArray(f.annotations) ? f.annotations : [];
      const dialogues = annotations.filter((a: any) => (a.layer || 'note') === 'dialogue');
      return `
        <div style="display:flex;gap:16px;border-bottom:1px solid #333;padding:16px 0;">
          <div style="flex-shrink:0;width:320px;height:180px;background:#111;border-radius:8px;overflow:hidden;">
            ${imageDataUrls[i] ? `<img src="${imageDataUrls[i]}" style="width:100%;height:100%;object-fit:cover;" />` : '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#666;">No image</div>'}
          </div>
          <div style="flex:1;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
              <strong style="color:#fff;">Shot ${String(f.sort_order + 1).padStart(2, '0')}</strong>
              <span style="color:#aaa;">${f.title || 'Untitled'}</span>
              <span style="background:#333;padding:2px 8px;border-radius:4px;font-size:11px;color:#ccc;">${f.status}</span>
              <span style="color:#666;font-size:11px;">${f.duration_seconds || 3}s</span>
            </div>
            ${f.notes ? `<p style="color:#999;font-size:12px;margin:4px 0;">${f.notes}</p>` : ''}
            ${dialogues.length > 0 ? `<div style="margin-top:8px;">${dialogues.map((d: any) => `<p style="color:#7c58ed;font-size:12px;"><strong>${d.character || ''}:</strong> ${d.text || ''}</p>`).join('')}</div>` : ''}
          </div>
        </div>`;
    }).join('');

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${storyboardName}</title><style>body{font-family:system-ui,sans-serif;background:#000;color:#fff;max-width:1000px;margin:0 auto;padding:24px;}</style></head><body><h1 style="border-bottom:2px solid #333;padding-bottom:12px;">${storyboardName}</h1><p style="color:#666;">${frames.length} shots · ${frames.reduce((s, f) => s + (f.duration_seconds || 3), 0)}s total</p>${rows}</body></html>`;

    const blob = new Blob([html], { type: 'text/html' });
    triggerDownload(blob, `${safeName}-storyboard.html`);
    setProgress(100);
    setDone(prev => new Set([...prev, 'pdf']));
    setExporting(null);
  };

  // --- Audio merge ---
  const exportAudio = async () => {
    setExporting('audio');
    setProgress(0);
    const audioBlobs: Blob[] = [];
    const audioFrames = frames.filter(f => f.audio_url);
    for (let i = 0; i < audioFrames.length; i++) {
      const blob = await fetchBlob(audioFrames[i].audio_url!);
      if (blob) audioBlobs.push(blob);
      setProgress(((i + 1) / audioFrames.length) * 100);
    }
    if (audioBlobs.length === 0) {
      toast({ title: 'No audio files found', variant: 'destructive' });
      setExporting(null);
      return;
    }
    const merged = new Blob(audioBlobs, { type: audioBlobs[0].type || 'audio/mpeg' });
    triggerDownload(merged, `${safeName}-audio.mp3`);
    setDone(prev => new Set([...prev, 'audio']));
    setExporting(null);
  };

  // --- Full package ---
  const exportPackage = async () => {
    setExporting('package');
    setProgress(0);
    const files: Record<string, Uint8Array> = {};

    // Images
    for (let i = 0; i < frames.length; i++) {
      const url = frames[i].assets?.thumbnail_url || frames[i].assets?.file_url;
      if (url) {
        const blob = await fetchBlob(url);
        if (blob) {
          const ext = url.split('.').pop()?.split('?')[0] || 'jpg';
          const buf = await blob.arrayBuffer();
          files[`images/${String(i + 1).padStart(2, '0')}-${sanitize(frames[i].title || 'frame')}.${ext}`] = new Uint8Array(buf) as any;
        }
      }
      setProgress(((i + 1) / frames.length) * 40);
    }

    // Audio
    for (let i = 0; i < frames.length; i++) {
      if (frames[i].audio_url) {
        const blob = await fetchBlob(frames[i].audio_url!);
        if (blob) {
          files[`audio/${String(i + 1).padStart(2, '0')}-${sanitize(frames[i].title || 'frame')}.mp3`] = new Uint8Array(await blob.arrayBuffer());
        }
      }
    }
    setProgress(60);

    // Manifest JSON
    const manifest = frames.map((f, i) => ({
      shot: i + 1,
      title: f.title,
      duration: f.duration_seconds,
      status: f.status,
      notes: f.notes,
      hasAudio: !!f.audio_url,
    }));
    files['manifest.json'] = strToU8(JSON.stringify(manifest, null, 2));
    setProgress(80);

    const zipped = zipSync(files) as unknown as ArrayBuffer;
    triggerDownload(new Blob([zipped], { type: 'application/zip' }), `${safeName}-full-package.zip`);
    setProgress(100);
    setDone(prev => new Set([...prev, 'package']));
    setExporting(null);
  };

  const options: { type: ExportType; label: string; desc: string; icon: any; action: () => void; disabled?: boolean }[] = [
    { type: 'images', label: 'Image Sequence', desc: 'ZIP of all frame images', icon: Image, action: exportImages, disabled: !hasImages },
    { type: 'video', label: 'Video (WebM)', desc: 'Slideshow video with frame durations', icon: FileVideo, action: exportVideo, disabled: !hasImages },
    { type: 'pdf', label: 'PDF Storyboard', desc: 'Printable HTML with all shot details', icon: FileText, action: exportPdf },
    { type: 'audio', label: 'Audio Compilation', desc: 'All frame audio merged', icon: Music, action: exportAudio, disabled: !hasAudio },
    { type: 'package', label: 'Full Package', desc: 'Images + audio + manifest in one ZIP', icon: Package, action: exportPackage },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-xl w-full max-w-md p-5 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Export Storyboard</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>

        <p className="text-xs text-muted-foreground mb-4">{storyboardName} · {frames.length} frames</p>

        <div className="space-y-2">
          {options.map(opt => (
            <button
              key={opt.type}
              onClick={opt.action}
              disabled={!!exporting || opt.disabled}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border hover:border-primary/30 hover:bg-secondary/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-left"
            >
              <opt.icon className="w-4 h-4 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground">{opt.label}</p>
                <p className="text-[10px] text-muted-foreground">{opt.desc}</p>
              </div>
              {exporting === opt.type && <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />}
              {done.has(opt.type) && <Check className="w-4 h-4 text-phase-grow shrink-0" />}
            </button>
          ))}
        </div>

        {exporting && (
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <p className="text-[10px] text-muted-foreground mt-1 text-center">{Math.round(progress)}% — Exporting...</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
