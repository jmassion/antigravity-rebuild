import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FolderOpen, Film, Image, Megaphone,
  Palette, BookOpen, Globe, Settings, ChevronDown, Sparkles,
  Rocket, TrendingUp, Upload, Users, LogOut, Network, CheckSquare, Search, Shield,
  ClipboardList, GitBranchPlus, LayoutGrid, Plus
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useI18n } from '@/lib/i18n';

export default function AppSidebar({ onSearchClick }: { onSearchClick?: () => void }) {
  const location = useLocation();
  const [openPhases, setOpenPhases] = useState<string[]>(['build']);
  const { signOut, user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const { t } = useI18n();

  const phases = [
    {
      key: 'start',
      label: t('phase.start'),
      icon: Sparkles,
      color: 'text-phase-start',
      bgColor: 'bg-phase-start/10',
      items: [
        { label: t('nav.characters'), path: '/start/characters', icon: Users, addable: true },
        { label: t('nav.styleGuides'), path: '/start/style-guides', icon: Palette, addable: true },
        { label: t('nav.worldsProps'), path: '/start/worlds', icon: Globe, addable: true },
        { label: t('nav.prompts'), path: '/start/prompts', icon: BookOpen, addable: true },
      ],
    },
    {
      key: 'build',
      label: t('phase.build'),
      icon: Rocket,
      color: 'text-phase-build',
      bgColor: 'bg-phase-build/10',
      items: [
        { label: t('nav.storyboards'), path: '/storyboards', icon: Film, addable: true },
        { label: t('nav.plans'), path: '/plans', icon: ClipboardList, addable: true },
        { label: t('nav.assetLibrary'), path: '/assets', icon: Image, addable: true },
        { label: t('nav.timeline'), path: '/timeline', icon: Film },
        { label: t('nav.connections'), path: '/connections', icon: Network },
        { label: t('nav.provenance'), path: '/provenance', icon: GitBranchPlus },
        { label: t('nav.linksTools'), path: '/links', icon: Globe, addable: true },
      ],
    },
    {
      key: 'grow',
      label: t('phase.grow'),
      icon: TrendingUp,
      color: 'text-phase-grow',
      bgColor: 'bg-phase-grow/10',
      items: [
        { label: t('nav.campaigns'), path: '/grow/campaigns', icon: Megaphone, addable: true },
        { label: t('nav.marketingAssets'), path: '/grow/marketing', icon: Image, addable: true },
      ],
    },
  ];

  const togglePhase = (key: string) => {
    setOpenPhases(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  return (
    <aside className="w-60 h-screen flex flex-col border-r border-border bg-sidebar fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b border-border">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <Film className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-sm tracking-wide text-foreground">PIPELINE</span>
        </Link>
      </div>

      {/* Search */}
        <button
          onClick={onSearchClick}
          className="mx-3 mt-3 mb-1 flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all border border-border"
        >
          <Search className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground text-xs">{t('nav.search')}</span>
          <kbd className="ml-auto text-[10px] px-1 py-0.5 rounded bg-secondary text-muted-foreground border border-border font-mono">⌘K</kbd>
        </button>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 scrollbar-thin">
        <NavItem icon={LayoutDashboard} label={t('nav.dashboard')} path="/" active={location.pathname === '/'} />
        <NavItem icon={FolderOpen} label={t('nav.allProjects')} path="/projects" active={location.pathname === '/projects'} addable />
        <NavItem icon={Upload} label={t('nav.uploads')} path="/uploads" active={location.pathname === '/uploads'} />
        <NavItem icon={CheckSquare} label={t('nav.tasks')} path="/tasks" active={location.pathname === '/tasks'} addable />
        <NavItem icon={Users} label={t('nav.team')} path="/team" active={location.pathname === '/team'} addable />
        {isAdmin && (
          <NavItem icon={Shield} label={t('nav.adminRoles')} path="/admin/team" active={location.pathname === '/admin/team'} />
        )}

        <div className="h-px bg-border my-3" />

        {phases.map(phase => (
          <div key={phase.key} className="mb-1">
            <button
              onClick={() => togglePhase(phase.key)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-semibold tracking-widest uppercase transition-colors ${phase.color} hover:${phase.bgColor}`}
            >
              <phase.icon className="w-4 h-4" />
              <span>{phase.label}</span>
              <ChevronDown className={`w-3.5 h-3.5 ml-auto transition-transform ${openPhases.includes(phase.key) ? 'rotate-0' : '-rotate-90'}`} />
            </button>
            <AnimatePresence>
              {openPhases.includes(phase.key) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  {phase.items.map(item => (
                    <NavItem
                      key={item.path}
                      icon={item.icon}
                      label={item.label}
                      path={item.path}
                      active={location.pathname === item.path}
                      nested
                      addable={item.addable}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border space-y-1">
        <NavItem icon={BookOpen} label={t('nav.docs')} path="/docs" active={location.pathname === '/docs'} />
        <NavItem icon={LayoutGrid} label={t('nav.canvas')} path="/canvas" active={location.pathname === '/canvas'} />
        <NavItem icon={Settings} label={t('nav.settings')} path="/settings" active={location.pathname === '/settings'} />
        <button
          onClick={signOut}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('nav.signOut')}</span>
        </button>
        {user && (
          <p className="text-[10px] text-muted-foreground truncate px-2.5">{user.email}</p>
        )}
      </div>
    </aside>
  );
}

function NavItem({ icon: Icon, label, path, active, nested, addable }: {
  icon: React.ElementType; label: string; path: string; active: boolean; nested?: boolean; addable?: boolean;
}) {
  return (
    <div className="relative group flex items-center">
      <Link
        to={path}
        className={`flex-1 flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-all relative ${
          nested ? 'ml-4 text-xs' : ''
        } ${
          active
            ? 'bg-primary/10 text-primary font-medium'
            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
        }`}
      >
        {active && (
          <motion.div
            layoutId="sidebar-active"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-primary rounded-full"
          />
        )}
        <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-primary' : ''}`} />
        <span className="truncate">{label}</span>
      </Link>
      {addable && (
        <Link
          to={`${path}?new=true`}
          className="absolute right-1 opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
          title={`Add new`}
          onClick={(e) => e.stopPropagation()}
        >
          <Plus className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
}
