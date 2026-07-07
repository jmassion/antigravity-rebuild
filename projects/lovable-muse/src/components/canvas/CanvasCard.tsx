import React, { useState, useRef, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, Minimize2, ExternalLink, Loader2, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Lazy-load page components for expanded mode
const ROUTE_COMPONENTS: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  '/': lazy(() => import('@/pages/Index')),
  '/projects': lazy(() => import('@/pages/Projects')),
  '/assets': lazy(() => import('@/pages/Assets')),
  '/uploads': lazy(() => import('@/pages/Uploads')),
  '/storyboards': lazy(() => import('@/pages/Storyboards')),
  '/connections': lazy(() => import('@/pages/Connections')),
  '/docs': lazy(() => import('@/pages/Docs')),
  '/tasks': lazy(() => import('@/pages/Tasks')),
  '/settings': lazy(() => import('@/pages/Settings')),
  '/team': lazy(() => import('@/pages/Team')),
  '/start/characters': lazy(() => import('@/pages/Characters')),
  '/start/style-guides': lazy(() => import('@/pages/StyleGuides')),
  '/start/worlds': lazy(() => import('@/pages/Worlds')),
  '/start/prompts': lazy(() => import('@/pages/Prompts')),
  '/plans': lazy(() => import('@/pages/Plans')),
  '/provenance': lazy(() => import('@/pages/Provenance')),
  '/links': lazy(() => import('@/pages/Links')),
  '/grow/campaigns': lazy(() => import('@/pages/Campaigns')),
  '/grow/marketing': lazy(() => import('@/pages/MarketingAssets')),
};

const PHASE_COLORS: Record<string, string> = {
  start: 'hsl(var(--phase-start, 45 93% 47%))',
  build: 'hsl(var(--phase-build, 199 89% 48%))',
  grow: 'hsl(var(--phase-grow, 142 71% 45%))',
};

export interface CanvasCardData {
  path: string;
  label: string;
  icon: React.ElementType;
  phase: string | null;
}

interface Props {
  data: CanvasCardData;
  x: number;
  y: number;
  z: number;
  zoom: number;
  expanded: boolean;
  /** Card is expanded in state but off-screen — render placeholder instead of page */
  offscreenExpanded?: boolean;
  stackCount?: number;
  onDrag: (path: string, dx: number, dy: number) => void;
  onDragEnd: (path: string) => void;
  onExpand: (path: string) => void;
  onContextMenu: (e: React.MouseEvent, path: string) => void;
  onNavigate: (path: string) => void;
  onFullscreen: (path: string) => void;
  /** Magnetic alignment guides to render */
  alignGuides?: { axis: 'x' | 'y'; value: number } | null;
}

const GRID = 32;
const snap = (v: number) => Math.round(v / GRID) * GRID;

const CanvasCard = React.memo(function CanvasCard({
  data, x, y, z, zoom, expanded, offscreenExpanded, stackCount, onDrag, onDragEnd, onExpand, onContextMenu, onNavigate, onFullscreen,
}: Props) {
  const dragging = useRef(false);
  const dragStart = useRef({ mx: 0, my: 0, ox: 0, oy: 0 });
  const hasMoved = useRef(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    dragging.current = true;
    hasMoved.current = false;
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: x, oy: y };

    const move = (ev: MouseEvent) => {
      if (!dragging.current) return;
      const dx = (ev.clientX - dragStart.current.mx) / zoom;
      const dy = (ev.clientY - dragStart.current.my) / zoom;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasMoved.current = true;
      onDrag(data.path, snap(dragStart.current.ox + dx), snap(dragStart.current.oy + dy));
    };
    const up = () => {
      dragging.current = false;
      onDragEnd(data.path);
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  }, [x, y, zoom, data.path, onDrag, onDragEnd]);

  const handleClick = useCallback(() => {
    if (!hasMoved.current) onExpand(data.path);
  }, [data.path, onExpand]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onFullscreen(data.path);
  }, [data.path, onFullscreen]);

  const Icon = data.icon;
  const phaseColor = data.phase ? PHASE_COLORS[data.phase] : 'hsl(var(--muted-foreground))';
  const w = expanded ? 900 : 280;
  const h = expanded ? 600 : 180;
  const shouldRenderPage = expanded && !offscreenExpanded;
  const PageComponent = shouldRenderPage ? ROUTE_COMPONENTS[data.path] : null;

  return (
    <motion.div
      className={cn(
        'absolute rounded-xl border shadow-lg cursor-grab active:cursor-grabbing select-none',
        'bg-card text-card-foreground overflow-hidden',
        expanded && 'ring-2 ring-primary/30',
      )}
      style={{
        left: x,
        top: y,
        width: w,
        height: h,
        zIndex: z + (expanded ? 100 : 0),
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={(e) => { e.preventDefault(); onContextMenu(e, data.path); }}
      initial={false}
      animate={{ width: w, height: h }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {/* Phase color bar */}
      <div className="h-1 w-full" style={{ background: phaseColor }} />

      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
        <Icon className="w-4 h-4 shrink-0" style={{ color: phaseColor }} />
        <span className="text-xs font-semibold truncate flex-1">{data.label}</span>
        {stackCount && stackCount > 1 && (
          <span className="text-[10px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded-full font-mono">
            {stackCount}
          </span>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onExpand(data.path); }}
          className="p-1 rounded hover:bg-accent transition-colors"
        >
          {expanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate(data.path); }}
          className="p-1 rounded hover:bg-accent transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {/* Content */}
      {expanded && PageComponent ? (
        <div
          className="relative overflow-hidden"
          style={{ width: 900, height: 600 - 42 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              width: 1400,
              height: 900,
              transform: 'scale(0.64)',
              transformOrigin: 'top left',
              pointerEvents: 'auto',
            }}
          >
            <Suspense fallback={
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            }>
              <PageComponent />
            </Suspense>
          </div>
        </div>
      ) : expanded && offscreenExpanded ? (
        /* Off-screen expanded placeholder — avoids mounting heavy page components */
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6">
          <Icon className="w-10 h-10 opacity-20" style={{ color: phaseColor }} />
          <span className="text-sm text-muted-foreground font-medium">{data.label}</span>
          <span className="text-[10px] text-muted-foreground/60">Off-screen — content paused</span>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6">
          <Icon className="w-10 h-10 opacity-20" style={{ color: phaseColor }} />
          <span className="text-sm text-muted-foreground font-medium">{data.label}</span>
          {data.phase && (
            <span
              className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full"
              style={{ color: phaseColor, background: `color-mix(in srgb, ${phaseColor} 15%, transparent)` }}
            >
              {data.phase}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
});

export default CanvasCard;

/** Fullscreen overlay that renders a page at true viewport size */
export function CanvasFullscreenOverlay({
  path,
  label,
  onClose,
}: {
  path: string;
  label: string;
  onClose: () => void;
}) {
  const PageComponent = ROUTE_COMPONENTS[path];
  if (!PageComponent) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="fullscreen-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] bg-background flex flex-col"
      >
        {/* Floating back button */}
        <div className="absolute top-4 left-4 z-[301]">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="shadow-lg border border-border gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Canvas
          </Button>
          <span className="ml-3 text-sm text-muted-foreground font-medium">{label}</span>
        </div>

        {/* Full page render */}
        <div className="flex-1 overflow-auto pt-14">
          <Suspense fallback={
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          }>
            <PageComponent />
          </Suspense>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
