import { useState } from 'react';
import { cn } from '../../lib/utils';
import { GripVertical, MoreHorizontal, Inbox } from 'lucide-react';

export interface KanbanCard {
  id: string | number;
  title: string;
  description?: string;
  tags?: { label: string; variant?: 'gray' | 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info' }[];
  meta?: { label: string; value: React.ReactNode }[];
  [key: string]: any;
}

export interface KanbanColumn {
  key: string;
  title: string;
  color?: 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'gray';
  headerExtra?: React.ReactNode;
  cards: KanbanCard[];
}

interface KanbanBoardProps {
  columns: KanbanColumn[];
  onCardClick?: (card: KanbanCard, columnKey: string) => void;
  onCardDrop?: (cardId: string | number, fromColumn: string, toColumn: string, toIndex: number) => void;
  renderCard?: (card: KanbanCard, columnKey: string) => React.ReactNode;
  className?: string;
}

const tagVariantClasses: Record<string, string> = {
  gray: 'tag-gray',
  primary: 'tag-primary',
  accent: 'tag-accent',
  success: 'tag-success',
  warning: 'tag-warning',
  danger: 'tag-danger',
  info: 'tag-info',
};

const columnColorClasses: Record<string, string> = {
  primary: 'bg-primary-100 text-primary-700',
  accent: 'bg-accent-100 text-accent-600',
  success: 'bg-success-light text-success',
  warning: 'bg-warning-light text-warning',
  danger: 'bg-danger-light text-danger',
  info: 'bg-info-light text-info',
};

const KanbanBoard = ({ columns, onCardClick, onCardDrop, renderCard, className }: KanbanBoardProps) => {
  const [draggedCard, setDraggedCard] = useState<{ id: string | number; column: string } | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (cardId: string | number, columnKey: string) => {
    setDraggedCard({ id: cardId, column: columnKey });
  };

  const handleDragEnd = () => {
    setDraggedCard(null);
    setDragOverColumn(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, columnKey: string, index: number) => {
    e.preventDefault();
    setDragOverColumn(columnKey);
    setDragOverIndex(index);
  };

  const handleDrop = (toColumn: string, toIndex: number) => {
    if (draggedCard && onCardDrop) {
      onCardDrop(draggedCard.id, draggedCard.column, toColumn, toIndex);
    }
    handleDragEnd();
  };

  const handleColumnDrop = (e: React.DragEvent, columnKey: string, cardsLength: number) => {
    e.preventDefault();
    if (draggedCard && onCardDrop) {
      onCardDrop(draggedCard.id, draggedCard.column, columnKey, cardsLength);
    }
    handleDragEnd();
  };

  return (
    <div className={cn('flex gap-4 overflow-x-auto pb-4 scrollbar-thin', className)}>
      {columns.map((col) => (
        <div
          key={col.key}
          className={cn('kanban-col')}
          onDragOver={(e) => handleColumnDrop(e, col.key, col.cards.length)}
        >
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'px-2.5 py-1 rounded-md text-xs font-bold',
                  col.color ? columnColorClasses[col.color] : 'bg-neutral-200 text-neutral-700'
                )}
              >
                {col.cards.length}
              </span>
              <h3 className="font-semibold text-neutral-800 text-sm">{col.title}</h3>
            </div>
            {col.headerExtra ?? (
              <button className="w-7 h-7 rounded-md flex items-center justify-center text-neutral-400 hover:bg-white hover:text-neutral-600 transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="px-2.5 pb-3 flex-1 overflow-y-auto scrollbar-thin min-h-[100px]">
            {col.cards.length === 0 ? (
              <div
                className={cn(
                  'flex flex-col items-center justify-center py-8 px-4 rounded-lg border-2 border-dashed transition-colors',
                  dragOverColumn === col.key
                    ? 'border-primary-400 bg-primary-50/50'
                    : 'border-neutral-200 bg-white/30'
                )}
              >
                <Inbox className="w-8 h-8 text-neutral-300 mb-2" />
                <p className="text-xs text-neutral-400">拖拽卡片到此列</p>
              </div>
            ) : (
              col.cards.map((card, index) => (
                <div
                  key={card.id}
                  draggable
                  onDragStart={() => handleDragStart(card.id, col.key)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, col.key, index)}
                  onDrop={() => handleDrop(col.key, index)}
                  onClick={() => onCardClick?.(card, col.key)}
                  className={cn(
                    'kanban-card relative group',
                    draggedCard?.id === card.id && 'opacity-50 rotate-1',
                    dragOverColumn === col.key && dragOverIndex === index && 'mt-6',
                    dragOverColumn === col.key && dragOverIndex === index && 'before:absolute before:-top-3 before:left-0 before:right-0 before:h-1 before:rounded-full before:bg-primary-500'
                  )}
                >
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-4 h-4 text-neutral-300" />
                  </div>
                  {renderCard ? (
                    renderCard(card, col.key)
                  ) : (
                    <>
                      <h4 className="font-medium text-sm text-neutral-800 leading-snug pr-6">{card.title}</h4>
                      {card.description && (
                        <p className="mt-1.5 text-xs text-neutral-500 line-clamp-2">{card.description}</p>
                      )}
                      {card.tags && card.tags.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1">
                          {card.tags.map((tag, i) => (
                            <span key={i} className={cn(tagVariantClasses[tag.variant || 'gray'])}>
                              {tag.label}
                            </span>
                          ))}
                        </div>
                      )}
                      {card.meta && card.meta.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center gap-3">
                          {card.meta.map((m, i) => (
                            <div key={i} className="flex items-center gap-1 text-xs text-neutral-500">
                              <span className="text-neutral-400">{m.label}:</span>
                              <span className="text-neutral-700 font-medium">{m.value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;
