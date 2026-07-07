import { useState, useRef, useEffect } from 'react';
import { X, Volume2, VolumeX, Maximize2, Minimize2 } from 'lucide-react';

interface VideoPreviewModalProps {
  src: string;
  name: string;
  onClose: () => void;
}

export default function VideoPreviewModal({ src, name, onClose }: VideoPreviewModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70" onClick={onClose}>
      <div
        className="relative max-w-4xl w-full mx-4 rounded-lg overflow-hidden bg-card border border-border"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground truncate">{name}</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMuted(m => !m)}
              className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video */}
        <video
          ref={videoRef}
          src={src}
          controls
          autoPlay
          muted={muted}
          className="w-full max-h-[70vh] bg-black"
        />
      </div>
    </div>
  );
}
