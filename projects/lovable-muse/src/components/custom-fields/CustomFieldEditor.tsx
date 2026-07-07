import { useCustomFieldDefinitions, useCustomFieldValues, useUpsertFieldValue } from '@/hooks/useCustomFields';
import FieldRenderer from './FieldRenderer';
import { useCallback } from 'react';

interface CustomFieldEditorProps {
  entityType: string;
  entityId: string;
  projectId?: string | null;
}

export default function CustomFieldEditor({ entityType, entityId, projectId }: CustomFieldEditorProps) {
  const { data: fields, isLoading: loadingDefs } = useCustomFieldDefinitions(entityType, projectId, entityId);
  const { data: values, isLoading: loadingVals } = useCustomFieldValues(entityType, entityId);
  const upsert = useUpsertFieldValue();

  const getValue = useCallback((fieldId: string) => {
    return values?.find(v => v.field_id === fieldId)?.value || '';
  }, [values]);

  const handleChange = useCallback((fieldId: string, value: string) => {
    upsert.mutate({ field_id: fieldId, entity_type: entityType, entity_id: entityId, value });
  }, [upsert, entityType, entityId]);

  if (loadingDefs || loadingVals) return <div className="text-xs text-muted-foreground py-2">Loading fields...</div>;
  if (!fields?.length) return <div className="text-xs text-muted-foreground py-2">No custom fields defined yet.</div>;

  return (
    <div className="space-y-3">
      {fields.map(f => (
        <FieldRenderer key={f.id} field={f} value={getValue(f.id)} onChange={v => handleChange(f.id, v)} />
      ))}
    </div>
  );
}
