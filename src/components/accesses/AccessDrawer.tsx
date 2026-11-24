import { CheckCircle2, CircleAlert, CircleMinus, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { AccessView } from '../../domain/enrich';
import { ACCESS_STATUS_RULES, approverDisplay, shownRequestId } from '../../domain/status';
import { formatDateTime } from '../../utils/date';
import { AccessStatusBadge } from '../ui/Badge';
import { Drawer } from '../ui/Drawer';
import { Button, DetailGrid, Placeholder } from '../ui/primitives';

export function AccessDrawer({ access, onClose }: { access: AccessView | null; onClose: () => void }) {
  const navigate = useNavigate();
  if (!access) return null;
  const approver = approverDisplay(access);
  const rule = ACCESS_STATUS_RULES[access.status];
  // Effect of this item on the employee's onboarding status (rule D-018).
  const effect = access.keepsOnboardingPending
    ? {
        tone: 'border-amber-200 bg-amber-50/60',
        Icon: CircleAlert,
        iconClass: 'text-amber-600',
        title: 'Keeps onboarding pending',
        text: rule.description,
      }
    : access.status === 'Finished' || access.status === 'Committed'
      ? {
          tone: 'border-emerald-200 bg-emerald-50/60',
          Icon: CheckCircle2,
          iconClass: 'text-emerald-600',
          title: 'Done for onboarding',
          text:
            access.status === 'Committed'
              ? 'Committed: approved and provisioned. Usable even if not formally closed in IDC.'
              : rule.description,
        }
      : {
          tone: 'border-slate-200 bg-slate-50',
          Icon: CircleMinus,
          iconClass: 'text-slate-500',
          title: 'Closed for onboarding — access not granted',
          text: `${rule.description} Does not keep onboarding pending.`,
        };

  return (
    <Drawer
      open
      onClose={onClose}
      title={access.accessName}
      subtitle={
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs">{shownRequestId(access)}</span>
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
      <div className={`flex gap-3 rounded-lg border p-4 ${effect.tone}`}>
        <effect.Icon className={`mt-0.5 h-5 w-5 shrink-0 ${effect.iconClass}`} aria-hidden />
        <div className="text-sm">
          <p className="font-medium text-navy-900">{effect.title}</p>
          <p className="mt-0.5 text-slate-600">{effect.text}</p>
        </div>
      </div>

      <h3 className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wide text-slate-500">Request</h3>
      <DetailGrid
        items={[
          { label: 'Request ID', value: <span className="font-mono text-xs">{shownRequestId(access)}</span> },
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
