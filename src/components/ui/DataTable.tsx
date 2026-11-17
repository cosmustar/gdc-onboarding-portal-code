import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsUpDown } from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { Skeleton } from './primitives';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  /** Provide to make the column sortable. */
  sortValue?: (row: T) => string | number;
  className?: string;
  headerClassName?: string;
}

export type SortDir = 'asc' | 'desc';
export interface SortState {
  key: string;
  dir: SortDir;
}

interface DataTableProps<T> {
  ariaLabel: string;
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  rowLabel?: (row: T) => string;
  rowClassName?: (row: T) => string | undefined;
  isRowSelected?: (row: T) => boolean;
  loading?: boolean;
  empty?: ReactNode;
  initialSort?: SortState;
  pageSize?: number;
  /** Change this value (e.g. serialized filters) to jump back to page 1. */
  resetPageKey?: string;
}

const collator = new Intl.Collator('en', { sensitivity: 'base', numeric: true });

export function DataTable<T>({
  ariaLabel,
  columns,
  rows,
  getRowKey,
  onRowClick,
  rowLabel,
  rowClassName,
  isRowSelected,
  loading,
  empty,
  initialSort,
  pageSize = 10,
  resetPageKey,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<SortState | undefined>(initialSort);
  const [page, setPage] = useState(1);

  useEffect(() => setPage(1), [resetPageKey]);

  const sorted = useMemo(() => {
    const col = sort && columns.find((c) => c.key === sort.key);
    if (!col?.sortValue || !sort) return rows;
    const get = col.sortValue;
    const factor = sort.dir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const va = get(a);
      const vb = get(b);
      const cmp = typeof va === 'number' && typeof vb === 'number' ? va - vb : collator.compare(String(va), String(vb));
      return cmp * factor;
    });
  }, [rows, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageRows = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (key: string) => {
    setSort((s) => (s?.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));
    setPage(1);
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm" aria-label={ariaLabel} aria-busy={loading || undefined}>
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70">
              {columns.map((col) => {
                const active = sort?.key === col.key;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}
                    className={cn('whitespace-nowrap px-3 py-2.5 text-xs first:pl-5 font-semibold uppercase tracking-wide text-slate-500', col.headerClassName)}
                  >
                    {col.sortValue ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(col.key)}
                        className={cn('-mx-1 inline-flex items-center gap-1 rounded px-1 text-left uppercase hover:text-navy-900 focus-ring', active && 'text-navy-900')}
                      >
                        {col.header}
                        {active ? (
                          sort.dir === 'asc' ? <ArrowUp className="h-3 w-3" aria-hidden /> : <ArrowDown className="h-3 w-3" aria-hidden />
                        ) : (
                          <ChevronsUpDown className="h-3 w-3 opacity-40" aria-hidden />
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: Math.min(pageSize, 6) }, (_, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    {columns.map((c) => (
                      <td key={c.key} className="px-3 py-3.5 first:pl-5">
                        <Skeleton className="h-4 w-[70%]" />
                      </td>
                    ))}
                  </tr>
                ))
              : pageRows.map((row) => {
                  const selected = isRowSelected?.(row);
                  return (
                    <tr
                      key={getRowKey(row)}
                      tabIndex={onRowClick ? 0 : undefined}
                      aria-label={onRowClick && rowLabel ? rowLabel(row) : undefined}
                      aria-selected={onRowClick ? !!selected : undefined}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                      onKeyDown={
                        onRowClick
                          ? (e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                onRowClick(row);
                              }
                            }
                          : undefined
                      }
                      className={cn(
                        'border-b border-slate-100 transition-colors last:border-b-0',
                        onRowClick && 'cursor-pointer hover:bg-accent-50/50 focus:bg-accent-50/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent',
                        selected && 'bg-accent-50/70',
                        rowClassName?.(row),
                      )}
                    >
                      {columns.map((c) => (
                        <td key={c.key} className={cn('px-3 py-3 align-middle text-slate-700 first:pl-5', c.className)}>
                          {c.render(row)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>

      {!loading && rows.length === 0 && empty}

      {!loading && rows.length > 0 && (
        <nav className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 text-sm text-slate-500" aria-label={`${ariaLabel} pagination`}>
          <span>
            Showing <span className="font-medium text-navy-900">{(currentPage - 1) * pageSize + 1}</span>–
            <span className="font-medium text-navy-900">{Math.min(currentPage * pageSize, sorted.length)}</span> of{' '}
            <span className="font-medium text-navy-900">{sorted.length}</span>
          </span>
          {pageCount > 1 && (
            <div className="flex flex-wrap items-center gap-1">
              <PageButton label="Previous page" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </PageButton>
              {pageItems(currentPage, pageCount).map((p, i) =>
                p === 'gap' ? (
                  <span key={`gap-${i}`} className="px-1 text-slate-400" aria-hidden>
                    …
                  </span>
                ) : (
                  <PageButton key={p} label={`Page ${p}`} current={p === currentPage} onClick={() => setPage(p)}>
                    {p}
                  </PageButton>
                ),
              )}
              <PageButton label="Next page" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>
                <ChevronRight className="h-4 w-4" />
              </PageButton>
            </div>
          )}
        </nav>
      )}
    </div>
  );
}

function PageButton({ children, label, onClick, disabled, current }: { children: ReactNode; label: string; onClick: () => void; disabled?: boolean; current?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={current ? 'page' : undefined}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm transition-colors focus-ring disabled:cursor-not-allowed disabled:opacity-40',
        current ? 'bg-navy-900 font-medium text-white' : 'text-slate-600 hover:bg-slate-100',
      )}
    >
      {children}
    </button>
  );
}

/**
 * Page numbers to show: never more than 7 slots, whatever the page count.
 * e.g. 1 2 3 4 5 … 250 | 1 … 49 50 51 … 250 | 1 … 246 247 248 249 250
 */
function pageItems(current: number, count: number): (number | 'gap')[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, 'gap', count];
  if (current >= count - 3) return [1, 'gap', count - 4, count - 3, count - 2, count - 1, count];
  return [1, 'gap', current - 1, current, current + 1, 'gap', count];
}
