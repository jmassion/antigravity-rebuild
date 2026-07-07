import { LayoutGrid, List, Columns3, ArrowUpDown, ChevronDown, Group, Filter, X, Tag } from 'lucide-react';
import { useState } from 'react';

export type ViewMode = 'grid' | 'list' | 'kanban';

export interface GroupOption {
  value: string;
  label: string;
}

export interface SortOption {
  value: string;
  label: string;
}

export interface FilterOption {
  value: string;
  label: string;
  icon?: string;
}

export interface ViewToolbarProps {
  views?: ViewMode[];
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
  groupByOptions?: GroupOption[];
  groupBy: string;
  onGroupByChange: (v: string) => void;
  subGroupByOptions?: GroupOption[];
  subGroupBy?: string;
  onSubGroupByChange?: (v: string) => void;
  sortOptions?: SortOption[];
  sortBy: string;
  onSortByChange: (v: string) => void;
  sortDir: 'asc' | 'desc';
  onSortDirChange: (d: 'asc' | 'desc') => void;
  /** Content-type filter options */
  contentTypeOptions?: FilterOption[];
  filterContentType?: string;
  onFilterContentTypeChange?: (v: string) => void;
  /** Tag filter options (populated from available tags) */
  tagOptions?: string[];
  filterTags?: string[];
  onFilterTagsChange?: (tags: string[]) => void;
}

const viewIcons: Record<ViewMode, React.ElementType> = {
  grid: LayoutGrid,
  list: List,
  kanban: Columns3,
};

export default function ViewToolbar({
  views = ['grid', 'list', 'kanban'],
  view,
  onViewChange,
  groupByOptions = [],
  groupBy,
  onGroupByChange,
  subGroupByOptions = [],
  subGroupBy = '',
  onSubGroupByChange,
  sortOptions = [],
  sortBy,
  onSortByChange,
  sortDir,
  onSortDirChange,
  contentTypeOptions = [],
  filterContentType = '',
  onFilterContentTypeChange,
  tagOptions = [],
  filterTags = [],
  onFilterTagsChange,
}: ViewToolbarProps) {
  const hasActiveFilters = !!filterContentType || filterTags.length > 0;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* View Switcher */}
      <div className="flex items-center rounded-md border border-border bg-secondary overflow-hidden">
        {views.map(v => {
          const Icon = viewIcons[v];
          return (
            <button
              key={v}
              onClick={() => onViewChange(v)}
              className={`px-2.5 py-1.5 text-xs flex items-center gap-1 transition-colors ${
                view === v ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline capitalize">{v}</span>
            </button>
          );
        })}
      </div>

      {/* Content Type Filter */}
      {contentTypeOptions.length > 0 && onFilterContentTypeChange && (
        <DropdownSelect
          icon={<Filter className={`w-3.5 h-3.5 ${filterContentType ? 'text-primary' : ''}`} />}
          label={filterContentType ? contentTypeOptions.find(o => o.value === filterContentType)?.label || 'Type' : 'Type'}
          value={filterContentType}
          options={[{ value: '', label: 'All Types' }, ...contentTypeOptions]}
          onChange={onFilterContentTypeChange}
        />
      )}

      {/* Tag Filter */}
      {tagOptions.length > 0 && onFilterTagsChange && (
        <TagFilterDropdown
          tags={tagOptions}
          selected={filterTags}
          onChange={onFilterTagsChange}
        />
      )}

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          onClick={() => {
            onFilterContentTypeChange?.('');
            onFilterTagsChange?.([]);
          }}
          className="flex items-center gap-1 px-2 py-1.5 rounded-md text-xs text-destructive hover:bg-destructive/10 transition-colors"
        >
          <X className="w-3 h-3" /> Clear
        </button>
      )}

      {/* Group By */}
      {groupByOptions.length > 0 && (
        <DropdownSelect
          icon={<Group className="w-3.5 h-3.5" />}
          label="Group"
          value={groupBy}
          options={[{ value: '', label: 'None' }, ...groupByOptions]}
          onChange={onGroupByChange}
        />
      )}

      {/* Sub Group By */}
      {subGroupByOptions.length > 0 && groupBy && onSubGroupByChange && (
        <DropdownSelect
          icon={<Group className="w-3 h-3" />}
          label="Sub-group"
          value={subGroupBy}
          options={[{ value: '', label: 'None' }, ...subGroupByOptions]}
          onChange={onSubGroupByChange}
        />
      )}

      {/* Sort By */}
      {sortOptions.length > 0 && (
        <div className="flex items-center gap-0.5">
          <DropdownSelect
            icon={<ArrowUpDown className="w-3.5 h-3.5" />}
            label="Sort"
            value={sortBy}
            options={sortOptions}
            onChange={onSortByChange}
          />
          <button
            onClick={() => onSortDirChange(sortDir === 'asc' ? 'desc' : 'asc')}
            className="px-1.5 py-1.5 rounded-md border border-border bg-secondary text-xs text-muted-foreground hover:text-foreground transition-colors"
            title={sortDir === 'asc' ? 'Ascending' : 'Descending'}
          >
            {sortDir === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      )}
    </div>
  );
}

function DropdownSelect({
  icon,
  label,
  value,
  options,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  options: { value: string; label: string; icon?: string }[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border bg-secondary text-xs transition-colors ${
          value ? 'text-primary font-medium border-primary/30' : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        {icon}
        <span>{selected?.label || label}</span>
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-50 min-w-[160px] rounded-md border border-border bg-card shadow-lg py-1 max-h-[280px] overflow-y-auto">
            {options.map(opt => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full text-left px-3 py-1.5 text-xs transition-colors flex items-center gap-2 ${
                  opt.value === value ? 'bg-primary/10 text-primary font-medium' : 'text-foreground hover:bg-secondary'
                }`}
              >
                {opt.icon && <span>{opt.icon}</span>}
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function TagFilterDropdown({
  tags,
  selected,
  onChange,
}: {
  tags: string[];
  selected: string[];
  onChange: (tags: string[]) => void;
}) {
  const [open, setOpen] = useState(false);

  const toggle = (tag: string) => {
    onChange(
      selected.includes(tag)
        ? selected.filter(t => t !== tag)
        : [...selected, tag]
    );
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border bg-secondary text-xs transition-colors ${
          selected.length > 0 ? 'text-primary font-medium border-primary/30' : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Tag className="w-3.5 h-3.5" />
        <span>{selected.length > 0 ? `${selected.length} tag${selected.length > 1 ? 's' : ''}` : 'Tags'}</span>
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-50 min-w-[180px] max-w-[260px] rounded-md border border-border bg-card shadow-lg py-1 max-h-[280px] overflow-y-auto">
            {selected.length > 0 && (
              <div className="px-3 py-1.5 border-b border-border flex flex-wrap gap-1">
                {selected.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                    {tag}
                    <button onClick={() => toggle(tag)} className="hover:text-destructive"><X className="w-2.5 h-2.5" /></button>
                  </span>
                ))}
              </div>
            )}
            {tags.filter(t => !selected.includes(t)).map(tag => (
              <button
                key={tag}
                onClick={() => toggle(tag)}
                className="w-full text-left px-3 py-1.5 text-xs text-foreground hover:bg-secondary transition-colors"
              >
                {tag}
              </button>
            ))}
            {tags.length === 0 && (
              <p className="px-3 py-2 text-xs text-muted-foreground">No tags available</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Utility: group items by a key accessor
export function groupItems<T>(items: T[], keyFn: (item: T) => string): Record<string, T[]> {
  const groups: Record<string, T[]> = {};
  for (const item of items) {
    const key = keyFn(item) || 'Ungrouped';
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  }
  return groups;
}

// Utility: sort items
export function sortItems<T>(items: T[], keyFn: (item: T) => string | number, dir: 'asc' | 'desc'): T[] {
  return [...items].sort((a, b) => {
    const aVal = keyFn(a);
    const bVal = keyFn(b);
    if (typeof aVal === 'number' && typeof bVal === 'number') return dir === 'asc' ? aVal - bVal : bVal - aVal;
    return dir === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
  });
}
