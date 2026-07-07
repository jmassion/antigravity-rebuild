import { motion } from 'framer-motion';
import { MessageSquare, User, Clock } from 'lucide-react';
import type { Storyboard } from '@/lib/mock-data';

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  review: 'bg-phase-build/20 text-phase-build',
  approved: 'bg-phase-grow/20 text-phase-grow',
};

export default function StoryboardStrip({ storyboard }: { storyboard: Storyboard }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-foreground">{storyboard.name}</h2>
        <span className="text-[11px] text-muted-foreground">{storyboard.frames.length} frames · Updated {storyboard.updatedAt}</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin">
        {storyboard.frames.map((frame, i) => (
          <motion.div
            key={frame.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            className="flex-shrink-0 w-56 rounded-lg border border-border bg-card overflow-hidden hover:border-primary/30 transition-all cursor-pointer group"
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <img
                src={frame.thumbnail}
                alt={frame.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute top-2 left-2">
                <span className="text-[10px] font-mono font-bold bg-card/80 backdrop-blur px-1.5 py-0.5 rounded text-foreground">
                  {String(frame.order).padStart(2, '0')}
                </span>
              </div>
              <div className="absolute top-2 right-2">
                <span className={`text-[9px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded-full ${statusColors[frame.status]}`}>
                  {frame.status}
                </span>
              </div>
              <div className="absolute bottom-2 right-2">
                <span className="text-[10px] font-mono bg-card/80 backdrop-blur px-1.5 py-0.5 rounded text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />{frame.duration}s
                </span>
              </div>
            </div>
            <div className="p-2.5">
              <p className="text-xs font-medium text-foreground truncate">{frame.title}</p>
              <p className="text-[10px] text-muted-foreground line-clamp-2 mt-1">{frame.notes}</p>
              <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-0.5"><MessageSquare className="w-3 h-3" />v{frame.version}</span>
                {frame.assignee && (
                  <span className="flex items-center gap-0.5"><User className="w-3 h-3" />{frame.assignee}</span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
