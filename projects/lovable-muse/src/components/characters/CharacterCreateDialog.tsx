import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TagInput from '@/components/shared/TagInput';
import ProjectSelect from '@/components/shared/ProjectSelect';
import { useCreateCharacter } from '@/hooks/useCharacters';

interface CharacterCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CharacterCreateDialog({ open, onOpenChange }: CharacterCreateDialogProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('concept');
  const [projectId, setProjectId] = useState<string | undefined>();
  const [tags, setTags] = useState<string[]>([]);
  const create = useCreateCharacter();

  const handleSubmit = () => {
    if (!name.trim()) return;
    create.mutate(
      { name: name.trim(), role, description, status, project_id: projectId, tags },
      {
        onSuccess: () => {
          onOpenChange(false);
          setName(''); setRole(''); setDescription(''); setStatus('concept'); setProjectId(undefined); setTags([]);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>New Character</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Name *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Character name" autoFocus />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Role / Archetype</Label>
            <Input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Protagonist, Mentor" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Description</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description..." className="min-h-[60px]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Status</Label>
              <Select value={status} onValueChange={setStatus}>
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
              <ProjectSelect value={projectId} onChange={setProjectId} />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Tags</Label>
            <TagInput value={tags} onChange={setTags} />
          </div>
          <Button onClick={handleSubmit} disabled={!name.trim() || create.isPending} className="w-full">
            {create.isPending ? 'Creating...' : 'Create Character'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
