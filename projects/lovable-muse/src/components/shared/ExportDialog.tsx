import { useState } from 'react';
import { X, Download, Loader2, FolderTree, File, Archive } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { zipSync, strToU8 } from 'fflate';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  preSelectedProjectIds?: string[];
}

interface ProjectOption {
  id: string;
  name: string;
}

export default function ExportDialog({ open, onClose, preSelectedProjectIds = [] }: ExportDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<'flat' | 'organized'>('organized');
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set(preSelectedProjectIds));
  const [includeAssets, setIncludeAssets] = useState(true);
  const [includeStoryboards, setIncludeStoryboards] = useState(true);
  const [includeDocs, setIncludeDocs] = useState(true);
  const [includeTasks, setIncludeTasks] = useState(true);
  const [includeLinks, setIncludeLinks] = useState(true);
  const [includePlans, setIncludePlans] = useState(true);
  const [includeProvenance, setIncludeProvenance] = useState(true);
  const [includeSubProjects, setIncludeSubProjects] = useState(true);
  const [tagFilter, setTagFilter] = useState('');
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState('');
  const [exportFormat, setExportFormat] = useState<'zip' | 'json'>('zip');

  const { data: projects = [] } = useQuery({
    queryKey: ['export-projects', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('projects').select('id, name').order('name');
      return (data || []) as ProjectOption[];
    },
    enabled: !!user && open,
  });

  const toggleProject = (id: string) => {
    setSelectedProjects(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedProjects(new Set(projects.map(p => p.id)));
  const selectNone = () => setSelectedProjects(new Set());

  const handleExport = async () => {
    if (!user) return;
    setExporting(true);
    setProgress('Fetching data...');

    try {
      const tags = tagFilter.split(',').map(t => t.trim()).filter(Boolean);
      const { data, error } = await supabase.functions.invoke('export-project', {
        body: {
          projectIds: [...selectedProjects],
          mode,
          includeAssets,
          includeStoryboards,
          includeDocs,
          includeTasks,
          includeLinks,
          includePlans,
          includeProvenance,
          includeSubProjects,
          tagFilter: tags.length > 0 ? tags : null,
        },
      });

      if (error) throw error;

      const dateStr = new Date().toISOString().slice(0, 10);

      if (exportFormat === 'zip') {
        setProgress('Building ZIP...');
        const files: Record<string, Uint8Array> = {};

        // Main manifest
        files['manifest.json'] = strToU8(JSON.stringify({
          exportedAt: data.exportedAt,
          mode: data.mode,
          projectCount: (data.projects || []).length,
          assetCount: (data.assets || []).length,
          storyboardCount: (data.storyboards || []).length,
          planCount: (data.plans || []).length,
          provenanceEdgeCount: (data.provenance_edges || []).length,
        }, null, 2));

        // Projects
        if (data.projects?.length) {
          files['projects.json'] = strToU8(JSON.stringify(data.projects, null, 2));
        }

        // Assets
        if (data.assets?.length) {
          files['assets.json'] = strToU8(JSON.stringify(data.assets, null, 2));
        }

        // Storyboards
        if (data.storyboards?.length) {
          files['storyboards.json'] = strToU8(JSON.stringify(data.storyboards, null, 2));
        }

        // Plans with prompt metadata
        if (data.plans?.length) {
          files['plans.json'] = strToU8(JSON.stringify(data.plans, null, 2));
        }

        // Provenance edges (lineage / prompt metadata)
        if (data.provenance_edges?.length) {
          files['provenance.json'] = strToU8(JSON.stringify(data.provenance_edges, null, 2));
        }

        // Docs
        if (data.docs?.length) {
          files['docs.json'] = strToU8(JSON.stringify(data.docs, null, 2));
        }

        // Tasks
        if (data.tasks?.length) {
          files['tasks.json'] = strToU8(JSON.stringify(data.tasks, null, 2));
        }

        // Links
        if (data.links?.length) {
          files['links.json'] = strToU8(JSON.stringify(data.links, null, 2));
        }

        // Organized structure
        if (data.organized) {
          files['organized.json'] = strToU8(JSON.stringify(data.organized, null, 2));
        }

        const zipped = zipSync(files);
        const blob = new Blob([zipped as unknown as ArrayBuffer], { type: 'application/zip' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pipeline-export-${dateStr}.zip`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pipeline-export-${dateStr}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }

      toast({ title: 'Export complete', description: `Your project data has been downloaded as ${exportFormat.toUpperCase()}.` });
      onClose();
    } catch (e: any) {
      toast({ title: 'Export failed', description: e.message, variant: 'destructive' });
    } finally {
      setExporting(false);
      setProgress('');
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Archive className="w-4 h-4" /> Export Project Data
            </h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          </div>

          <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
            {/* Format + Mode */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs font-semibold text-foreground block mb-2">Format</label>
                <div className="flex gap-2">
                  <button onClick={() => setExportFormat('zip')}
                    className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-colors ${exportFormat === 'zip' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-secondary text-muted-foreground hover:text-foreground'}`}>
                    <Archive className="w-4 h-4" /> ZIP
                  </button>
                  <button onClick={() => setExportFormat('json')}
                    className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-colors ${exportFormat === 'json' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-secondary text-muted-foreground hover:text-foreground'}`}>
                    <File className="w-4 h-4" /> JSON
                  </button>
                </div>
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-foreground block mb-2">Structure</label>
                <div className="flex gap-2">
                  <button onClick={() => setMode('flat')}
                    className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-colors ${mode === 'flat' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-secondary text-muted-foreground hover:text-foreground'}`}>
                    <File className="w-3 h-3" /> Flat
                  </button>
                  <button onClick={() => setMode('organized')}
                    className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-colors ${mode === 'organized' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-secondary text-muted-foreground hover:text-foreground'}`}>
                    <FolderTree className="w-3 h-3" /> Organized
                  </button>
                </div>
              </div>
            </div>

            {/* Project Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-foreground">Projects</label>
                <div className="flex gap-2">
                  <button onClick={selectAll} className="text-[10px] text-primary hover:underline">Select all</button>
                  <button onClick={selectNone} className="text-[10px] text-muted-foreground hover:underline">Clear</button>
                </div>
              </div>
              <div className="max-h-32 overflow-y-auto rounded-md border border-border bg-secondary/50 p-2 space-y-1">
                {projects.map(p => (
                  <label key={p.id} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-secondary cursor-pointer">
                    <input type="checkbox" checked={selectedProjects.has(p.id)} onChange={() => toggleProject(p.id)}
                      className="rounded border-border" />
                    <span className="text-xs text-foreground">{p.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Entity Toggles */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-2">Include</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Assets', value: includeAssets, set: setIncludeAssets },
                  { label: 'Storyboards', value: includeStoryboards, set: setIncludeStoryboards },
                  { label: 'Docs', value: includeDocs, set: setIncludeDocs },
                  { label: 'Tasks', value: includeTasks, set: setIncludeTasks },
                  { label: 'Links', value: includeLinks, set: setIncludeLinks },
                  { label: 'Sub-projects', value: includeSubProjects, set: setIncludeSubProjects },
                  { label: 'Plans', value: includePlans, set: setIncludePlans },
                  { label: 'Provenance', value: includeProvenance, set: setIncludeProvenance },
                ].map(toggle => (
                  <label key={toggle.label} className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-secondary border border-border cursor-pointer">
                    <input type="checkbox" checked={toggle.value} onChange={() => toggle.set(!toggle.value)} className="rounded border-border" />
                    <span className="text-xs text-foreground">{toggle.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tag Filter */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Tag Filter (optional)</label>
              <input value={tagFilter} onChange={e => setTagFilter(e.target.value)} placeholder="character, concept, tool:figma..."
                className="w-full px-3 py-2 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
              <p className="text-[10px] text-muted-foreground mt-1">Comma separated. Only items matching these tags will be exported.</p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-border flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">
              {selectedProjects.size} project{selectedProjects.size !== 1 ? 's' : ''} selected · {exportFormat.toUpperCase()}
            </span>
            <button onClick={handleExport} disabled={selectedProjects.size === 0 || exporting}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50">
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {exporting ? progress : `Export ${exportFormat.toUpperCase()}`}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
