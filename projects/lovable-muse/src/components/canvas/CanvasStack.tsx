import React from 'react';
import { ChevronLeft, ChevronRight, Unlink } from 'lucide-react';
import type { CanvasCardData } from './CanvasCard';

interface Props {
  cards: CanvasCardData[];
  activeIndex: number;
  x: number;
  y: number;
  onPrev: () => void;
  onNext: () => void;
  onUnstack: () => void;
}

export default function CanvasStack({ cards, activeIndex, x, y, onPrev, onNext, onUnstack }: Props) {
  if (cards.length <= 1) return null;

  return (
    <div
      className="absolute pointer-events-none"
      style={{ left: x - 8, top: y - 8 }}
    >
      {/* Stacked shadow layers */}
      {[2, 1].map(offset => (
        <div
          key={offset}
          className="absolute rounded-xl border border-border bg-card/50"
          style={{
            width: 280,
            height: 180,
            left: offset * 4,
            top: offset * 4,
            opacity: 0.4,
          }}
        />
      ))}

      {/* Controls overlay */}
      <div
        className="absolute top-0 left-0 flex items-end justify-between pointer-events-auto"
        style={{ width: 296, height: 196 }}
      >
        <div className="flex gap-1 p-2">
          <button
            onClick={onPrev}
            disabled={activeIndex === 0}
            className="p-1 rounded bg-secondary/80 hover:bg-secondary disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
          <span className="text-[10px] font-mono text-muted-foreground self-center px-1">
            {activeIndex + 1}/{cards.length}
          </span>
          <button
            onClick={onNext}
            disabled={activeIndex === cards.length - 1}
            className="p-1 rounded bg-secondary/80 hover:bg-secondary disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <button
          onClick={onUnstack}
          className="p-1.5 m-2 rounded bg-destructive/10 hover:bg-destructive/20 transition-colors"
          title="Unstack"
        >
          <Unlink className="w-3 h-3 text-destructive" />
        </button>
      </div>
    </div>
  );
}
