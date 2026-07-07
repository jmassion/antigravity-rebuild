import { useState, useCallback } from 'react';
import type { ViewMode } from '@/components/shared/ViewToolbar';

interface ViewPreferences {
  view: ViewMode;
  groupBy: string;
  subGroupBy: string;
  sortBy: string;
  sortDir: 'asc' | 'desc';
}

const defaults: ViewPreferences = {
  view: 'grid',
  groupBy: '',
  subGroupBy: '',
  sortBy: 'updated_at',
  sortDir: 'desc',
};

function load(pageKey: string): ViewPreferences {
  try {
    const raw = localStorage.getItem(`view-prefs:${pageKey}`);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

function save(pageKey: string, prefs: ViewPreferences) {
  localStorage.setItem(`view-prefs:${pageKey}`, JSON.stringify(prefs));
}

export function useViewPreferences(pageKey: string, overrides?: Partial<ViewPreferences>) {
  const [prefs, setPrefs] = useState<ViewPreferences>(() => ({
    ...load(pageKey),
    ...overrides,
  }));

  const update = useCallback(
    (partial: Partial<ViewPreferences>) => {
      setPrefs(prev => {
        const next = { ...prev, ...partial };
        save(pageKey, next);
        return next;
      });
    },
    [pageKey],
  );

  return {
    view: prefs.view,
    groupBy: prefs.groupBy,
    subGroupBy: prefs.subGroupBy,
    sortBy: prefs.sortBy,
    sortDir: prefs.sortDir,
    setView: (v: ViewMode) => update({ view: v }),
    setGroupBy: (v: string) => update({ groupBy: v, subGroupBy: v ? prefs.subGroupBy : '' }),
    setSortBy: (v: string) => update({ sortBy: v }),
    setSortDir: (d: 'asc' | 'desc') => update({ sortDir: d }),
    setSubGroupBy: (v: string) => update({ subGroupBy: v }),
  };
}
