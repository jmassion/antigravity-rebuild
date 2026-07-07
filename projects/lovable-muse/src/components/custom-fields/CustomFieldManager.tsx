import { useState } from 'react';
import { useCustomFieldDefinitions, useCreateFieldDefinition, useDeleteFieldDefinition, type FieldDefinition } from '@/hooks/useCustomFields';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface CustomFieldManagerProps {
  entityType: string;
  projectId?: string | null;
  entityId?: string | null;
}

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'textarea', label: 'Long Text' },
  { value: 'select', label: 'Dropdown' },
  { value: 'multi_select', label: 'Multi Select' },
  { value: 'color', label: 'Color' },
  { value: 'url', label: 'URL' },
  { value: 'date', label: 'Date' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'image_url', label: 'Image URL' },
];

const SCOPES = [
  { value: 'global', label: 'Global (all)' },
  { value: 'project', label: 'Project only' },
  { value: 'instance', label: 'This entity only' },
];

export default function CustomFieldManager({ entityType, projectId, entityId }: CustomFieldManagerProps) {
  const { data: fields } = useCustomFieldDefinitions(entityType, projectId, entityId);
  const createField = useCreateFieldDefinition();
  const deleteField = useDeleteFieldDefinition();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ field_label: '', field_name: '', field_type: 'text', scope: 'global', options_text: '' });

  const handleCreate = () => {
    const scope_id = form.scope === 'project' ? projectId : form.scope === 'instance' ? entityId : null;
    const options = form.field_type === 'select' || form.field_type === 'multi_select'
      ? form.options_text.split(',').map(s => s.trim()).filter(Boolean).map(s => ({ value: s.toLowerCase().replace(/\s+/g, '_'), label: s }))
      : [];
    createField.mutate({
      entity_type: entityType,
      field_name: form.field_label.toLowerCase().replace(/\s+/g, '_'),
      field_label: form.field_label,
      field_type: form.field_type,
      scope: form.scope,
      scope_id: scope_id || undefined,
      options: options as any,
    } as any, {
      onSuccess: () => {
        setOpen(false);
        setForm({ field_label: '', field_name: '', field_type: 'text', scope: 'global', options_text: '' });
      },
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground">Custom Fields</h4>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm"><Plus className="w-3.5 h-3.5 mr-1" /> Add Field</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Custom Field</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Label</Label>
                <Input value={form.field_label} onChange={e => setForm(f => ({ ...f, field_label: e.target.value }))} placeholder="e.g. Species" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Type</Label>
                <Select value={form.field_type} onValueChange={v => setForm(f => ({ ...f, field_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FIELD_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Scope</Label>
                <Select value={form.scope} onValueChange={v => setForm(f => ({ ...f, scope: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SCOPES.filter(s => {
                      if (s.value === 'project' && !projectId) return false;
                      if (s.value === 'instance' && !entityId) return false;
                      return true;
                    }).map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {(form.field_type === 'select' || form.field_type === 'multi_select') && (
                <div className="space-y-1">
                  <Label className="text-xs">Options (comma-separated)</Label>
                  <Input value={form.options_text} onChange={e => setForm(f => ({ ...f, options_text: e.target.value }))} placeholder="Human, Elf, Robot" />
                </div>
              )}
              <Button onClick={handleCreate} disabled={!form.field_label.trim() || createField.isPending} className="w-full">
                {createField.isPending ? 'Creating...' : 'Create Field'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {fields?.length ? (
        <div className="space-y-1.5">
          {fields.map(f => (
            <div key={f.id} className="flex items-center justify-between text-xs bg-muted/50 rounded px-2 py-1.5">
              <div>
                <span className="font-medium text-foreground">{f.field_label}</span>
                <span className="text-muted-foreground ml-2">{f.field_type} · {f.scope}</span>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteField.mutate(f.id)}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No custom fields yet.</p>
      )}
    </div>
  );
}
