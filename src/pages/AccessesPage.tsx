import { Download, SearchX, UserRound, X } from 'lucide-react';
import { useCallback, useEffect, useMemo } from 'react';
import { AccessDrawer } from '../components/accesses/AccessDrawer';
import { AccessStatusBadge } from '../components/ui/Badge';
import { DataTable, type Column } from '../components/ui/DataTable';
import { Button, Card, EmptyState, ErrorState, FilterBar, Placeholder, SearchInput, SelectFilter } from '../components/ui/primitives';
import { useData } from '../context/DataContext';
import type { AccessView } from '../domain/enrich';
import { ACCESS_STATUS_GROUPS, ACCESS_STATUS_SLUGS, matchesAccessStatusFilter, NO_APPROVER, normalize } from '../domain/filters';
import { approverDisplay } from '../domain/status';
import { useUrlFilters } from '../hooks/useUrlFilters';
import { BUSINESS_UNITS } from '../types/models';
import { downloadCsv, type CsvColumn } from '../utils/csv';
import { todayIso } from '../utils/date';

const FILTER_KEYS = ['q', 'status', 'employee', 'bu', 'approver'] as const;
const URL_KEYS = [...FILTER_KEYS, 'view'] as const;

const COLUMNS: Column<AccessView>[] = [
  {
    key: 'request',
    header: 'Request ID',
    sortValue: (a) => a.requestId,
    render: (a) => <span className="font-mono text-xs font-medium text-navy-900">{a.requestId}</span>,
  },
  {
    key: 'employee',
    header: 'Employee Name',
    sortValue: (a) => a.employeeName,
    render: (a) => <span className="whitespace-nowrap font-medium text-navy-900">{a.employeeName}</span>,
  },
  { key: 'lan', header: 'LAN ID', sortValue: (a) => a.lanId, render: (a) => <span className="font-mono text-xs text-slate-600">{a.lanId}</span> },
  {
    key: 'access',
    header: 'Access Name',
    sortValue: (a) => a.accessName,
    render: (a) => (
      <div className="min-w-[160px]">
        <div className="text-navy-900">{a.accessName}</div>
        <div className="text-xs text-slate-500">{a.application}</div>
      </div>
    ),
  },
  {
    key: 'status',
    header: 'Access Status',
    sortValue: (a) => a.status,
    render: (a) => <AccessStatusBadge status={a.status} availabilityConfirmed={a.availabilityConfirmed} />,
  },
  { key: 'manager', header: 'Manager', sortValue: (a) => a.managerName, render: (a) => <span className="whitespace-nowrap">{a.managerName}</span> },
  { key: 'requestedBy', header: 'Requested By', sortValue: (a) => a.requestedBy, render: (a) => <span className="text-slate-600">{a.requestedBy}</span> },
  {
    key: 'approver',
    header: 'Pending Approver',
    sortValue: (a) => (a.status === 'Pending Approval' ? (a.pendingApprover ?? '~1') : '~2'),
    render: (a) => {
      const d = approverDisplay(a);
      return d.isPlaceholder ? <Placeholder>{d.text}</Placeholder> : <span className="font-medium text-navy-900">{d.text}</span>;
    },
  },
];

const CSV_COLUMNS: CsvColumn<AccessView>[] = [
  { header: 'Request ID', value: (a) => a.requestId },
  { header: 'Employee ID', value: (a) => a.employeeId },
  { header: 'Employee Name', value: (a) => a.employeeName },
  { header: 'LAN ID', value: (a) => a.lanId },
  { header: 'Business Unit', value: (a) => a.businessUnit },
  { header: 'Access ID', value: (a) => a.accessId },
  { header: 'Access Name', value: (a) => a.accessName },
  { header: 'Application', value: (a) => a.application },
  { header: 'Access Status', value: (a) => a.status },
  { header: 'Availability Confirmed', value: (a) => (a.status === 'Committed' ? (a.availabilityConfirmed ? 'Yes' : 'No') : '') },
  { header: 'Counts As Completed', value: (a) => (a.isCompleted ? 'Yes' : 'No') },
  { header: 'Manager', value: (a) => a.managerName },
  { header: 'Requested By', value: (a) => a.requestedBy },
  { header: 'Pending Approver', value: (a) => approverDisplay(a).text },
  { header: 'Requested At', value: (a) => a.requestedAt },
  { header: 'Last Updated', value: (a) => a.lastUpdatedAt },
];

const STATUS_OPTIONS = [
  ...Object.entries(ACCESS_STATUS_GROUPS).map(([value, g]) => ({ value, label: g.label })),
  ...Object.entries(ACCESS_STATUS_SLUGS).map(([value, label]) => ({ value, label })),
];

function matchesApprover(a: AccessView, approver: string): boolean {
  if (!approver) return true;
  if (a.status !== 'Pending Approval') return false;
  return approver === NO_APPROVER ? !a.pendingApprover : a.pendingApprover === approver;
}

export function AccessesPage() {
  const { accesses, employees, state, error, reload } = useData();
  const { values, setFilter, clearFilters } = useUrlFilters(URL_KEYS);
  const activeCount = FILTER_KEYS.filter((k) => values[k]).length;

  const employeeOptions = useMemo(
    () =>
      employees
        .filter((e) => e.accessTotal > 0)
        .sort((a, b) => a.fullName.localeCompare(b.fullName))
        .map((e) => ({ value: e.employeeId, label: `${e.fullName} (${e.lanId})` })),
    [employees],
  );

  const approverOptions = useMemo(() => {
    const names = new Set<string>();
    let hasUnknown = false;
    for (const a of accesses) {
      if (a.status !== 'Pending Approval') continue;
      if (a.pendingApprover) names.add(a.pendingApprover);
      else hasUnknown = true;
    }
    const opts = [...names].sort((a, b) => a.localeCompare(b)).map((n) => ({ value: n, label: n }));
    if (hasUnknown) opts.push({ value: NO_APPROVER, label: 'Not available' });
    return opts;
  }, [accesses]);

  // Drop filters that no longer exist in the current manager scope (e.g. after the admin changes manager).
  useEffect(() => {
    if (state !== 'ready') return;
    if (values.employee && !employees.some((e) => e.employeeId === values.employee)) setFilter('employee', '');
    if (values.approver && !approverOptions.some((o) => o.value === values.approver)) setFilter('approver', '');
    if (values.view && !accesses.some((a) => a.requestId === values.view)) setFilter('view', '');
  }, [state, employees, accesses, approverOptions, values.employee, values.approver, values.view, setFilter]);

  const filtered = useMemo(() => {
    const q = normalize(values.q);
    return accesses.filter(
      (a) =>
        (!q || [a.employeeName, a.requestId, a.accessName].some((f) => normalize(f).includes(q))) &&
        matchesAccessStatusFilter(a, values.status) &&
        (!values.employee || a.employeeId === values.employee) &&
        (!values.bu || a.businessUnit === values.bu) &&
        matchesApprover(a, values.approver),
    );
  }, [accesses, values]);

  const selected = useMemo(() => accesses.find((a) => a.requestId === values.view) ?? null, [accesses, values.view]);
  const filteredEmployee = useMemo(() => employees.find((e) => e.employeeId === values.employee) ?? null, [employees, values.employee]);
  const closeDrawer = useCallback(() => setFilter('view', ''), [setFilter]);

  if (state === 'error') return <ErrorState message={error ?? ''} onRetry={reload} />;

  return (
    <>
      {filteredEmployee && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-accent/30 bg-accent-50 px-4 py-3 text-sm text-navy-900">
          <UserRound className="h-4 w-4 text-accent" aria-hidden />
          <span>
            Showing accesses for <span className="font-semibold">{filteredEmployee.fullName}</span>{' '}
            <span className="font-mono text-xs text-slate-500">{filteredEmployee.lanId}</span>
          </span>
          <button
            type="button"
            onClick={() => setFilter('employee', '')}
            className="ml-auto inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium text-accent hover:text-accent-600 focus-ring"
          >
            <X className="h-3.5 w-3.5" aria-hidden /> Show all employees
          </button>
        </div>
      )}
      <Card>
        <FilterBar
          activeCount={activeCount}
          onClear={() => clearFilters()}
          actions={
            <Button
              icon={<Download className="h-4 w-4" />}
              disabled={state !== 'ready' || filtered.length === 0}
              onClick={() => downloadCsv(`accesses-${todayIso()}.csv`, filtered, CSV_COLUMNS)}
              title="Exports all rows matching the current filters"
            >
              Export CSV
            </Button>
          }
        >
          <SearchInput label="Search access requests" value={values.q} onChange={(v) => setFilter('q', v)} placeholder="Search employee, request ID or access" />
          <SelectFilter label="Status" value={values.status} onChange={(v) => setFilter('status', v)} options={STATUS_OPTIONS} />
          <SelectFilter label="Employee" value={values.employee} onChange={(v) => setFilter('employee', v)} options={employeeOptions} />
          <SelectFilter label="Business unit" value={values.bu} onChange={(v) => setFilter('bu', v)} options={BUSINESS_UNITS.map((b) => ({ value: b, label: b }))} />
          <SelectFilter label="Approver" value={values.approver} onChange={(v) => setFilter('approver', v)} options={approverOptions} />
        </FilterBar>

        <DataTable
          ariaLabel="Access requests"
          columns={COLUMNS}
          rows={filtered}
          getRowKey={(a) => a.requestId}
          rowLabel={(a) => `Open request ${a.requestId} for ${a.employeeName}`}
          onRowClick={(a) => setFilter('view', a.requestId)}
          isRowSelected={(a) => a.requestId === values.view}
          loading={state === 'loading'}
          initialSort={{ key: 'request', dir: 'asc' }}
          pageSize={12}
          resetPageKey={FILTER_KEYS.map((k) => values[k]).join('|')}
          empty={
            <EmptyState
              icon={<SearchX className="h-5 w-5" />}
              title={activeCount ? 'No access requests match these filters' : 'No access requests in your scope'}
              description={
                activeCount
                  ? 'Try a different search term or clear the filters. Your manager context will not change.'
                  : 'No IDC access requests have been submitted for the employees in this scope.'
              }
              action={activeCount ? <Button onClick={() => clearFilters()}>Clear filters</Button> : undefined}
            />
          }
        />
      </Card>
      <AccessDrawer access={selected} onClose={closeDrawer} />
    </>
  );
}
