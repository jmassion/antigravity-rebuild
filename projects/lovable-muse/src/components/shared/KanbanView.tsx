import { motion } from 'framer-motion';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface KanbanViewProps<T> {
  columns: Record<string, T[]>;
  renderCard: (item: T, index: number) => React.ReactNode;
  keyFn: (item: T) => string;
  columnOrder?: string[];
  onReorder?: (result: { itemKey: string; sourceColumn: string; destColumn: string; sourceIndex: number; destIndex: number }) => void;
}

export default function KanbanView<T>({
  columns,
  renderCard,
  keyFn,
  columnOrder,
  onReorder,
}: KanbanViewProps<T>) {
  const orderedKeys = columnOrder
    ? columnOrder.filter(k => columns[k])
    : Object.keys(columns);

  for (const k of Object.keys(columns)) {
    if (!orderedKeys.includes(k)) orderedKeys.push(k);
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !onReorder) return;
    onReorder({
      itemKey: result.draggableId,
      sourceColumn: result.source.droppableId,
      destColumn: result.destination.droppableId,
      sourceIndex: result.source.index,
      destIndex: result.destination.index,
    });
  };

  const content = (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
      {orderedKeys.map(colName => {
        const items = columns[colName] || [];
        return (
          <div key={colName} className="flex-shrink-0 w-72">
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">{colName}</h3>
              <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">{items.length}</span>
            </div>
            {onReorder ? (
              <Droppable droppableId={colName}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-2 min-h-[100px] p-2 rounded-lg border transition-colors ${
                      snapshot.isDraggingOver ? 'bg-primary/5 border-primary/30' : 'bg-secondary/30 border-border/50'
                    }`}
                  >
                    {items.map((item, i) => (
                      <Draggable key={keyFn(item)} draggableId={keyFn(item)} index={i}>
                        {(dragProvided, dragSnapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            className={dragSnapshot.isDragging ? 'opacity-90 rotate-1 scale-[1.02]' : ''}
                          >
                            {renderCard(item, i)}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {items.length === 0 && (
                      <div className="text-center py-8 text-[11px] text-muted-foreground/50">No items</div>
                    )}
                  </div>
                )}
              </Droppable>
            ) : (
              <div className="space-y-2 min-h-[100px] p-2 rounded-lg bg-secondary/30 border border-border/50">
                {items.map((item, i) => (
                  <motion.div
                    key={keyFn(item)}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    {renderCard(item, i)}
                  </motion.div>
                ))}
                {items.length === 0 && (
                  <div className="text-center py-8 text-[11px] text-muted-foreground/50">No items</div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  if (onReorder) {
    return <DragDropContext onDragEnd={handleDragEnd}>{content}</DragDropContext>;
  }

  return content;
}
