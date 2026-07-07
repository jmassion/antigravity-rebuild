import { useState, useCallback, useRef, useEffect } from 'react';

export interface Transform {
  x: number;
  y: number;
  zoom: number;
}

export function useCanvasTransform(containerRef?: React.RefObject<HTMLElement | null>, initialTransform?: Transform) {
  const [transform, setTransform] = useState<Transform>(
    initialTransform ?? { x: 0, y: 0, zoom: 1 }
  );
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const spaceDown = useRef(false);

  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.93 : 1.07;
    setTransform(prev => {
      const newZoom = Math.min(3, Math.max(0.1, prev.zoom * zoomFactor));
      const target = e.currentTarget as HTMLElement | null;
      const rect = target ? target.getBoundingClientRect() : { left: 0, top: 0 };
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const scale = newZoom / prev.zoom;
      return {
        x: cx - (cx - prev.x) * scale,
        y: cy - (cy - prev.y) * scale,
        zoom: newZoom,
      };
    });
  }, []);

  // Attach wheel listener natively with { passive: false } so preventDefault works
  useEffect(() => {
    const el = containerRef?.current;
    if (!el) return;
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [containerRef, onWheel]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    // middle click or space+left click to pan
    if (e.button === 1 || (e.button === 0 && spaceDown.current)) {
      e.preventDefault();
      isPanning.current = true;
      panStart.current = { x: e.clientX - transform.x, y: e.clientY - transform.y };
    }
  }, [transform.x, transform.y]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning.current) return;
    setTransform(prev => ({
      ...prev,
      x: e.clientX - panStart.current.x,
      y: e.clientY - panStart.current.y,
    }));
  }, []);

  const onMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === 'Space') spaceDown.current = true;
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space') spaceDown.current = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  const screenToCanvas = useCallback((sx: number, sy: number) => ({
    x: (sx - transform.x) / transform.zoom,
    y: (sy - transform.y) / transform.zoom,
  }), [transform]);

  const fitToView = useCallback((cards: { x: number; y: number }[], containerW: number, containerH: number) => {
    if (!cards.length) return;
    const xs = cards.map(c => c.x);
    const ys = cards.map(c => c.y);
    const minX = Math.min(...xs) - 100;
    const minY = Math.min(...ys) - 100;
    const maxX = Math.max(...xs) + 380;
    const maxY = Math.max(...ys) + 280;
    const w = maxX - minX;
    const h = maxY - minY;
    const zoom = Math.min(containerW / w, containerH / h, 1.5);
    setTransform({
      x: (containerW - w * zoom) / 2 - minX * zoom,
      y: (containerH - h * zoom) / 2 - minY * zoom,
      zoom,
    });
  }, []);

  const zoomToCard = useCallback((cx: number, cy: number, containerW: number, containerH: number) => {
    setTransform({
      x: containerW / 2 - cx * 1.2,
      y: containerH / 2 - cy * 1.2,
      zoom: 1.2,
    });
  }, []);

  return {
    transform,
    setTransform,
    onWheel,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    screenToCanvas,
    fitToView,
    zoomToCard,
    isPanning,
  };
}
