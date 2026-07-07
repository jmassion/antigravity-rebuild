import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { FieldDefinition } from '@/hooks/useCustomFields';

interface FieldRendererProps {
  field: FieldDefinition;
  value: string;
  onChange: (value: string) => void;
}

export default function FieldRenderer({ field, value, onChange }: FieldRendererProps) {
  const { field_type, field_label, options, is_required } = field;

  switch (field_type) {
    case 'textarea':
      return (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">{field_label}{is_required && ' *'}</Label>
          <Textarea value={value} onChange={e => onChange(e.target.value)} className="min-h-[60px] text-sm" />
        </div>
      );

    case 'number':
      return (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">{field_label}{is_required && ' *'}</Label>
          <Input type="number" value={value} onChange={e => onChange(e.target.value)} className="text-sm" />
        </div>
      );

    case 'select':
      return (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">{field_label}{is_required && ' *'}</Label>
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {(options || []).map(o => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );

    case 'multi_select':
      return (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">{field_label}{is_required && ' *'}</Label>
          <div className="flex flex-wrap gap-2">
            {(options || []).map(o => {
              const selected = (value || '').split(',').filter(Boolean);
              const checked = selected.includes(o.value);
              return (
                <label key={o.value} className="flex items-center gap-1.5 text-sm">
                  <Checkbox
                    checked={checked}
                    onCheckedChange={c => {
                      const next = c ? [...selected, o.value] : selected.filter(v => v !== o.value);
                      onChange(next.join(','));
                    }}
                  />
                  {o.label}
                </label>
              );
            })}
          </div>
        </div>
      );

    case 'color':
      return (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">{field_label}{is_required && ' *'}</Label>
          <div className="flex items-center gap-2">
            <input type="color" value={value || '#000000'} onChange={e => onChange(e.target.value)} className="w-8 h-8 rounded border border-input cursor-pointer" />
            <Input value={value} onChange={e => onChange(e.target.value)} className="text-sm flex-1" placeholder="#000000" />
          </div>
        </div>
      );

    case 'url':
    case 'image_url':
      return (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">{field_label}{is_required && ' *'}</Label>
          <Input type="url" value={value} onChange={e => onChange(e.target.value)} className="text-sm" placeholder="https://..." />
          {field_type === 'image_url' && value && (
            <img src={value} alt="" className="w-16 h-16 rounded object-cover mt-1" />
          )}
        </div>
      );

    case 'date':
      return (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">{field_label}{is_required && ' *'}</Label>
          <Input type="date" value={value} onChange={e => onChange(e.target.value)} className="text-sm" />
        </div>
      );

    case 'checkbox':
      return (
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={value === 'true'} onCheckedChange={c => onChange(String(!!c))} />
          <span>{field_label}{is_required && ' *'}</span>
        </label>
      );

    default: // text
      return (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">{field_label}{is_required && ' *'}</Label>
          <Input value={value} onChange={e => onChange(e.target.value)} className="text-sm" />
        </div>
      );
  }
}
