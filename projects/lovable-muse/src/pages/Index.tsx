import { motion } from 'framer-motion';
import { Sparkles, Rocket, TrendingUp, ArrowRight, FolderOpen, Image, CheckSquare, Users, Clock, Zap, Upload, LayoutGrid } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import AppLayout from '@/components/layout/AppLayout';
import FileDropZone from '@/components/shared/FileDropZone';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';
import { useMemo } from 'react';

/* ─── Progress Ring ─── */
function ProgressRing({ value, max, size = 56, stroke = 4, className = '' }: { value: number; max: number; size?: number; stroke?: number; className?: string }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  return (
    <svg width={size} height={size} className={className}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="hsl(var(--primary))" strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={circ}
        animate={{ strokeDashoffset: circ * (1 - pct) }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
      />
    </svg>
  );
}

/* ─── Greeting ─── */
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

const phaseConfig = [
  { key: 'start', icon: Sparkles, gradient: 'from-phase-start/25 via-phase-start/5 to-transparent', border: 'border-phase-start/20 hover:border-phase-start/50', text: 'text-phase-start', glow: 'hover:shadow-[0_0_30px_-8px_hsl(var(--phase-start)/0.4)]' },
  { key: 'build', icon: Rocket, gradient: 'from-phase-build/25 via-phase-build/5 to-transparent', border: 'border-phase-build/20 hover:border-phase-build/50', text: 'text-phase-build', glow: 'hover:shadow-[0_0_30px_-8px_hsl(var(--phase-build)/0.4)]' },
  { key: 'grow', icon: TrendingUp, gradient: 'from-phase-grow/25 via-phase-grow/5 to-transparent', border: 'border-phase-grow/20 hover:border-phase-grow/50', text: 'text-phase-grow', glow: 'hover:shadow-[0_0_30px_-8px_hsl(var(--phase-grow)/0.4)]' },
] as const;

const priorityIndicator: Record<string, string> = {
  urgent: 'bg-destructive',
  high: 'bg-destructive/70',
  medium: 'bg-primary',
  low: 'bg-muted-foreground/40',
};

export default function Index() {
  const { user } = useAuth();
  const { t } = useI18n();

  const phaseLabels: Record<string, { label: string; desc: string; path: string }> = {
    start: { label: t('phase.start'), desc: t('dashboard.start.desc'), path: '/start/characters' },
    build: { label: t('phase.build'), desc: t('dashboard.build.desc'), path: '/storyboards' },
    grow: { label: t('phase.grow'), desc: t('dashboard.grow.desc'), path: '/grow/campaigns' },
  };

  // ─── Queries ───
  const { data: allProjectPhases = [] } = useQuery({
    queryKey: ['all-project-phases', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('projects').select('id, phase');
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('projects').select('*').order('updated_at', { ascending: false }).limit(4);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: assets = [] } = useQuery({
    queryKey: ['recent-assets', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('assets').select('*').order('created_at', { ascending: false }).limit(8);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: totalAssets = 0 } = useQuery({
    queryKey: ['total-assets-count', user?.id],
    queryFn: async () => {
      const { count, error } = await supabase.from('assets').select('id', { count: 'exact', head: true });
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!user,
  });

  const { data: taskStats } = useQuery({
    queryKey: ['task-stats', user?.id],
    queryFn: async () => {
      const [openRes, doneRes, totalRes] = await Promise.all([
        supabase.from('tasks').select('id', { count: 'exact', head: true }).neq('status', 'done'),
        supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('status', 'done'),
        supabase.from('tasks').select('id', { count: 'exact', head: true }),
      ]);
      return { open: openRes.count ?? 0, done: doneRes.count ?? 0, total: totalRes.count ?? 0 };
    },
    enabled: !!user,
  });

  const { data: teamCount = 0 } = useQuery({
    queryKey: ['team-count', user?.id],
    queryFn: async () => {
      const { count, error } = await supabase.from('team_members').select('id', { count: 'exact', head: true });
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!user,
  });

  const { data: recentTasks = [] } = useQuery({
    queryKey: ['recent-tasks', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('tasks').select('*, projects:project_id(name)').neq('status', 'done').order('updated_at', { ascending: false }).limit(5);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: recentTeam = [] } = useQuery({
    queryKey: ['recent-team', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('team_members').select('*').order('updated_at', { ascending: false }).limit(6);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const phaseCounts = useMemo(() => ({
    start: allProjectPhases.filter(p => p.phase === 'start').length,
    build: allProjectPhases.filter(p => p.phase === 'build').length,
    grow: allProjectPhases.filter(p => p.phase === 'grow').length,
  }), [allProjectPhases]);

  const openTasks = taskStats?.open ?? 0;
  const doneTasks = taskStats?.done ?? 0;
  const totalTasks = taskStats?.total ?? 0;

  const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] space-y-6">

        {/* ─── Hero Greeting ─── */}
        <motion.div {...fadeUp} className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-secondary/30 p-6 sm:p-8">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-phase-start/5 rounded-full blur-3xl" />
          <div className="relative z-10">
            <p className="text-sm text-muted-foreground font-medium tracking-wide">{getGreeting()}</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mt-1 tracking-tight">
              {t('dashboard.title')} <span className="text-gradient-primary">{t('dashboard.titleHighlight')}</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-lg leading-relaxed">{t('dashboard.subtitle')}</p>
          </div>

          {/* Inline quick stats */}
          <div className="relative z-10 flex flex-wrap gap-6 mt-6">
            {[
              { label: t('dashboard.projects') || 'Projects', value: allProjectPhases.length, icon: FolderOpen, path: '/projects' },
              { label: 'Assets', value: totalAssets, icon: Image, path: '/assets' },
              { label: 'Open Tasks', value: openTasks, icon: CheckSquare, path: '/tasks' },
              { label: 'Team', value: teamCount, icon: Users, path: '/team' },
            ].map((s, i) => (
              <Link key={s.label} to={s.path}>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.06 }}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-secondary/60 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                    <s.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-foreground leading-none">{s.value}</p>
                    <p className="text-[11px] text-muted-foreground capitalize">{s.label}</p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* ─── Bento Grid: Pipeline + Tasks + Upload ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* Pipeline phases — spans 8 cols */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {phaseConfig.map((phase, i) => {
              const info = phaseLabels[phase.key];
              const count = phaseCounts[phase.key as keyof typeof phaseCounts];
              return (
                <Link key={phase.key} to={info.path}>
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    className={`relative p-5 rounded-xl border bg-gradient-to-br ${phase.gradient} ${phase.border} ${phase.glow} transition-all duration-300 group overflow-hidden h-full`}
                  >
                    <div className="absolute top-3 right-3 opacity-[0.06] group-hover:opacity-[0.12] transition-opacity">
                      <phase.icon className="w-16 h-16" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-3">
                        <phase.icon className={`w-4 h-4 ${phase.text}`} />
                        <span className={`text-[10px] font-bold tracking-[0.2em] ${phase.text}`}>{info.label}</span>
                      </div>
                      <p className="text-3xl font-bold text-foreground">{count}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{t('dashboard.projects')}</p>
                      <p className="text-xs text-muted-foreground mt-3 leading-relaxed opacity-70">{info.desc}</p>
                      <div className="flex items-center gap-1 mt-4 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>{t('dashboard.explore')}</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Task completion ring — spans 4 cols */}
          <motion.div
            {...fadeUp}
            transition={{ delay: 0.3 }}
            className="lg:col-span-4 rounded-xl border border-border bg-card p-5 flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-foreground tracking-wide uppercase">Task Progress</h3>
              <Link to="/tasks" className="text-[10px] text-primary hover:underline flex items-center gap-1">
                {t('dashboard.viewAll')} <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="flex-1 flex items-center justify-center gap-6">
              <div className="relative">
                <ProgressRing value={doneTasks} max={totalTasks} size={80} stroke={6} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-foreground">{totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0}%</span>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-muted-foreground">{doneTasks} completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-border" />
                  <span className="text-muted-foreground">{openTasks} remaining</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ─── Bento Grid: Projects + Tasks + Team ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* Recent Projects — 8 cols */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-foreground tracking-wide uppercase">{t('dashboard.recentProjects')}</h2>
              <Link to="/projects" className="text-[10px] text-primary hover:underline flex items-center gap-1">
                {t('dashboard.viewAll')} <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {projects.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
                <FolderOpen className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">{t('dashboard.noProjects')} <Link to="/projects" className="text-primary hover:underline">{t('dashboard.createOne')}</Link></p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {projects.map((project, i) => (
                  <Link key={project.id} to="/projects">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.06 }}
                      className="group rounded-xl border border-border bg-card overflow-hidden hover:border-primary/30 transition-all duration-200 hover:glow-primary flex"
                    >
                      <div className="w-24 sm:w-32 shrink-0 bg-muted overflow-hidden">
                        {project.thumbnail_url ? (
                          <img src={project.thumbnail_url} alt={project.name} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                            <LayoutGrid className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <div className="p-3 flex flex-col justify-center min-w-0">
                        <Badge variant="outline" className={`text-[9px] px-1.5 py-0 w-fit mb-1.5 font-bold tracking-widest uppercase ${
                          project.phase === 'start' ? 'border-phase-start/30 text-phase-start' :
                          project.phase === 'build' ? 'border-phase-build/30 text-phase-build' :
                          'border-phase-grow/30 text-phase-grow'
                        }`}>{project.phase}</Badge>
                        <h3 className="font-semibold text-sm text-foreground truncate">{project.name}</h3>
                        {project.description && (
                          <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{project.description}</p>
                        )}
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Open Tasks list — 4 cols */}
          <div className="lg:col-span-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-foreground tracking-wide uppercase">Open Tasks</h2>
              <Link to="/tasks" className="text-[10px] text-primary hover:underline flex items-center gap-1">
                {t('dashboard.viewAll')} <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="rounded-xl border border-border bg-card divide-y divide-border">
              {recentTasks.length === 0 ? (
                <div className="p-8 text-center">
                  <CheckSquare className="w-6 h-6 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">All clear! No open tasks.</p>
                </div>
              ) : (
                recentTasks.map((task, i) => (
                  <Link key={task.id} to="/tasks">
                    <motion.div
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + i * 0.04 }}
                      className="px-4 py-3 hover:bg-secondary/30 transition-colors flex items-start gap-3 group"
                    >
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${priorityIndicator[task.priority] || 'bg-muted-foreground/40'}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">{task.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-muted-foreground capitalize">{task.status.replace('_', ' ')}</span>
                          {(task as any).projects?.name && (
                            <span className="text-[10px] text-muted-foreground/60 truncate">· {(task as any).projects.name}</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ─── Quick Upload ─── */}
        <FileDropZone />

        {/* ─── Assets Strip ─── */}
        {assets.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-foreground tracking-wide uppercase">{t('dashboard.recentAssets')}</h2>
              <Link to="/assets" className="text-[10px] text-primary hover:underline flex items-center gap-1">
                {t('dashboard.viewAll')} <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {assets.map((asset, i) => (
                <Link key={asset.id} to="/assets" className="shrink-0">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="w-28 rounded-xl border border-border bg-card overflow-hidden hover:border-primary/30 transition-all group"
                  >
                    <div className="aspect-square overflow-hidden bg-muted">
                      {asset.thumbnail_url ? (
                        <img src={asset.thumbnail_url} alt={asset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                          <Image className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-[10px] font-medium text-foreground truncate">{asset.name}</p>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ─── Team Strip ─── */}
        {recentTeam.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-foreground tracking-wide uppercase">Team</h2>
              <Link to="/team" className="text-[10px] text-primary hover:underline flex items-center gap-1">
                {t('dashboard.viewAll')} <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {recentTeam.map((member, i) => (
                <Link key={member.id} to={`/team/${member.id}`} className="shrink-0">
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="w-36 rounded-xl border border-border bg-card p-3 hover:border-primary/30 transition-all text-center group"
                  >
                    <div className="w-12 h-12 rounded-full bg-secondary mx-auto mb-2 overflow-hidden ring-2 ring-border group-hover:ring-primary/30 transition-all">
                      {member.avatar_url ? (
                        <img src={member.avatar_url} alt={member.display_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm font-bold text-muted-foreground">
                          {member.display_name?.[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-medium text-foreground truncate">{member.display_name}</p>
                    <p className="text-[10px] text-muted-foreground capitalize mt-0.5">{member.role}</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
