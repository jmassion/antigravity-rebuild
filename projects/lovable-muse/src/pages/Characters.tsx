import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useI18n } from '@/lib/i18n';
import { useCharacters, useDeleteCharacter } from '@/hooks/useCharacters';
import CharacterCard from '@/components/characters/CharacterCard';
import CharacterCreateDialog from '@/components/characters/CharacterCreateDialog';
import CharacterDetailPanel from '@/components/characters/CharacterDetailPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Loader2 } from 'lucide-react';

export default function Characters() {
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: characters, isLoading } = useCharacters({
    search: search || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });
  const deleteMut = useDeleteCharacter();

  return (
    <AppLayout>
      <div className="flex-1 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">👤 {t('characters.title')}</h1>
            <p className="text-sm text-muted-foreground mt-1">Create and manage character profiles with custom fields</p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> New Character
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search characters..." className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="concept">Concept</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : characters?.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {characters.map(c => (
              <CharacterCard key={c.id} character={c} onSelect={setSelectedId} onDelete={id => deleteMut.mutate(id)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-4xl mb-3">👤</p>
            <p className="text-sm">No characters yet — create one to get started</p>
          </div>
        )}
      </div>

      <CharacterCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
      <CharacterDetailPanel characterId={selectedId} onClose={() => setSelectedId(null)} />
    </AppLayout>
  );
}
