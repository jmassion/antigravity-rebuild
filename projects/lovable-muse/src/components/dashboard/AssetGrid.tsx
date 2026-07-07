import { motion } from 'framer-motion';
import { Tag, GitBranch, Clock } from 'lucide-react';
import type { Asset } from '@/lib/mock-data';

const typeIcons: Record<string, string> = {
  image: '🖼️',
  video: '🎬',
  audio: '🎵',
  document: '📄',
  model: '🎮',
};

export default function AssetGrid({ assets, title }: { assets: Asset[]; title: string }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-foreground mb-3">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {assets.map((asset, i) => (
          <motion.div
            key={asset.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="group rounded-lg border border-border bg-card overflow-hidden hover:border-primary/30 transition-all cursor-pointer"
          >
            <div className="aspect-square overflow-hidden relative">
              <img
                src={asset.thumbnail}
                alt={asset.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute top-2 left-2 text-sm">{typeIcons[asset.type]}</div>
              <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="p-2.5">
              <p className="text-xs font-medium text-foreground truncate">{asset.name}</p>
              <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-0.5"><GitBranch className="w-3 h-3" />v{asset.versions}</span>
                <span className="flex items-center gap-0.5"><Tag className="w-3 h-3" />{asset.tags.length}</span>
                <span className="flex items-center gap-0.5 ml-auto"><Clock className="w-3 h-3" />{asset.updatedAt}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
