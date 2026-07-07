import React from 'react';
import type { Transform } from './useCanvasTransform';

const PHASE_COLORS: Record<string, string> = {
  start: '#eab308',
  build: '#0ea5e9',
  grow: '#22c55e',
};

interface CardPos {
  path: string;
  x: number;
  y: number;
  phase: string | null;
}

interface Props {
  cards: CardPos[];
  transform: Transform;
  containerW: number;
  containerH: number;
  onJump: (x: number, y: number) => void;
}

export default function CanvasMinimap({ cards, transform, containerW, containerH, onJump }: Props) {
  if (!cards.length) return null;

  const xs = cards.map(c => c.x);
  const ys = cards.map(c => c.y);
  const minX = Math.min(...xs) - 200;
  const minY = Math.min(...ys) - 200;
  const maxX = Math.max(...xs) + 480;
  const maxY = Math.max(...ys) + 380;
  const worldW = maxX - minX;
  const worldH = maxY - minY;

  const mmW = 180;
  const mmH = 110;
  const scale = Math.min(mmW / worldW, mmH / worldH);

  // Viewport rect in minimap coords
  const vpX = (-transform.x / transform.zoom - minX) * scale;
  const vpY = (-transform.y / transform.zoom - minY) * scale;
  const vpW = (containerW / transform.zoom) * scale;
  const vpH = (containerH / transform.zoom) * scale;

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const worldX = mx / scale + minX;
    const worldY = my / scale + minY;
    onJump(worldX, worldY);
  };

  return (
    <div className="absolute bottom-4 right-4 z-50 rounded-lg border border-border bg-card/90 backdrop-blur-sm shadow-lg overflow-hidden">
      <svg
        width={mmW}
        height={mmH}
        className="cursor-crosshair"
        onClick={handleClick}
      >
        {/* Card dots */}
        {cards.map(c => (
          <circle
            key={c.path}
            cx={(c.x - minX) * scale + 4}
            cy={(c.y - minY) * scale + 4}
            r={3}
            fill={c.phase ? PHASE_COLORS[c.phase] ?? '#888' : '#888'}
            opacity={0.8}
          />
        ))}
        {/* Viewport rect */}
        <rect
          x={vpX}
          y={vpY}
          width={Math.max(vpW, 10)}
          height={Math.max(vpH, 6)}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={1.5}
          rx={2}
          opacity={0.7}
        />
      </svg>
    </div>
  );
}
