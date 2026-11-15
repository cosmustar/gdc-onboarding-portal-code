import { CheckCircle2, CircleAlert, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { AccessView } from '../../domain/enrich';
import { ACCESS_STATUS_RULES, approverDisplay } from '../../domain/status';
import { formatDateTime } from '../../utils/date';
import { AccessStatusBadge } from '../ui/Badge';
import { Drawer } from '../ui/Drawer';
import { Button, DetailGrid, Placeholder } from '../ui/primitives';

export function AccessDrawer({ access, onClose }: { access: AccessView | null; onClose: () => void }) {
  const navigate = useNavigate();
  if (!access) return null;
  const approver = approverDisplay(access);
  const rule = ACCESS_STATUS_RULES[access.status];

  return (
    <Drawer
      open
      onClose={onClose}
      title={access.accessName}
      subtitle={
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs">{access.requestId}</span>
          <AccessStatusBadge status={access.status} availabilityConfirmed={access.availabilityConfirmed} />
        </span>
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" icon={<UserRound className="h-4 w-4" />} onClick={() => navigate(`/employees?view=${encodeURIComponent(access.employeeId)}`)}>
            View Employee
          </Button>
        </>
      }
    >
      <div className={`flex gap-3 rounded-lg border p-4 ${access.isCompleted ? 'border-emerald-200 bg-emerald-50/60' : 'border-amber-200 bg-amber-50/60'}`}>
        {access.isCompleted ? (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
        ) : (
          <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
        )}
        <div className="text-sm">
          <p className="font-medium text-navy-900">{access.isCompleted ? 'Counts as completed for onboarding' : 'Requires further action'}</p>
          <p className="mt-0.5 text-slate-600">
            {access.status === 'Committed'
              ? access.availabilityConfirmed
                ? 'Committed and availability confirmed by the target system.'
                : 'Committed, but availability is not confirmed. Treated as not completed.'
              : rule.description}
          </p>
        </div>
      </div>

      <h3 className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wide text-slate-500">Request</h3>
      <DetailGrid
        items={[
          { label: 'Request ID', value: <span className="font-mono text-xs">{access.requestId}</span> },
          { label: 'Access ID', value: <span className="font-mono text-xs">{access.accessId}</span> },
          { label: 'Application', value: access.application },
          { label: 'Category', value: access.category },
          { label: 'Raw status (IDC)', value: access.status },
          {
            label: 'Availability confirmed',
            value: access.status === 'Committed' ? (access.availabilityConfirmed ? 'Yes' : 'No') : <Placeholder>Not applicable</Placeholder>,
          },
          { label: 'Requested by', value: access.requestedBy },
          { label: 'Pending approver', value: approver.isPlaceholder ? <Placeholder>{approver.text}</Placeholder> : approver.text },
          { label: 'Requested at', value: formatDateTime(access.requestedAt) },
          { label: 'Last updated', value: formatDateTime(access.lastUpdatedAt) },
        ]}
      />

      <h3 className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wide text-slate-500">Employee</h3>
      <DetailGrid
        items={[
          { label: 'Employee', value: access.employeeName },
          { label: 'LAN ID', value: <span className="font-mono text-xs">{access.lanId}</span> },
          { label: 'Manager', value: access.managerName },
          { label: 'Business unit', value: access.businessUnit },
        ]}
      />

      <h3 className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wide text-slate-500">Comments</h3>
      <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{access.comments ?? <Placeholder>No comments</Placeholder>}</p>
    </Drawer>
  );
}
