import React from 'react';
import { ExternalLink, Maximize2, Minimize2, ArrowUpToLine, ArrowDownToLine, Unlink, RotateCcw, Layers, Fullscreen } from 'lucide-react';
import type { CanvasCardData } from './CanvasCard';

interface Props {
  x: number;
  y: number;
  path: string;
  expanded: boolean;
  inStack: boolean;
  nearbyCards: CanvasCardData[];
  onClose: () => void;
  onNavigate: (path: string) => void;
  onExpand: (path: string) => void;
  onFullscreen: (path: string) => void;
  onBringToFront: (path: string) => void;
  onSendToBack: (path: string) => void;
  onUnstack: (path: string) => void;
  onResetPosition: (path: string) => void;
  onStackWith: (path: string, targetPath: string) => void;
}

export default function CanvasContextMenu({
  x, y, path, expanded, inStack, nearbyCards, onClose, onNavigate, onExpand, onFullscreen,
  onBringToFront, onSendToBack, onUnstack, onResetPosition, onStackWith,
}: Props) {
  const [showStackSub, setShowStackSub] = React.useState(false);

  const items = [
    { label: 'Open page', icon: ExternalLink, action: () => onNavigate(path) },
    { label: expanded ? 'Collapse' : 'Expand', icon: expanded ? Minimize2 : Maximize2, action: () => onExpand(path) },
    { label: 'Fullscreen', icon: Fullscreen, action: () => onFullscreen(path) },
    { label: 'Bring to front', icon: ArrowUpToLine, action: () => onBringToFront(path) },
    { label: 'Send to back', icon: ArrowDownToLine, action: () => onSendToBack(path) },
    ...(inStack ? [{ label: 'Unstack', icon: Unlink, action: () => onUnstack(path) }] : []),
    { label: 'Reset position', icon: RotateCcw, action: () => onResetPosition(path) },
  ];

  return (
    <>
      <div className="fixed inset-0 z-[200]" onClick={onClose} />
      <div
        className="fixed z-[201] min-w-[180px] rounded-lg border border-border bg-popover shadow-xl py-1 animate-in fade-in-0 zoom-in-95"
        style={{ left: x, top: y }}
      >
        {items.map(item => (
          <button
            key={item.label}
            onClick={() => { item.action(); onClose(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-popover-foreground hover:bg-accent transition-colors"
          >
            <item.icon className="w-3.5 h-3.5" />
            {item.label}
          </button>
        ))}

        {/* Stack with submenu */}
        {nearbyCards.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowStackSub(!showStackSub)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-popover-foreground hover:bg-accent transition-colors"
            >
              <Layers className="w-3.5 h-3.5" />
              Stack with...
            </button>
            {showStackSub && (
              <div className="absolute left-full top-0 ml-1 min-w-[160px] rounded-lg border border-border bg-popover shadow-xl py-1">
                {nearbyCards.map(card => (
                  <button
                    key={card.path}
                    onClick={() => { onStackWith(path, card.path); onClose(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-popover-foreground hover:bg-accent transition-colors"
                  >
                    <card.icon className="w-3.5 h-3.5" />
                    {card.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
