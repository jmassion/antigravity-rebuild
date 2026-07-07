import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TagInput from '@/components/shared/TagInput';
import ProjectSelect from '@/components/shared/ProjectSelect';
import CustomFieldEditor from '@/components/custom-fields/CustomFieldEditor';
import CustomFieldManager from '@/components/custom-fields/CustomFieldManager';
import { useCharacter, useUpdateCharacter, useCharacterAssets } from '@/hooks/useCharacters';

interface CharacterDetailPanelProps {
  characterId: string | null;
  onClose: () => void;
}

export default function CharacterDetailPanel({ characterId, onClose }: CharacterDetailPanelProps) {
  const { data: character } = useCharacter(characterId);
  const { data: linkedAssets } = useCharacterAssets(characterId);
  const update = useUpdateCharacter();
  const [tab, setTab] = useState('overview');

  if (!character) return null;

  const save = (updates: Record<string, any>) => {
    update.mutate({ id: character.id, ...updates } as any);
  };

  return (
    <Sheet open={!!characterId} onOpenChange={open => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-3">
            {character.avatar_url ? (
              <img src={character.avatar_url} alt="" className="w-14 h-14 rounded-full object-cover" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-bold">
                {character.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <SheetTitle className="text-lg">{character.name}</SheetTitle>
              {character.role && <p className="text-sm text-muted-foreground">{character.role}</p>}
            </div>
          </div>
        </SheetHeader>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="fields">Fields</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="space-y-1">
              <Label className="text-xs">Name</Label>
              <Input defaultValue={character.name} onBlur={e => e.target.value !== character.name && save({ name: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Role / Archetype</Label>
              <Input defaultValue={character.role} onBlur={e => e.target.value !== character.role && save({ role: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Description</Label>
              <Textarea defaultValue={character.description} onBlur={e => e.target.value !== character.description && save({ description: e.target.value })} className="min-h-[80px]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Status</Label>
                <Select value={character.status} onValueChange={v => save({ status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concept">Concept</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Project</Label>
                <ProjectSelect value={character.project_id || undefined} onChange={v => save({ project_id: v || null })} />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Avatar URL</Label>
              <Input defaultValue={character.avatar_url || ''} onBlur={e => save({ avatar_url: e.target.value || null })} placeholder="https://..." />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Tags</Label>
              <TagInput value={character.tags || []} onChange={tags => save({ tags })} />
            </div>
          </TabsContent>

          <TabsContent value="gallery" className="mt-4">
            {linkedAssets?.length ? (
              <div className="grid grid-cols-3 gap-2">
                {linkedAssets.map((la: any) => (
                  <div key={la.id} className="aspect-square rounded overflow-hidden bg-muted">
                    {la.asset?.thumbnail_url || la.asset?.file_url ? (
                      <img src={la.asset.thumbnail_url || la.asset.file_url} alt={la.asset.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">{la.asset?.name || 'Asset'}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4">No linked assets yet. Attach assets from the Asset Library.</p>
            )}
          </TabsContent>

          <TabsContent value="fields" className="mt-4 space-y-6">
            <CustomFieldEditor entityType="character" entityId={character.id} projectId={character.project_id} />
            <div className="border-t pt-4">
              <CustomFieldManager entityType="character" projectId={character.project_id} entityId={character.id} />
            </div>
          </TabsContent>

          <TabsContent value="notes" className="mt-4">
            <Textarea
              defaultValue={(character.metadata as any)?.notes || ''}
              onBlur={e => save({ metadata: { ...character.metadata, notes: e.target.value } })}
              placeholder="Free-form notes about this character..."
              className="min-h-[200px]"
            />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
