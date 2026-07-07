import { useState } from 'react';
import { Crosshair, Maximize, Minimize, Move, ImageIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

type FitMode = 'cover' | 'contain' | 'fill' | 'auto';

interface ThumbnailSettingsProps {
  thumbnailUrl: string | null;
  fit: FitMode;
  focusX: number;
  focusY: number;
  onFitChange: (fit: FitMode) => void;
  onFocusChange: (x: number, y: number) => void;
}

const fitOptions: { value: FitMode; label: string; icon: React.ElementType }[] = [
  { value: 'cover', label: 'Cover', icon: Maximize },
  { value: 'contain', label: 'Contain', icon: Minimize },
  { value: 'fill', label: 'Fill', icon: Move },
  { value: 'auto', label: 'Auto', icon: ImageIcon },
];

export default function ThumbnailSettings({
  thumbnailUrl,
  fit,
  focusX,
  focusY,
  onFitChange,
  onFocusChange,
}: ThumbnailSettingsProps) {
  const [localFocusX, setLocalFocusX] = useState(focusX);
  const [localFocusY, setLocalFocusY] = useState(focusY);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setLocalFocusX(x);
    setLocalFocusY(y);
    onFocusChange(x, y);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="absolute top-2 right-2 z-10 p-1.5 rounded-md bg-background/80 backdrop-blur-sm border border-border text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100">
          <Crosshair className="w-3.5 h-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="end">
        <p className="text-xs font-semibold text-foreground mb-2">Thumbnail Display</p>

        {/* Fit mode */}
        <div className="flex gap-1 mb-3">
          {fitOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => onFitChange(opt.value)}
              className={`flex-1 flex flex-col items-center gap-1 px-1.5 py-1.5 rounded-md text-[10px] font-medium transition-colors ${
                fit === opt.value
                  ? 'bg-primary/15 text-primary border border-primary/30'
                  : 'bg-secondary text-muted-foreground border border-border hover:text-foreground'
              }`}
            >
              <opt.icon className="w-3 h-3" />
              {opt.label}
            </button>
          ))}
        </div>

        {/* Focus point picker */}
        {thumbnailUrl && (
          <>
            <p className="text-[10px] text-muted-foreground mb-1.5">Click to set focus point</p>
            <div
              className="relative w-full aspect-video rounded-md overflow-hidden border border-border cursor-crosshair"
              onClick={handleImageClick}
            >
              <img
                src={thumbnailUrl}
                alt="Focus preview"
                className="w-full h-full"
                style={{
                  objectFit: fit === 'auto' ? 'scale-down' : fit,
                  objectPosition: `${localFocusX}% ${localFocusY}%`,
                }}
              />
              {/* Crosshair indicator */}
              <div
                className="absolute w-5 h-5 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{ left: `${localFocusX}%`, top: `${localFocusY}%` }}
              >
                <div className="absolute inset-0 rounded-full border-2 border-primary shadow-lg" />
                <div className="absolute top-1/2 left-0 w-full h-px bg-primary/60" />
                <div className="absolute left-1/2 top-0 h-full w-px bg-primary/60" />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 text-center">
              {localFocusX}% × {localFocusY}%
            </p>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
