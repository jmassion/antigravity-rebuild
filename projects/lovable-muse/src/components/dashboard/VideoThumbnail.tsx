import { useRef, useState, useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface VideoThumbnailProps {
  src: string;
  poster?: string | null;
  alt?: string;
  className?: string;
  onClickPlay?: () => void;
}

export default function VideoThumbnail({ src, poster, alt, className = '', onClickPlay }: VideoThumbnailProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [hovering, setHovering] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setHovering(true);
    const v = videoRef.current;
    if (v) {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHovering(false);
    const v = videoRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
  }, []);

  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setMuted(prev => !prev);
  }, []);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClickPlay}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster || undefined}
        muted={muted}
        loop
        playsInline
        preload="metadata"
        className="w-full h-full object-cover"
      />

      {/* Sound toggle - only visible on hover */}
      {hovering && (
        <button
          onClick={toggleMute}
          className="absolute bottom-2 left-2 p-1 rounded-md bg-card/80 backdrop-blur text-foreground hover:bg-card transition-colors z-10"
          title={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
      )}

      {/* Play indicator when not hovering */}
      {!hovering && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-card/70 backdrop-blur flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-foreground ml-0.5" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
