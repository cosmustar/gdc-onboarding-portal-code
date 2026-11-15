import {
  ArrowRight,
  Building2,
  CalendarClock,
  CalendarDays,
  Clock3,
  Hourglass,
  KeyRound,
  LaptopMinimal,
  ShieldAlert,
  UserCheck,
  Users,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { BuTag, DeviceBadge } from '../components/ui/Badge';
import { DataTable, type Column } from '../components/ui/DataTable';
import { Card, CardHeader, EmptyState, ErrorState, SearchInput, Skeleton } from '../components/ui/primitives';
import { useData } from '../context/DataContext';
import { useSession } from '../context/SessionContext';
import type { EmployeeView } from '../domain/enrich';
import { normalize, onboardingSlugOf } from '../domain/filters';
import { ONBOARDING_STATUSES, type OnboardingStatus } from '../types/models';
import { cn } from '../utils/cn';
import { formatDate, formatDateTime, relativeStartLabel } from '../utils/date';

/** Status colors for the onboarding donut (always shown with a labeled legend). */
const ONBOARDING_COLORS: Record<OnboardingStatus, string> = {
  Finished: '#059669',
  Pending: '#F59E0B',
  'Not Requested in IDC': '#94A3B8',
};

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

const pct = (n: number, total: number) => (total ? Math.round((n / total) * 100) : 0);

export function OverviewPage() {
  const { state, error, reload, metrics, employees, metadata } = useData();
  const { session, profile, scopedManager } = useSession();
  const navigate = useNavigate();
  const loading = state === 'loading';
  const isManager = session.role === 'manager';

  if (state === 'error') return <ErrorState message={error ?? ''} onRetry={reload} />;

  const units = [...new Set(employees.map((e) => e.businessUnit))].sort();
  const scopeText = isManager ? 'Here is how onboarding is progressing for your team.' : scopedManager ? `Filtered to ${scopedManager.name}'s team.` : 'Global view across all managers.';

  return (
    <div className="space-y-6">
      {/* Greeting & context */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-navy-900">
            {greeting()}, {profile.firstName || profile.name}
          </h2>
          <p className="mt-1 text-sm text-slate-500">{scopeText}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5">
            <Building2 className="h-3.5 w-3.5 text-slate-400" aria-hidden />
            Business units:
            {loading ? <Skeleton className="h-4 w-12" /> : units.length ? units.map((u) => <BuTag key={u} bu={u} />) : <span>—</span>}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5">
            <Clock3 className="h-3.5 w-3.5 text-slate-400" aria-hidden />
            {loading || !metadata ? 'Refreshing…' : `Last updated ${formatDateTime(metadata.lastUpdatedAt)}`}
          </span>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={KeyRound}
          label="Total Accesses"
          value={metrics.totalAccesses}
          hint={`${metrics.totalAccesses - metrics.pendingAccesses} completed`}
          loading={loading}
          onClick={() => navigate('/accesses')}
        />
        <KpiCard
          icon={Users}
          label="Total Employees"
          value={metrics.totalEmployees}
          hint={`${metrics.upcomingCount} starting soon`}
          loading={loading}
          onClick={() => navigate('/employees')}
        />
        {isManager ? (
          <KpiCard
            icon={CalendarClock}
            label="Upcoming Starts"
            value={metrics.upcomingCount}
            hint="Not started yet"
            loading={loading}
            onClick={() => navigate('/employees?start=upcoming')}
          />
        ) : (
          <KpiCard
            icon={UsersRound}
            label="Total Managers"
            value={metrics.totalManagers}
            hint={scopedManager ? 'In the selected scope' : 'With onboarding employees'}
            loading={loading}
          />
        )}
        <KpiCard
          icon={Hourglass}
          label="Pending Accesses"
          value={metrics.pendingAccesses}
          hint={`${metrics.awaitingApproval} awaiting approval`}
          tone="amber"
          loading={loading}
          onClick={() => navigate('/accesses?status=outstanding')}
        />
      </div>

      {/* Analytical panels */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader title="Onboarding Status" subtitle="Employees by overall onboarding progress · click a status to view employees" />
          <OnboardingDonut loading={loading} counts={metrics.onboarding} total={metrics.totalEmployees} onSelect={(s) => navigate(`/employees?status=${onboardingSlugOf(s)}`)} />
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader title="Business Units" subtitle="Employees by business unit" />
          <BusinessUnits loading={loading} employees={employees} onSelect={(bu) => navigate(`/employees?bu=${bu}`)} />
        </Card>
      </div>

      {/* Attention required */}
      <AttentionRequired
        loading={loading}
        items={[
          {
            icon: UserCheck,
            label: 'Pending approvals',
            description: 'Access items waiting for an approver',
            count: metrics.awaitingApproval,
            to: '/accesses?status=pending-approval',
          },
          {
            icon: Hourglass,
            label: 'Pending onboardings',
            description: 'Employees with unresolved accesses',
            count: metrics.onboarding.Pending,
            to: '/employees?status=pending',
          },
          {
            icon: LaptopMinimal,
            label: 'Upcoming without device',
            description: 'Future starters with no device assigned',
            count: metrics.upcomingWithoutDevice,
            to: '/employees?start=upcoming&device=unassigned',
          },
        ]}
        onNavigate={navigate}
      />

      {/* Upcoming employees */}
      <UpcomingEmployees employees={employees} loading={loading} onOpen={(e) => navigate(`/employees?view=${encodeURIComponent(e.employeeId)}`)} />
    </div>
  );
}

/* ---------------------------------------------------------------- KPI card */

function KpiCard({
  icon: Icon,
  label,
  value,
  hint,
  loading,
  onClick,
  tone = 'navy',
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  hint: string;
  loading: boolean;
  onClick?: () => void;
  tone?: 'navy' | 'amber';
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={cn('flex h-10 w-10 items-center justify-center rounded-lg', tone === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-accent-50 text-accent')}>
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      </div>
      {loading ? <Skeleton className="mt-2 h-9 w-20" /> : <p className="mt-1 text-[2rem] font-semibold leading-tight tracking-tight text-navy-900 tabular-nums">{value}</p>}
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs">
        <span className="text-slate-500">{loading ? ' ' : hint}</span>
        {onClick && (
          <span className="inline-flex items-center gap-1 font-medium text-accent transition-transform group-hover:translate-x-0.5">
            View Details <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </span>
        )}
      </div>
    </>
  );

  const cls = 'group rounded-xl border border-slate-200/80 bg-white p-5 text-left shadow-card';
  return onClick ? (
    <button type="button" onClick={onClick} className={cn(cls, 'transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md focus-ring')}>
      {body}
    </button>
  ) : (
    <div className={cls}>{body}</div>
  );
}

/* ---------------------------------------------------------- Donut chart */

function OnboardingDonut({
  loading,
  counts,
  total,
  onSelect,
}: {
  loading: boolean;
  counts: Record<OnboardingStatus, number>;
  total: number;
  onSelect: (s: OnboardingStatus) => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center gap-8 p-6">
        <Skeleton className="h-44 w-44 rounded-full" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
      </div>
    );
  }
  if (total === 0) return <EmptyState title="No employees in this scope" description="Onboarding status will appear once employees are assigned." />;

  const data = ONBOARDING_STATUSES.map((s) => ({ name: s, value: counts[s] }));

  return (
    <div className="flex flex-col items-center gap-6 p-5 sm:flex-row sm:gap-8">
      <div className="relative h-48 w-48 shrink-0" role="img" aria-label={data.map((d) => `${d.name}: ${d.value}`).join(', ')}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.filter((d) => d.value > 0)}
              dataKey="value"
              nameKey="name"
              innerRadius="70%"
              outerRadius="100%"
              startAngle={90}
              endAngle={-270}
              stroke="#FFFFFF"
              strokeWidth={2}
              isAnimationActive={false}
              cursor="pointer"
              onClick={(d: { name?: string }) => d.name && onSelect(d.name as OnboardingStatus)}
            >
              {data
                .filter((d) => d.value > 0)
                .map((d) => (
                  <Cell key={d.name} fill={ONBOARDING_COLORS[d.name]} />
                ))}
            </Pie>
            <Tooltip
              cursor={false}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0];
                const n = Number(p.value);
                return (
                  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
                    <p className="font-semibold text-navy-900">{String(p.name)}</p>
                    <p className="text-slate-500">
                      {n} employees · {pct(n, total)}%
                    </p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-semibold text-navy-900 tabular-nums">{total}</span>
          <span className="text-xs text-slate-500">employees</span>
        </div>
      </div>

      <ul className="w-full flex-1 space-y-2">
        {data.map((d) => (
          <li key={d.name}>
            <button
              type="button"
              onClick={() => onSelect(d.name)}
              className="group flex w-full items-center gap-3 rounded-lg border border-slate-100 px-3.5 py-2.5 text-left transition-colors hover:border-slate-200 hover:bg-slate-50 focus-ring"
            >
              <span className="h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: ONBOARDING_COLORS[d.name] }} aria-hidden />
              <span className="flex-1 text-sm font-medium text-navy-900">{d.name}</span>
              <span className="text-sm font-semibold text-navy-900 tabular-nums">{d.value}</span>
              <span className="w-11 text-right text-xs text-slate-500 tabular-nums">{pct(d.value, total)}%</span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-300 transition-colors group-hover:text-accent" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------- Business units */

function BusinessUnits({ loading, employees, onSelect }: { loading: boolean; employees: EmployeeView[]; onSelect: (bu: string) => void }) {
  const { metrics } = useData();
  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
      </div>
    );
  }
  const total = metrics.totalEmployees;
  if (total === 0) return <EmptyState title="No employees in this scope" />;

  return (
    <ul className="space-y-2 p-5">
      {metrics.byBusinessUnit.map(({ businessUnit, employees: count }) => {
        const finished = employees.filter((e) => e.businessUnit === businessUnit && e.onboardingStatus === 'Finished').length;
        return (
          <li key={businessUnit}>
            <button type="button" onClick={() => onSelect(businessUnit)} className="group w-full rounded-lg p-3 text-left transition-colors hover:bg-slate-50 focus-ring">
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <span className="flex items-center gap-2 text-sm font-semibold text-navy-900">
                  {businessUnit}
                  <ArrowRight className="h-3.5 w-3.5 text-slate-300 transition-colors group-hover:text-accent" aria-hidden />
                </span>
                <span className="text-sm text-slate-500">
                  <span className="font-semibold text-navy-900 tabular-nums">{count}</span> · {pct(count, total)}%
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100" role="presentation">
                <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct(count, total)}%` }} />
              </div>
              <p className="mt-1.5 text-xs text-slate-500">
                {finished} of {count} finished onboarding
              </p>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/* --------------------------------------------------- Attention required */

interface AttentionItem {
  icon: LucideIcon;
  label: string;
  description: string;
  count: number;
  to: string;
}

function AttentionRequired({ items, loading, onNavigate }: { items: AttentionItem[]; loading: boolean; onNavigate: (to: string) => void }) {
  return (
    <Card>
      <div className="flex flex-col gap-3 p-4 md:flex-row md:items-stretch">
        <div className="flex items-center gap-2 px-1 md:w-44 md:shrink-0">
          <ShieldAlert className="h-4 w-4 text-amber-500" aria-hidden />
          <h2 className="text-sm font-semibold text-navy-900">Attention Required</h2>
        </div>
        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
          {items.map(({ icon: Icon, label, description, count, to }) => (
            <button
              key={label}
              type="button"
              onClick={() => onNavigate(to)}
              className="group flex items-center gap-3 rounded-lg border border-slate-200 px-3.5 py-3 text-left transition-colors hover:border-amber-300 hover:bg-amber-50/40 focus-ring"
            >
              <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', count ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600')}>
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-navy-900">{label}</span>
                <span className="block truncate text-xs text-slate-500">{count ? description : 'Nothing to follow up'}</span>
              </span>
              {loading ? <Skeleton className="h-6 w-8" /> : <span className="text-xl font-semibold text-navy-900 tabular-nums">{count}</span>}
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}

/* ---------------------------------------------------- Upcoming employees */

const UPCOMING_COLUMNS: Column<EmployeeView>[] = [
  {
    key: 'name',
    header: 'Employee Name',
    sortValue: (e) => e.fullName,
    render: (e) => (
      <div>
        <div className="font-medium text-navy-900">{e.fullName}</div>
        <div className="text-xs text-slate-500">{e.jobTitle}</div>
      </div>
    ),
  },
  { key: 'lan', header: 'LAN ID', sortValue: (e) => e.lanId, render: (e) => <span className="font-mono text-xs text-slate-600">{e.lanId}</span> },
  {
    key: 'device',
    header: 'Desktop / Device',
    sortValue: (e) => e.device.deviceName ?? '~',
    render: (e) => (e.device.deviceName ? <span className="font-mono text-xs text-navy-900">{e.device.deviceName}</span> : <span className="italic text-slate-400">—</span>),
  },
  { key: 'assignment', header: 'Device Assignment Status', sortValue: (e) => e.deviceAssignment, render: (e) => <DeviceBadge assignment={e.deviceAssignment} /> },
  {
    key: 'start',
    header: 'Start Date',
    sortValue: (e) => e.startDate,
    render: (e) => (
      <div className="whitespace-nowrap">
        <div>{formatDate(e.startDate)}</div>
        <div className="text-xs font-medium text-accent">{relativeStartLabel(e.startDate)}</div>
      </div>
    ),
  },
  { key: 'manager', header: 'Manager', sortValue: (e) => e.managerName, render: (e) => e.managerName },
  { key: 'bu', header: 'Business Unit', sortValue: (e) => e.businessUnit, render: (e) => <BuTag bu={e.businessUnit} /> },
];

function UpcomingEmployees({ employees, loading, onOpen }: { employees: EmployeeView[]; loading: boolean; onOpen: (e: EmployeeView) => void }) {
  const [query, setQuery] = useState('');
  const upcoming = useMemo(() => employees.filter((e) => e.isUpcoming), [employees]);
  const rows = useMemo(() => {
    const q = normalize(query);
    return q ? upcoming.filter((e) => [e.fullName, e.lanId, e.device.deviceName ?? '', e.managerName].some((f) => normalize(f).includes(q))) : upcoming;
  }, [upcoming, query]);

  const header: ReactNode = (
    <div className="flex flex-wrap items-center gap-3">
      <SearchInput label="Search upcoming employees" value={query} onChange={setQuery} placeholder="Search name, LAN ID or device" />
    </div>
  );

  return (
    <Card>
      <CardHeader
        title="Upcoming Employees"
        subtitle={
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden /> Employees with a future start date · a device name means a device record is assigned (delivery not verified)
          </span>
        }
        action={header}
      />
      <DataTable
        ariaLabel="Upcoming employees"
        columns={UPCOMING_COLUMNS}
        rows={rows}
        getRowKey={(e) => e.employeeId}
        rowLabel={(e) => `Open details for ${e.fullName}`}
        onRowClick={onOpen}
        loading={loading}
        initialSort={{ key: 'start', dir: 'asc' }}
        pageSize={8}
        resetPageKey={query}
        empty={
          <EmptyState
            icon={<CalendarDays className="h-5 w-5" />}
            title={query ? 'No upcoming employees match your search' : 'No upcoming employees'}
            description={query ? 'Try a different name, LAN ID or device.' : 'Everyone in this scope has already started.'}
          />
        }
      />
    </Card>
  );
}
