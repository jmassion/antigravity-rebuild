import { useState, useRef, useCallback, useEffect } from 'react';
import { X, Pencil, Square, Circle, Type, Undo2, Trash2, Download, Palette } from 'lucide-react';

type Tool = 'pen' | 'rect' | 'circle' | 'text';
type DrawAction = {
  id: string;
  tool: Tool;
  color: string;
  strokeWidth: number;
  points?: { x: number; y: number }[];
  rect?: { x: number; y: number; w: number; h: number };
  circle?: { cx: number; cy: number; r: number };
  text?: { x: number; y: number; content: string };
};

interface FrameMarkupOverlayProps {
  imageUrl: string;
  frameName: string;
  onClose: () => void;
  onSave?: (annotations: DrawAction[]) => void;
  initialAnnotations?: DrawAction[];
}

const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ffffff', '#000000'];

export default function FrameMarkupOverlay({ imageUrl, frameName, onClose, onSave, initialAnnotations = [] }: FrameMarkupOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#ef4444');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [actions, setActions] = useState<DrawAction[]>(initialAnnotations);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const getPos = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  }, []);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image
    if (imgRef.current) {
      ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);
    }

    const w = canvas.width;
    const h = canvas.height;

    const drawAction = (action: DrawAction) => {
      ctx.strokeStyle = action.color;
      ctx.fillStyle = action.color;
      ctx.lineWidth = action.strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (action.tool === 'pen' && action.points && action.points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(action.points[0].x * w, action.points[0].y * h);
        for (let i = 1; i < action.points.length; i++) {
          ctx.lineTo(action.points[i].x * w, action.points[i].y * h);
        }
        ctx.stroke();
      } else if (action.tool === 'rect' && action.rect) {
        ctx.strokeRect(action.rect.x * w, action.rect.y * h, action.rect.w * w, action.rect.h * h);
      } else if (action.tool === 'circle' && action.circle) {
        ctx.beginPath();
        ctx.arc(action.circle.cx * w, action.circle.cy * h, action.circle.r * w, 0, Math.PI * 2);
        ctx.stroke();
      } else if (action.tool === 'text' && action.text) {
        ctx.font = `${action.strokeWidth * 6}px sans-serif`;
        ctx.fillText(action.text.content, action.text.x * w, action.text.y * h);
      }
    };

    actions.forEach(drawAction);

    // Draw current in-progress action
    if (isDrawing && tool === 'pen' && currentPoints.length > 1) {
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(currentPoints[0].x * w, currentPoints[0].y * h);
      currentPoints.forEach(p => ctx.lineTo(p.x * w, p.y * h));
      ctx.stroke();
    }
  }, [actions, isDrawing, currentPoints, tool, color, strokeWidth]);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgRef.current = img;
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = img.naturalWidth || 800;
        canvas.height = img.naturalHeight || 450;
      }
      redraw();
    };
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => { redraw(); }, [redraw]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getPos(e);
    setIsDrawing(true);
    setStartPos(pos);
    if (tool === 'pen') setCurrentPoints([pos]);
    if (tool === 'text') {
      const content = prompt('Enter text:');
      if (content) {
        setActions(prev => [...prev, {
          id: crypto.randomUUID(), tool: 'text', color, strokeWidth,
          text: { x: pos.x, y: pos.y, content },
        }]);
      }
      setIsDrawing(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const pos = getPos(e);
    if (tool === 'pen') setCurrentPoints(prev => [...prev, pos]);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDrawing || !startPos) return;
    const pos = getPos(e);
    setIsDrawing(false);

    if (tool === 'pen' && currentPoints.length > 1) {
      setActions(prev => [...prev, {
        id: crypto.randomUUID(), tool: 'pen', color, strokeWidth, points: [...currentPoints, pos],
      }]);
      setCurrentPoints([]);
    } else if (tool === 'rect') {
      setActions(prev => [...prev, {
        id: crypto.randomUUID(), tool: 'rect', color, strokeWidth,
        rect: { x: Math.min(startPos.x, pos.x), y: Math.min(startPos.y, pos.y), w: Math.abs(pos.x - startPos.x), h: Math.abs(pos.y - startPos.y) },
      }]);
    } else if (tool === 'circle') {
      const r = Math.sqrt(Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2));
      setActions(prev => [...prev, {
        id: crypto.randomUUID(), tool: 'circle', color, strokeWidth,
        circle: { cx: startPos.x, cy: startPos.y, r },
      }]);
    }
    setStartPos(null);
  };

  const undo = () => setActions(prev => prev.slice(0, -1));
  const clearAll = () => setActions([]);
  const save = () => { onSave?.(actions); onClose(); };

  const exportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${frameName}-markup.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const tools: { key: Tool; icon: typeof Pencil; label: string }[] = [
    { key: 'pen', icon: Pencil, label: 'Draw' },
    { key: 'rect', icon: Square, label: 'Rectangle' },
    { key: 'circle', icon: Circle, label: 'Circle' },
    { key: 'text', icon: Type, label: 'Text' },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70" onClick={onClose}>
      <div className="bg-card border border-border rounded-lg max-w-5xl w-full mx-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border flex-wrap">
          <span className="text-sm font-semibold text-foreground mr-2">Markup: {frameName}</span>

          <div className="flex items-center gap-1 border-r border-border pr-2 mr-1">
            {tools.map(t => (
              <button
                key={t.key}
                onClick={() => setTool(t.key)}
                className={`p-1.5 rounded transition-colors ${tool === t.key ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                title={t.label}
              >
                <t.icon className="w-4 h-4" />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 border-r border-border pr-2 mr-1">
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-5 h-5 rounded-full border-2 transition-all ${color === c ? 'border-foreground scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <Palette className="w-3 h-3 text-muted-foreground" />
            <input
              type="range" min={1} max={10} value={strokeWidth}
              onChange={e => setStrokeWidth(Number(e.target.value))}
              className="w-16 accent-primary h-1.5"
            />
          </div>

          <div className="ml-auto flex items-center gap-1">
            <button onClick={undo} disabled={actions.length === 0} className="p-1.5 rounded text-muted-foreground hover:text-foreground disabled:opacity-30" title="Undo">
              <Undo2 className="w-4 h-4" />
            </button>
            <button onClick={clearAll} disabled={actions.length === 0} className="p-1.5 rounded text-muted-foreground hover:text-foreground disabled:opacity-30" title="Clear all">
              <Trash2 className="w-4 h-4" />
            </button>
            <button onClick={exportImage} className="p-1.5 rounded text-muted-foreground hover:text-foreground" title="Export PNG">
              <Download className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-1.5 rounded text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div ref={containerRef} className="flex-1 overflow-auto flex items-center justify-center bg-black/20 p-4">
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-full cursor-crosshair rounded"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => { if (isDrawing) handleMouseUp({ clientX: 0, clientY: 0 } as any); }}
          />
        </div>

        {/* Footer */}
        {onSave && (
          <div className="flex justify-end gap-2 px-4 py-2.5 border-t border-border">
            <button onClick={onClose} className="px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground">Cancel</button>
            <button onClick={save} className="px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90">
              Save Markup
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
