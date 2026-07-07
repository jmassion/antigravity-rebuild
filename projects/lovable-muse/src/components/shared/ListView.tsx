import { ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

export interface Column<T> {
  key: string;
  label: string;
  render: (item: T) => React.ReactNode;
  className?: string;
}

interface ListViewProps<T> {
  items: T[];
  columns: Column<T>[];
  keyFn: (item: T) => string;
  onItemClick?: (item: T) => void;
  groups?: Record<string, T[]>;
  subGroups?: Record<string, Record<string, T[]>>;
  onReorder?: (result: { itemKey: string; sourceIndex: number; destIndex: number }) => void;
}

export default function ListView<T>({
  items,
  columns,
  keyFn,
  onItemClick,
  groups,
  subGroups,
  onReorder,
}: ListViewProps<T>) {
  if (subGroups) {
    return (
      <div className="space-y-4">
        {Object.entries(subGroups).map(([groupName, subs]) => (
          <CollapsibleGroup key={groupName} label={groupName} count={Object.values(subs).flat().length}>
            {Object.entries(subs).map(([subName, subItems]) => (
              <CollapsibleGroup key={subName} label={subName} count={subItems.length} nested>
                <Table items={subItems} columns={columns} keyFn={keyFn} onItemClick={onItemClick} />
              </CollapsibleGroup>
            ))}
          </CollapsibleGroup>
        ))}
      </div>
    );
  }

  if (groups) {
    return (
      <div className="space-y-4">
        {Object.entries(groups).map(([groupName, groupItems]) => (
          <CollapsibleGroup key={groupName} label={groupName} count={groupItems.length}>
            <Table items={groupItems} columns={columns} keyFn={keyFn} onItemClick={onItemClick} />
          </CollapsibleGroup>
        ))}
      </div>
    );
  }

  return <Table items={items} columns={columns} keyFn={keyFn} onItemClick={onItemClick} onReorder={onReorder} />;
}

function Table<T>({ items, columns, keyFn, onItemClick, onReorder }: { items: T[]; columns: Column<T>[]; keyFn: (item: T) => string; onItemClick?: (item: T) => void; onReorder?: (result: { itemKey: string; sourceIndex: number; destIndex: number }) => void }) {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !onReorder) return;
    onReorder({
      itemKey: result.draggableId,
      sourceIndex: result.source.index,
      destIndex: result.destination.index,
    });
  };

  const tableHead = (
    <thead>
      <tr className="bg-secondary/50">
        {onReorder && <th className="w-8" />}
        {columns.map(col => (
          <th key={col.key} className={`text-left px-3 py-2 text-muted-foreground font-medium ${col.className || ''}`}>{col.label}</th>
        ))}
      </tr>
    </thead>
  );

  if (onReorder) {
    return (
      <div className="rounded-lg border border-border overflow-hidden">
        <DragDropContext onDragEnd={handleDragEnd}>
          <table className="w-full text-xs">
            {tableHead}
            <Droppable droppableId="list-table">
              {(provided) => (
                <tbody ref={provided.innerRef} {...provided.droppableProps}>
                  {items.map((item, i) => (
                    <Draggable key={keyFn(item)} draggableId={keyFn(item)} index={i}>
                      {(dragProvided, dragSnapshot) => (
                        <tr
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          onClick={() => onItemClick?.(item)}
                          className={`border-t border-border hover:bg-secondary/30 transition-colors cursor-pointer ${
                            dragSnapshot.isDragging ? 'bg-primary/5 shadow-lg' : ''
                          }`}
                        >
                          <td className="w-8 px-1" {...dragProvided.dragHandleProps}>
                            <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40 hover:text-muted-foreground cursor-grab" />
                          </td>
                          {columns.map(col => (
                            <td key={col.key} className={`px-3 py-2 ${col.className || ''}`}>{col.render(item)}</td>
                          ))}
                        </tr>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </tbody>
              )}
            </Droppable>
          </table>
        </DragDropContext>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <table className="w-full text-xs">
        {tableHead}
        <tbody>
          {items.map(item => (
            <tr
              key={keyFn(item)}
              onClick={() => onItemClick?.(item)}
              className="border-t border-border hover:bg-secondary/30 transition-colors cursor-pointer"
            >
              {columns.map(col => (
                <td key={col.key} className={`px-3 py-2 ${col.className || ''}`}>{col.render(item)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CollapsibleGroup({ label, count, children, nested }: { label: string; count: number; children: React.ReactNode; nested?: boolean }) {
  const [open, setOpen] = useState(true);
  return (
    <div className={nested ? 'ml-4' : ''}>
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 mb-2 text-xs font-semibold text-foreground hover:text-primary transition-colors">
        {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        <span>{label}</span>
        <span className="text-muted-foreground font-normal">({count})</span>
      </button>
      {open && children}
    </div>
  );
}
