import { useState, useMemo } from 'react';
import { cn } from '../../lib/utils';
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from 'lucide-react';

export interface TableColumn<T> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  sorter?: (a: T, b: T) => number;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  className?: string;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  dataSource: T[];
  rowKey?: keyof T | ((record: T) => string | number);
  onRowClick?: (record: T, index: number) => void;
  bordered?: boolean;
  loading?: boolean;
  emptyText?: string;
  pageSize?: number;
  className?: string;
  rowClassName?: (record: T, index: number) => string | undefined;
}

type SortDirection = 'asc' | 'desc' | null;

const Table = <T,>({
  columns,
  dataSource,
  rowKey = 'id' as keyof T,
  onRowClick,
  bordered = false,
  loading = false,
  emptyText = '暂无数据',
  pageSize,
  className,
  rowClassName,
}: TableProps<T>) => {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const getRowKey = (record: T, index: number): string | number => {
    if (typeof rowKey === 'function') return rowKey(record);
    return (record[rowKey] as string | number) ?? index;
  };

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return dataSource;
    const column = columns.find((c) => c.key === sortKey);
    if (!column?.sorter) return dataSource;
    const sorted = [...dataSource].sort(column.sorter);
    return sortDirection === 'desc' ? sorted.reverse() : sorted;
  }, [dataSource, sortKey, sortDirection, columns]);

  const pagedData = useMemo(() => {
    if (!pageSize) return sortedData;
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = pageSize ? Math.ceil(sortedData.length / pageSize) : 1;

  const handleSort = (key: string, column: TableColumn<T>) => {
    if (!column.sorter) return;
    if (sortKey !== key) {
      setSortKey(key);
      setSortDirection('asc');
    } else if (sortDirection === 'asc') {
      setSortDirection('desc');
    } else if (sortDirection === 'desc') {
      setSortKey(null);
      setSortDirection(null);
    } else {
      setSortDirection('asc');
    }
  };

  const alignClass = (align?: 'left' | 'center' | 'right') => {
    if (align === 'center') return 'text-center';
    if (align === 'right') return 'text-right';
    return 'text-left';
  };

  return (
    <div className={cn('table-wrapper', className)}>
      <table className={cn('table', bordered && 'border border-neutral-200')}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className={cn(
                  alignClass(col.align),
                  col.className,
                  col.sorter && 'cursor-pointer select-none hover:bg-neutral-100'
                )}
                onClick={() => handleSort(col.key, col)}
              >
                <div className={cn('flex items-center gap-1', col.align === 'center' && 'justify-center', col.align === 'right' && 'justify-end')}>
                  <span>{col.title}</span>
                  {col.sorter && (
                    <span className="flex flex-col ml-0.5">
                      <ChevronUp
                        className={cn(
                          'w-3 h-3 -mb-1',
                          sortKey === col.key && sortDirection === 'asc'
                            ? 'text-primary-600'
                            : 'text-neutral-300'
                        )}
                      />
                      <ChevronDown
                        className={cn(
                          'w-3 h-3',
                          sortKey === col.key && sortDirection === 'desc'
                            ? 'text-primary-600'
                            : 'text-neutral-300'
                        )}
                      />
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length}>
                <div className="empty-state">
                  <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-3" />
                  <p className="text-sm text-neutral-500">加载中...</p>
                </div>
              </td>
            </tr>
          ) : pagedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <div className="empty-state">
                  <Inbox className="w-12 h-12 text-neutral-300 mb-3" />
                  <p className="text-sm text-neutral-500">{emptyText}</p>
                </div>
              </td>
            </tr>
          ) : (
            pagedData.map((record, index) => (
              <tr
                key={getRowKey(record, index)}
                onClick={() => onRowClick?.(record, index)}
                className={cn(
                  onRowClick && 'cursor-pointer',
                  rowClassName?.(record, index)
                )}
              >
                {columns.map((col) => {
                  const value = col.dataIndex ? record[col.dataIndex] : undefined;
                  return (
                    <td
                      key={col.key}
                      className={cn(alignClass(col.align), col.className)}
                    >
                      {col.render ? col.render(value, record, index) : String(value ?? '')}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {pageSize && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200 bg-neutral-50/50">
          <span className="text-sm text-neutral-500">
            共 {sortedData.length} 条，第 {currentPage}/{totalPages} 页
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-md flex items-center justify-center text-neutral-600 hover:bg-white border border-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={cn(
                  'w-8 h-8 rounded-md text-sm font-medium transition-colors',
                  currentPage === page
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-neutral-600 hover:bg-white border border-neutral-200'
                )}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 rounded-md flex items-center justify-center text-neutral-600 hover:bg-white border border-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
