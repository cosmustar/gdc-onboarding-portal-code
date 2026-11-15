import { ArrowRight, ChevronRight, Info, KeyRound } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import type { EmployeeView } from '../../domain/enrich';
import { formatDate, relativeStartLabel } from '../../utils/date';
import { AccessStatusBadge, DeviceBadge, OnboardingBadge } from '../ui/Badge';
import { Drawer } from '../ui/Drawer';
import { Button, DetailGrid, EmptyState, Placeholder } from '../ui/primitives';

export function EmployeeDrawer({ employee, onClose }: { employee: EmployeeView | null; onClose: () => void }) {
  const { accesses } = useData();
  const navigate = useNavigate();
  const items = useMemo(
    () => (employee ? accesses.filter((a) => a.employeeId === employee.employeeId).sort((a, b) => Number(a.isCompleted) - Number(b.isCompleted)) : []),
    [accesses, employee],
  );

  if (!employee) return null;

  return (
    <Drawer
      open
      onClose={onClose}
      title={employee.fullName}
      subtitle={
        <span className="flex flex-wrap items-center gap-2">
          <span>{employee.jobTitle}</span>
          <span className="text-slate-300">•</span>
          <span className="font-mono text-xs">{employee.lanId}</span>
          <OnboardingBadge status={employee.onboardingStatus} />
        </span>
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" icon={<KeyRound className="h-4 w-4" />} onClick={() => navigate(`/accesses?employee=${encodeURIComponent(employee.employeeId)}`)}>
            View Employee Accesses
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Total requests" value={employee.accessTotal} />
        <Stat label="Completed requests" value={employee.accessCompleted} tone="text-emerald-700" />
        <Stat label="Pending requests" value={employee.accessOutstanding} tone={employee.accessOutstanding ? 'text-amber-700' : undefined} />
      </div>

      <h3 className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wide text-slate-500">Employee details</h3>
      <DetailGrid
        items={[
          { label: 'LAN ID', value: <span className="font-mono text-xs">{employee.lanId}</span> },
          { label: 'Email', value: employee.email },
          { label: 'Job title', value: employee.jobTitle },
          { label: 'Employee ID', value: <span className="font-mono text-xs">{employee.employeeId}</span> },
          { label: 'Manager', value: employee.managerName },
          { label: 'Business unit', value: employee.businessUnit },
          {
            label: 'Start date',
            value: (
              <>
                {formatDate(employee.startDate)} <span className="text-slate-400">· {relativeStartLabel(employee.startDate)}</span>
              </>
            ),
          },
          { label: 'Onboarding status', value: <OnboardingBadge status={employee.onboardingStatus} /> },
        ]}
      />

      <h3 className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wide text-slate-500">Device</h3>
      <div className="rounded-lg border border-slate-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-navy-900">{employee.device.deviceName ?? <Placeholder>No device record</Placeholder>}</p>
            {employee.device.deviceType && <p className="text-xs text-slate-500">{employee.device.deviceType}</p>}
          </div>
          <DeviceBadge assignment={employee.deviceAssignment} />
        </div>
        <p className="mt-3 flex gap-1.5 text-xs text-slate-500">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          A device name indicates an associated record only. Physical delivery is not confirmed and must be verified in ServiceNow.
        </p>
      </div>

      <h3 className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wide text-slate-500">Access requests ({items.length})</h3>
      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300">
          <EmptyState title="No IDC requests yet" description="This employee has no access request items in IDC, so their onboarding status is “Not Requested in IDC”." />
        </div>
      ) : (
        <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
          {items.map((a) => (
            <li key={a.requestId}>
              <button
                type="button"
                onClick={() => navigate(`/accesses?employee=${encodeURIComponent(employee.employeeId)}&view=${encodeURIComponent(a.requestId)}`)}
                className="group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 focus:outline-none focus-visible:bg-accent-50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-navy-900">{a.accessName}</p>
                  <p className="text-xs text-slate-500">
                    <span className="font-mono">{a.requestId}</span>
                    {a.status === 'Pending Approval' && <> · Approver: {a.pendingApprover ?? <Placeholder>Not available</Placeholder>}</>}
                  </p>
                </div>
                <AccessStatusBadge status={a.status} availabilityConfirmed={a.availabilityConfirmed} />
                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
      {items.length > 0 && (
        <button
          type="button"
          onClick={() => navigate(`/accesses?employee=${encodeURIComponent(employee.employeeId)}`)}
          className="mt-3 inline-flex items-center gap-1 rounded text-sm font-medium text-accent hover:text-accent-600 focus-ring"
        >
          Open in Accesses <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}
    </Drawer>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-3">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums ${tone ?? 'text-navy-900'}`}>{value}</p>
    </div>
  );
}
