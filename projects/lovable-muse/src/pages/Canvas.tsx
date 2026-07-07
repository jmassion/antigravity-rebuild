import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  LayoutDashboard, FolderOpen, Film, Image, Megaphone, Palette, BookOpen,
  Globe, Settings, Upload, Users, Network, CheckSquare, ClipboardList,
  GitBranchPlus, ZoomIn, ZoomOut, Maximize, LayoutGrid, Columns3,
  ArrowLeft, Save, Loader2, Monitor, Sun, Moon,
} from 'lucide-react';
import { useCanvasTransform } from '@/components/canvas/useCanvasTransform';
import CanvasCard, { type CanvasCardData, CanvasFullscreenOverlay } from '@/components/canvas/CanvasCard';
import CanvasStack from '@/components/canvas/CanvasStack';
import CanvasMinimap from '@/components/canvas/CanvasMinimap';
import CanvasContextMenu from '@/components/canvas/CanvasContextMenu';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const CANVAS_PAGES: CanvasCardData[] = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, phase: null },
  { path: '/projects', label: 'All Projects', icon: FolderOpen, phase: null },
  { path: '/uploads', label: 'Uploads', icon: Upload, phase: null },
  { path: '/tasks', label: 'Tasks', icon: CheckSquare, phase: null },
  { path: '/team', label: 'Team', icon: Users, phase: null },
  { path: '/start/characters', label: 'Characters', icon: Users, phase: 'start' },
  { path: '/start/style-guides', label: 'Style Guides', icon: Palette, phase: 'start' },
  { path: '/start/worlds', label: 'Worlds & Props', icon: Globe, phase: 'start' },
  { path: '/start/prompts', label: 'Prompts', icon: BookOpen, phase: 'start' },
  { path: '/storyboards', label: 'Storyboards', icon: Film, phase: 'build' },
  { path: '/plans', label: 'Plans', icon: ClipboardList, phase: 'build' },
  { path: '/assets', label: 'Asset Library', icon: Image, phase: 'build' },
  { path: '/connections', label: 'Connections', icon: Network, phase: 'build' },
  { path: '/provenance', label: 'Provenance', icon: GitBranchPlus, phase: 'build' },
  { path: '/links', label: 'Links & Tools', icon: Globe, phase: 'build' },
  { path: '/grow/campaigns', label: 'Campaigns', icon: Megaphone, phase: 'grow' },
  { path: '/grow/marketing', label: 'Marketing Assets', icon: Image, phase: 'grow' },
  { path: '/docs', label: 'Docs', icon: BookOpen, phase: null },
  { path: '/settings', label: 'Settings', icon: Settings, phase: null },
];

type CardState = Record<string, { x: number; y: number; z: number; expanded: boolean; stackId: string | null }>;
type StackState = Record<string, { x: number; y: number; cards: string[]; activeIndex: number }>;
type Spacing = 'compact' | 'comfortable' | 'spacious';
type CanvasTheme = 'system' | 'light' | 'dark';

const MAX_EXPANDED = 2;

const SPACING_GAP: Record<Spacing, { x: number; y: number }> = {
  compact: { x: 320, y: 220 },
  comfortable: { x: 400, y: 260 },
  spacious: { x: 500, y: 320 },
};

const SNAP_THRESHOLD = 12;

function generatePhaseLayout(spacing: Spacing): CardState {
  const gap = SPACING_GAP[spacing];
  const cards: CardState = {};
  const groups: Record<string, CanvasCardData[]> = { general: [], start: [], build: [], grow: [] };
  CANVAS_PAGES.forEach(p => groups[p.phase ?? 'general'].push(p));

  ['general', 'start', 'build', 'grow'].forEach((group, colIdx) => {
    groups[group].forEach((page, rowIdx) => {
      cards[page.path] = {
        x: 100 + colIdx * gap.x,
        y: 100 + rowIdx * gap.y,
        z: 0,
        expanded: false,
        stackId: null,
      };
    });
  });
  return cards;
}

function useResolvedTheme(canvasTheme: CanvasTheme): 'light' | 'dark' {
  const [systemPrefers, setSystemPrefers] = useState<'light' | 'dark'>('dark');
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    setSystemPrefers(mq.matches ? 'light' : 'dark');
    const handler = (e: MediaQueryListEvent) => setSystemPrefers(e.matches ? 'light' : 'dark');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  if (canvasTheme === 'system') return systemPrefers;
  return canvasTheme;
}

export default function Canvas() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const showDebug = searchParams.has('debug');
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [cards, setCards] = useState<CardState>(() => generatePhaseLayout('comfortable'));
  const [stacks, setStacks] = useState<StackState>({});
  const [spacing, setSpacing] = useState<Spacing>('comfortable');
  const [canvasTheme, setCanvasTheme] = useState<CanvasTheme>('system');
  const resolvedTheme = useResolvedTheme(canvasTheme);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; path: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [layoutId, setLayoutId] = useState<string | null>(null);
  const [fullscreenPath, setFullscreenPath] = useState<string | null>(null);
  const [alignGuides, setAlignGuides] = useState<{ x?: number; y?: number } | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();
  const transformDirty = useRef(false);
  const expandOrder = useRef<string[]>([]); // tracks expand order for max-expand limit
  const renderStart = useRef(performance.now());
  renderStart.current = performance.now();

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const { transform, setTransform, onMouseDown, onMouseMove, onMouseUp, fitToView, isPanning } = useCanvasTransform(canvasContainerRef);

  // Load saved layout
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('canvas_layouts' as any)
        .select('*')
        .eq('owner_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1);
      if (data && (data as any[]).length > 0) {
        const row = (data as any[])[0];
        setLayoutId(row.id);
        const layout = row.layout as any;
        if (layout?.cards && Object.keys(layout.cards).length > 0) {
          setCards(layout.cards);
        }
        if (layout?.stacks) setStacks(layout.stacks);
        if (layout?.spacing) setSpacing(layout.spacing);
        if (layout?.canvasTheme) setCanvasTheme(layout.canvasTheme);
        if (row.viewport) {
          setTransform(row.viewport as any);
        }
      }
    })();
  }, [user]);

  // Debounced save — 2000ms debounce, only saves when dirty
  const doSave = useCallback(async () => {
    if (!user) return;
    setSaving(true);
    const payload = {
      owner_id: user.id,
      name: 'Default',
      layout: { cards, stacks, spacing, canvasTheme } as any,
      viewport: transform as any,
    };
    if (layoutId) {
      await supabase.from('canvas_layouts' as any).update(payload).eq('id', layoutId);
    } else {
      const { data } = await supabase.from('canvas_layouts' as any).insert(payload).select('id');
      if (data && (data as any[])[0]) setLayoutId((data as any[])[0].id);
    }
    setSaving(false);
    transformDirty.current = false;
  }, [user, cards, stacks, spacing, canvasTheme, transform, layoutId]);

  const scheduleSave = useCallback(() => {
    if (!user) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(doSave, 2000);
  }, [doSave, user]);

  // Save on cards, stacks, spacing, canvasTheme changes
  useEffect(() => { scheduleSave(); }, [cards, stacks, spacing, canvasTheme]);

  // Mark transform dirty on changes, flush on mouseup/idle
  useEffect(() => { transformDirty.current = true; }, [transform]);
  const flushTransformSave = useCallback(() => {
    if (transformDirty.current) scheduleSave();
  }, [scheduleSave]);

  // Auto-collapse all cards when zoom < 0.3
  useEffect(() => {
    if (transform.zoom < 0.3) {
      setCards(prev => {
        const anyExpanded = Object.values(prev).some(c => c.expanded);
        if (!anyExpanded) return prev;
        const next = { ...prev };
        for (const key of Object.keys(next)) {
          if (next[key].expanded) next[key] = { ...next[key], expanded: false };
        }
        return next;
      });
    }
  }, [transform.zoom]);

  // Throttled magnetic snapping
  const lastSnapTime = useRef(0);
  const computeSnap = useCallback((path: string, nx: number, ny: number): { x: number; y: number } => {
    const now = performance.now();
    if (now - lastSnapTime.current < 32) return { x: nx, y: ny }; // throttle to ~30fps
    lastSnapTime.current = now;

    let snapX = nx;
    let snapY = ny;
    let guideX: number | undefined;
    let guideY: number | undefined;

    for (const [p, c] of Object.entries(cards)) {
      if (p === path) continue;
      if (c.stackId) continue;
      if (Math.abs(c.x - nx) < SNAP_THRESHOLD) { snapX = c.x; guideX = c.x; }
      if (Math.abs(c.y - ny) < SNAP_THRESHOLD) { snapY = c.y; guideY = c.y; }
    }

    setAlignGuides(guideX !== undefined || guideY !== undefined ? { x: guideX, y: guideY } : null);
    return { x: snapX, y: snapY };
  }, [cards]);

  const onDrag = useCallback((path: string, nx: number, ny: number) => {
    const snapped = computeSnap(path, nx, ny);
    setCards(prev => ({ ...prev, [path]: { ...prev[path], x: snapped.x, y: snapped.y } }));
  }, [computeSnap]);

  const onDragEnd = useCallback((path: string) => {
    setAlignGuides(null);
    flushTransformSave();
    const c = cards[path];
    if (!c) return;
    for (const [p, other] of Object.entries(cards)) {
      if (p === path || other.stackId) continue;
      const dx = Math.abs(c.x - other.x);
      const dy = Math.abs(c.y - other.y);
      if (dx < 60 && dy < 60) {
        createStack(path, p);
        break;
      }
    }
  }, [cards, flushTransformSave]);

  const createStack = useCallback((pathA: string, pathB: string) => {
    const stackId = `stack-${Date.now()}`;
    const pos = cards[pathB] || cards[pathA];
    setStacks(prev => ({
      ...prev,
      [stackId]: { x: pos.x, y: pos.y, cards: [pathB, pathA], activeIndex: 0 },
    }));
    setCards(prev => ({
      ...prev,
      [pathA]: { ...prev[pathA], x: pos.x, y: pos.y, stackId },
      [pathB]: { ...prev[pathB], stackId },
    }));
  }, [cards]);

  // Expand with max-2 limit
  const onExpand = useCallback((path: string) => {
    setCards(prev => {
      const wasExpanded = prev[path].expanded;
      const next = { ...prev, [path]: { ...prev[path], expanded: !wasExpanded } };

      if (!wasExpanded) {
        // Expanding — enforce max limit
        expandOrder.current = [...expandOrder.current.filter(p => p !== path), path];
        const expandedPaths = Object.entries(next).filter(([, c]) => c.expanded).map(([p]) => p);
        if (expandedPaths.length > MAX_EXPANDED) {
          const oldest = expandOrder.current.find(p => next[p]?.expanded && p !== path);
          if (oldest) {
            next[oldest] = { ...next[oldest], expanded: false };
            expandOrder.current = expandOrder.current.filter(p => p !== oldest);
            const label = CANVAS_PAGES.find(pg => pg.path === oldest)?.label ?? oldest;
            setTimeout(() => toast({ title: `Collapsed "${label}"`, description: `Max ${MAX_EXPANDED} expanded cards at once` }), 0);
          }
        }
      } else {
        expandOrder.current = expandOrder.current.filter(p => p !== path);
      }

      return next;
    });
  }, []);

  const onFullscreen = useCallback((path: string) => {
    setFullscreenPath(path);
  }, []);

  const onContextMenu = useCallback((e: React.MouseEvent, path: string) => {
    setContextMenu({ x: e.clientX, y: e.clientY, path });
  }, []);

  const onNavigate = useCallback((path: string) => navigate(path), [navigate]);

  const autoArrangePhase = useCallback(() => {
    setCards(generatePhaseLayout(spacing));
  }, [spacing]);

  const autoArrangeWorkflow = useCallback(() => {
    const gap = SPACING_GAP[spacing];
    const newCards: CardState = {};
    CANVAS_PAGES.forEach((p, i) => {
      newCards[p.path] = {
        x: 100 + (i % 5) * gap.x,
        y: 100 + Math.floor(i / 5) * gap.y,
        z: 0,
        expanded: false,
        stackId: null,
      };
    });
    setCards(newCards);
  }, [spacing]);

  const handleFitToView = useCallback(() => {
    if (!containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    const positions = Object.values(cards).map(c => ({ x: c.x, y: c.y }));
    fitToView(positions, r.width, r.height);
  }, [cards, fitToView]);

  const bringToFront = useCallback((path: string) => {
    const maxZ = Math.max(...Object.values(cards).map(c => c.z));
    setCards(prev => ({ ...prev, [path]: { ...prev[path], z: maxZ + 1 } }));
  }, [cards]);

  const sendToBack = useCallback((path: string) => {
    const minZ = Math.min(...Object.values(cards).map(c => c.z));
    setCards(prev => ({ ...prev, [path]: { ...prev[path], z: minZ - 1 } }));
  }, [cards]);

  const resetPosition = useCallback((path: string) => {
    const def = generatePhaseLayout(spacing);
    if (def[path]) setCards(prev => ({ ...prev, [path]: def[path] }));
  }, [spacing]);

  const unstackCard = useCallback((path: string) => {
    const c = cards[path];
    if (!c?.stackId) return;
    const stackId = c.stackId;
    setStacks(prev => {
      const stack = prev[stackId];
      if (!stack) return prev;
      const remaining = stack.cards.filter(p => p !== path);
      if (remaining.length <= 1) {
        const next = { ...prev };
        delete next[stackId];
        if (remaining.length === 1) {
          setCards(pc => ({ ...pc, [remaining[0]]: { ...pc[remaining[0]], stackId: null } }));
        }
        return next;
      }
      return {
        ...prev,
        [stackId]: { ...stack, cards: remaining, activeIndex: Math.min(stack.activeIndex, remaining.length - 1) },
      };
    });
    setCards(prev => ({
      ...prev,
      [path]: { ...prev[path], stackId: null, x: prev[path].x + 64, y: prev[path].y + 64 },
    }));
  }, [cards]);

  const stackWith = useCallback((pathA: string, pathB: string) => {
    createStack(pathA, pathB);
  }, [createStack]);

  const getNearbyCards = useCallback((path: string): CanvasCardData[] => {
    const c = cards[path];
    if (!c) return [];
    return CANVAS_PAGES.filter(p => {
      if (p.path === path) return false;
      const other = cards[p.path];
      if (!other || other.stackId) return false;
      const dist = Math.sqrt((c.x - other.x) ** 2 + (c.y - other.y) ** 2);
      return dist < 600;
    });
  }, [cards]);

  // Viewport culling — returns cards + offscreenExpanded flag
  const visibleCardsWithFlags = useMemo(() => {
    const r = containerRef.current?.getBoundingClientRect();
    const containerW = r?.width ?? 1920;
    const containerH = r?.height ?? 1080;
    const margin = 200;

    return CANVAS_PAGES.map(p => {
      const c = cards[p.path];
      if (!c) return { page: p, visible: true, offscreenExpanded: false };
      if (c.stackId) return { page: p, visible: false, offscreenExpanded: false };
      const sx = c.x * transform.zoom + transform.x;
      const sy = c.y * transform.zoom + transform.y;
      const sw = (c.expanded ? 900 : 280) * transform.zoom;
      const sh = (c.expanded ? 600 : 180) * transform.zoom;
      const inView = sx + sw > -margin && sx < containerW + margin && sy + sh > -margin && sy < containerH + margin;
      return {
        page: p,
        visible: inView || c.expanded, // keep expanded cards in DOM but flag off-screen
        offscreenExpanded: c.expanded && !inView,
      };
    }).filter(v => v.visible);
  }, [cards, transform]);

  // Phase connections
  const connections = useMemo(() => {
    const phaseOrder = ['start', 'build', 'grow'];
    const lines: { from: string; to: string }[] = [];
    for (let i = 0; i < phaseOrder.length - 1; i++) {
      const fromPages = CANVAS_PAGES.filter(p => p.phase === phaseOrder[i]);
      const toPages = CANVAS_PAGES.filter(p => p.phase === phaseOrder[i + 1]);
      if (fromPages.length && toPages.length) {
        lines.push({ from: fromPages[0].path, to: toPages[0].path });
      }
    }
    return lines;
  }, []);

  // Dynamic SVG bounds from card positions
  const svgBounds = useMemo(() => {
    const positions = Object.values(cards);
    if (!positions.length) return { x: 0, y: 0, w: 3000, h: 3000 };
    const xs = positions.map(c => c.x);
    const ys = positions.map(c => c.y);
    const pad = 500;
    const minX = Math.min(...xs) - pad;
    const minY = Math.min(...ys) - pad;
    const maxX = Math.max(...xs) + 1000 + pad;
    const maxY = Math.max(...ys) + 700 + pad;
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
  }, [cards]);

  const activeStacks = useMemo(() => {
    return Object.entries(stacks).map(([id, stack]) => {
      const stackCards = stack.cards.map(p => CANVAS_PAGES.find(pg => pg.path === p)).filter(Boolean) as CanvasCardData[];
      return { id, ...stack, cardData: stackCards };
    });
  }, [stacks]);

  const expandedCount = useMemo(() => Object.values(cards).filter(c => c.expanded).length, [cards]);
  const fullscreenLabel = fullscreenPath ? CANVAS_PAGES.find(p => p.path === fullscreenPath)?.label ?? '' : '';

  // Flush transform save on canvas mouseup
  const handleCanvasMouseUp = useCallback(() => {
    onMouseUp();
    flushTransformSave();
  }, [onMouseUp, flushTransformSave]);

  return (
    <div
      className={cn('fixed inset-0 bg-background overflow-hidden', resolvedTheme === 'light' && 'canvas-light')}
      ref={containerRef}
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)`,
          backgroundSize: `${32 * transform.zoom}px ${32 * transform.zoom}px`,
          backgroundPosition: `${transform.x}px ${transform.y}px`,
          opacity: Math.min(transform.zoom, 0.4),
        }}
      />

      {/* Toolbar */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center gap-2 px-4 py-3 bg-background/80 backdrop-blur-md border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-1.5">
          <LayoutGrid className="w-4 h-4 text-primary" />
          <span className="font-bold text-sm tracking-wide">CANVAS</span>
        </div>

        <div className="h-5 w-px bg-border mx-2" />

        <Button variant="outline" size="sm" onClick={() => setTransform(prev => ({ ...prev, zoom: Math.min(3, prev.zoom * 1.2) }))}>
          <ZoomIn className="w-3.5 h-3.5" />
        </Button>
        <span className="text-xs font-mono text-muted-foreground w-12 text-center">
          {Math.round(transform.zoom * 100)}%
        </span>
        <Button variant="outline" size="sm" onClick={() => setTransform(prev => ({ ...prev, zoom: Math.max(0.1, prev.zoom / 1.2) }))}>
          <ZoomOut className="w-3.5 h-3.5" />
        </Button>
        <Button variant="outline" size="sm" onClick={handleFitToView}>
          <Maximize className="w-3.5 h-3.5 mr-1" /> Fit
        </Button>

        <div className="h-5 w-px bg-border mx-2" />

        <Button variant="outline" size="sm" onClick={autoArrangePhase}>
          <Columns3 className="w-3.5 h-3.5 mr-1" /> By Phase
        </Button>
        <Button variant="outline" size="sm" onClick={autoArrangeWorkflow}>
          <LayoutGrid className="w-3.5 h-3.5 mr-1" /> Grid
        </Button>

        <div className="h-5 w-px bg-border mx-2" />

        {(['compact', 'comfortable', 'spacious'] as Spacing[]).map(s => (
          <Button
            key={s}
            variant={spacing === s ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSpacing(s)}
            className="text-xs capitalize"
          >
            {s}
          </Button>
        ))}

        <div className="h-5 w-px bg-border mx-2" />

        {/* Theme toggle */}
        <ToggleGroup
          type="single"
          value={canvasTheme}
          onValueChange={(v) => v && setCanvasTheme(v as CanvasTheme)}
          size="sm"
          variant="outline"
        >
          <ToggleGroupItem value="system" aria-label="System theme">
            <Monitor className="w-3.5 h-3.5" />
          </ToggleGroupItem>
          <ToggleGroupItem value="light" aria-label="Light theme">
            <Sun className="w-3.5 h-3.5" />
          </ToggleGroupItem>
          <ToggleGroupItem value="dark" aria-label="Dark theme">
            <Moon className="w-3.5 h-3.5" />
          </ToggleGroupItem>
        </ToggleGroup>

        <div className="flex-1" />

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {saving ? (
            <><Loader2 className="w-3 h-3 animate-spin" /> Saving...</>
          ) : (
            <><Save className="w-3 h-3" /> Saved</>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasContainerRef}
        className={cn('absolute inset-0 pt-14', isPanning.current && 'cursor-grabbing')}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
      >
        <div
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
            transformOrigin: '0 0',
            willChange: 'transform',
          }}
        >
          {/* Connection lines — dynamic SVG bounds */}
          <svg
            className="absolute pointer-events-none"
            style={{ left: svgBounds.x, top: svgBounds.y, width: svgBounds.w, height: svgBounds.h, overflow: 'visible' }}
            viewBox={`${svgBounds.x} ${svgBounds.y} ${svgBounds.w} ${svgBounds.h}`}
          >
            {connections.map(conn => {
              const from = cards[conn.from];
              const to = cards[conn.to];
              if (!from || !to) return null;
              const fx = from.x + 280;
              const fy = from.y + 90;
              const tx = to.x;
              const ty = to.y + 90;
              const midX = (fx + tx) / 2;
              return (
                <path
                  key={`${conn.from}-${conn.to}`}
                  d={`M ${fx} ${fy} C ${midX} ${fy}, ${midX} ${ty}, ${tx} ${ty}`}
                  fill="none"
                  stroke="hsl(var(--border))"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  opacity={0.5}
                />
              );
            })}

            {/* Magnetic alignment guides */}
            {alignGuides?.x !== undefined && (
              <line
                x1={alignGuides.x}
                y1={svgBounds.y}
                x2={alignGuides.x}
                y2={svgBounds.y + svgBounds.h}
                stroke="hsl(var(--primary))"
                strokeWidth={1}
                strokeDasharray="4 4"
                opacity={0.5}
              />
            )}
            {alignGuides?.y !== undefined && (
              <line
                x1={svgBounds.x}
                y1={alignGuides.y}
                x2={svgBounds.x + svgBounds.w}
                y2={alignGuides.y}
                stroke="hsl(var(--primary))"
                strokeWidth={1}
                strokeDasharray="4 4"
                opacity={0.5}
              />
            )}
          </svg>

          {/* Stack visuals */}
          {activeStacks.map(stack => (
            <CanvasStack
              key={stack.id}
              cards={stack.cardData}
              activeIndex={stack.activeIndex}
              x={stack.x}
              y={stack.y}
              onPrev={() => setStacks(prev => ({
                ...prev,
                [stack.id]: { ...prev[stack.id], activeIndex: Math.max(0, prev[stack.id].activeIndex - 1) },
              }))}
              onNext={() => setStacks(prev => ({
                ...prev,
                [stack.id]: { ...prev[stack.id], activeIndex: Math.min(prev[stack.id].cards.length - 1, prev[stack.id].activeIndex + 1) },
              }))}
              onUnstack={() => {
                const stackCards = stacks[stack.id]?.cards ?? [];
                stackCards.forEach((p, i) => {
                  setCards(prev => ({
                    ...prev,
                    [p]: { ...prev[p], stackId: null, x: stack.x + i * 64, y: stack.y + i * 64 },
                  }));
                });
                setStacks(prev => {
                  const next = { ...prev };
                  delete next[stack.id];
                  return next;
                });
              }}
            />
          ))}

          {/* Cards */}
          {visibleCardsWithFlags.map(({ page, offscreenExpanded }) => {
            const c = cards[page.path];
            if (!c) return null;
            return (
              <CanvasCard
                key={page.path}
                data={page}
                x={c.x}
                y={c.y}
                z={c.z}
                zoom={transform.zoom}
                expanded={c.expanded}
                offscreenExpanded={offscreenExpanded}
                onDrag={onDrag}
                onDragEnd={onDragEnd}
                onExpand={onExpand}
                onFullscreen={onFullscreen}
                onContextMenu={onContextMenu}
                onNavigate={onNavigate}
              />
            );
          })}
        </div>
      </div>

      {/* Minimap */}
      <CanvasMinimap
        cards={Object.entries(cards).map(([path, c]) => ({
          path,
          x: c.x,
          y: c.y,
          phase: CANVAS_PAGES.find(p => p.path === path)?.phase ?? null,
        }))}
        transform={transform}
        containerW={containerRef.current?.clientWidth ?? 1200}
        containerH={containerRef.current?.clientHeight ?? 800}
        onJump={(wx, wy) => {
          const cw = containerRef.current?.clientWidth ?? 1200;
          const ch = containerRef.current?.clientHeight ?? 800;
          setTransform(prev => ({
            ...prev,
            x: cw / 2 - wx * prev.zoom,
            y: ch / 2 - wy * prev.zoom,
          }));
        }}
      />

      {/* Context Menu */}
      {contextMenu && (
        <CanvasContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          path={contextMenu.path}
          expanded={cards[contextMenu.path]?.expanded ?? false}
          inStack={!!cards[contextMenu.path]?.stackId}
          nearbyCards={getNearbyCards(contextMenu.path)}
          onClose={() => setContextMenu(null)}
          onNavigate={onNavigate}
          onExpand={onExpand}
          onFullscreen={onFullscreen}
          onBringToFront={bringToFront}
          onSendToBack={sendToBack}
          onUnstack={unstackCard}
          onResetPosition={resetPosition}
          onStackWith={stackWith}
        />
      )}

      {/* Fullscreen overlay */}
      {fullscreenPath && (
        <CanvasFullscreenOverlay
          path={fullscreenPath}
          label={fullscreenLabel}
          onClose={() => setFullscreenPath(null)}
        />
      )}

      {/* Debug stats overlay */}
      {showDebug && (
        <div className="fixed bottom-4 left-4 z-[200] bg-card/90 backdrop-blur border border-border rounded-lg px-3 py-2 text-xs font-mono text-muted-foreground space-y-0.5">
          <div>Visible: {visibleCardsWithFlags.length} / {CANVAS_PAGES.length}</div>
          <div>Expanded: {expandedCount} / {MAX_EXPANDED}</div>
          <div>Zoom: {(transform.zoom * 100).toFixed(0)}%</div>
          <div>Render: {(performance.now() - renderStart.current).toFixed(1)}ms</div>
          <div>Theme: {resolvedTheme}</div>
        </div>
      )}
    </div>
  );
}
