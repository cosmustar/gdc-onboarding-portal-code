import { Download, UserSearch } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { EmployeeDrawer } from '../components/employees/EmployeeDrawer';
import { BuTag, DeviceBadge, OnboardingBadge } from '../components/ui/Badge';
import { DataTable, type Column } from '../components/ui/DataTable';
import { Button, Card, EmptyState, ErrorState, FilterBar, SearchInput, SelectFilter } from '../components/ui/primitives';
import { useData } from '../context/DataContext';
import type { EmployeeView } from '../domain/enrich';
import { normalize, ONBOARDING_SLUGS } from '../domain/filters';
import { useUrlFilters } from '../hooks/useUrlFilters';
import { BUSINESS_UNITS } from '../types/models';
import { downloadCsv, type CsvColumn } from '../utils/csv';
import { formatDate, relativeStartLabel, todayIso } from '../utils/date';

const FILTER_KEYS = ['q', 'status', 'bu', 'device', 'start'] as const;
const URL_KEYS = [...FILTER_KEYS, 'view'] as const;

// Long headers may wrap to two lines so the table fits notebook screens.
const WRAP = '!whitespace-normal';

const COLUMNS: Column<EmployeeView>[] = [
  {
    key: 'name',
    header: 'Employee Name',
    sortValue: (e) => e.fullName,
    // Email sits under the name (instead of its own column) so the table fits notebook screens.
    render: (e) => (
      <div>
        <div className="font-medium text-navy-900">{e.fullName}</div>
        <div className="text-xs text-slate-500">
          {/* <wbr> lets long emails break before the "@" only when space is short */}
          {e.email.split('@')[0]}
          {e.email.includes('@') && (
            <>
              <wbr />@{e.email.split('@').slice(1).join('@')}
            </>
          )}
        </div>
      </div>
    ),
  },
  { key: 'lan', header: 'LAN ID', sortValue: (e) => e.lanId, render: (e) => <span className="font-mono text-xs text-slate-600">{e.lanId}</span> },
  { key: 'bu', header: 'Business Unit', headerClassName: WRAP, sortValue: (e) => e.businessUnit, render: (e) => <BuTag bu={e.businessUnit} /> },
  { key: 'title', header: 'Job Title', sortValue: (e) => e.jobTitle, render: (e) => e.jobTitle },
  { key: 'manager', header: 'Manager', sortValue: (e) => e.managerName, render: (e) => e.managerName },
  {
    key: 'start',
    header: 'Start Date',
    sortValue: (e) => e.startDate,
    render: (e) => (
      <div className="whitespace-nowrap">
        <div>{formatDate(e.startDate)}</div>
        {e.isUpcoming && <div className="text-xs font-medium text-accent">{relativeStartLabel(e.startDate)}</div>}
      </div>
    ),
  },
  {
    key: 'device',
    header: 'Desktop / Device',
    headerClassName: WRAP,
    sortValue: (e) => e.device.deviceName ?? '~',
    render: (e) => (
      <div className="space-y-1">
        <DeviceBadge assignment={e.deviceAssignment} />
        {e.device.deviceName && <div className="font-mono text-[11px] text-slate-500">{e.device.deviceName}</div>}
      </div>
    ),
  },
  { key: 'status', header: 'Onboarding Status', headerClassName: WRAP, sortValue: (e) => e.onboardingStatus, render: (e) => <OnboardingBadge status={e.onboardingStatus} /> },
];

const CSV_COLUMNS: CsvColumn<EmployeeView>[] = [
  { header: 'Employee ID', value: (e) => e.employeeId },
  { header: 'Employee Name', value: (e) => e.fullName },
  { header: 'LAN ID', value: (e) => e.lanId },
  { header: 'Email', value: (e) => e.email },
  { header: 'Business Unit', value: (e) => e.businessUnit },
  { header: 'Job Title', value: (e) => e.jobTitle },
  { header: 'Manager', value: (e) => e.managerName },
  { header: 'Start Date', value: (e) => e.startDate },
  { header: 'Device Name', value: (e) => e.device.deviceName },
  { header: 'Device Assignment', value: (e) => e.deviceAssignment },
  { header: 'Onboarding Status', value: (e) => e.onboardingStatus },
  { header: 'Accesses Total', value: (e) => e.accessTotal },
  { header: 'Accesses Completed', value: (e) => e.accessCompleted },
  { header: 'Accesses Pending', value: (e) => e.accessOutstanding },
];

export function EmployeesPage() {
  const { employees, state, error, reload } = useData();
  const { values, setFilter, clearFilters } = useUrlFilters(URL_KEYS);
  const activeCount = FILTER_KEYS.filter((k) => values[k]).length;

  const filtered = useMemo(() => {
    const q = normalize(values.q);
    const status = ONBOARDING_SLUGS[values.status];
    return employees.filter(
      (e) =>
        (!q || [e.fullName, e.lanId, e.email].some((f) => normalize(f).includes(q))) &&
        (!status || e.onboardingStatus === status) &&
        (!values.bu || e.businessUnit === values.bu) &&
        (!values.device || (values.device === 'assigned' ? e.deviceAssignment === 'Device Assigned' : e.deviceAssignment === 'Not Assigned')) &&
        (!values.start || (values.start === 'upcoming' ? e.isUpcoming : !e.isUpcoming)),
    );
  }, [employees, values]);

  const selected = useMemo(() => employees.find((e) => e.employeeId === values.view) ?? null, [employees, values.view]);
  const closeDrawer = useCallback(() => setFilter('view', ''), [setFilter]);

  if (state === 'error') return <ErrorState message={error ?? ''} onRetry={reload} />;

  return (
    <>
      <Card>
        <FilterBar
          activeCount={activeCount}
          onClear={() => clearFilters()}
          actions={
            <Button
              icon={<Download className="h-4 w-4" />}
              disabled={state !== 'ready' || filtered.length === 0}
              onClick={() => downloadCsv(`employees-${todayIso()}.csv`, filtered, CSV_COLUMNS)}
              title="Exports all rows matching the current filters"
            >
              Export CSV
            </Button>
          }
        >
          <SearchInput label="Search employees" value={values.q} onChange={(v) => setFilter('q', v)} placeholder="Search name, LAN ID or email" />
          <SelectFilter
            label="Status"
            value={values.status}
            onChange={(v) => setFilter('status', v)}
            options={Object.entries(ONBOARDING_SLUGS).map(([value, label]) => ({ value, label }))}
          />
          <SelectFilter label="Business unit" value={values.bu} onChange={(v) => setFilter('bu', v)} options={BUSINESS_UNITS.map((b) => ({ value: b, label: b }))} />
          <SelectFilter
            label="Device"
            value={values.device}
            onChange={(v) => setFilter('device', v)}
            options={[
              { value: 'assigned', label: 'Device Assigned' },
              { value: 'unassigned', label: 'Not Assigned' },
            ]}
          />
          <SelectFilter
            label="Start"
            value={values.start}
            onChange={(v) => setFilter('start', v)}
            options={[
              { value: 'upcoming', label: 'Upcoming' },
              { value: 'started', label: 'Already started' },
            ]}
          />
        </FilterBar>

        <DataTable
          ariaLabel="Employees"
          columns={COLUMNS}
          rows={filtered}
          getRowKey={(e) => e.employeeId}
          rowLabel={(e) => `Open details for ${e.fullName}`}
          onRowClick={(e) => setFilter('view', e.employeeId)}
          isRowSelected={(e) => e.employeeId === values.view}
          loading={state === 'loading'}
          initialSort={{ key: 'name', dir: 'asc' }}
          resetPageKey={FILTER_KEYS.map((k) => values[k]).join('|')}
          empty={
            <EmptyState
              icon={<UserSearch className="h-5 w-5" />}
              title={activeCount ? 'No employees match these filters' : 'No employees in your scope'}
              description={
                activeCount
                  ? 'Try a different search term or clear the filters. Your manager context will not change.'
                  : 'There are no onboarding employees assigned to the selected manager yet.'
              }
              action={activeCount ? <Button onClick={() => clearFilters()}>Clear filters</Button> : undefined}
            />
          }
        />
      </Card>
      <EmployeeDrawer employee={selected} onClose={closeDrawer} />
    </>
  );
}
