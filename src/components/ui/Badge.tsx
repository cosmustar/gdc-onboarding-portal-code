import { AlertTriangle, CheckCircle2, CircleDashed, CircleSlash, Clock, HelpCircle, Laptop, Loader2, MinusCircle, ShieldCheck, TimerOff, XCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { ACCESS_STATUS_RULES, ONBOARDING_TONE, type DeviceAssignment, type Tone } from '../../domain/status';
import type { AccessStatus, OnboardingStatus } from '../../types/models';
import { cn } from '../../utils/cn';

const TONE_CLASSES: Record<Tone, string> = {
  green: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20',
  amber: 'bg-amber-50 text-amber-800 ring-amber-600/25',
  red: 'bg-red-50 text-red-700 ring-red-600/20',
  blue: 'bg-accent-50 text-accent-600 ring-accent/25',
  gray: 'bg-slate-100 text-slate-700 ring-slate-500/20',
  violet: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  teal: 'bg-teal-50 text-teal-800 ring-teal-600/20',
};

export function Badge({ tone, icon, children, title }: { tone: Tone; icon?: ReactNode; children: ReactNode; title?: string }) {
  return (
    <span
      title={title}
      className={cn('inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset', TONE_CLASSES[tone])}
    >
      {icon}
      {children}
    </span>
  );
}

const iconCls = 'h-3.5 w-3.5 shrink-0';

const ONBOARDING_ICON: Record<OnboardingStatus, ReactNode> = {
  Finished: <CheckCircle2 className={iconCls} aria-hidden />,
  Pending: <Clock className={iconCls} aria-hidden />,
  'Not Requested in IDC': <MinusCircle className={iconCls} aria-hidden />,
};

export function OnboardingBadge({ status }: { status: OnboardingStatus }) {
  return (
    <Badge tone={ONBOARDING_TONE[status]} icon={ONBOARDING_ICON[status]}>
      {status}
    </Badge>
  );
}

const ACCESS_ICON: Record<AccessStatus, ReactNode> = {
  Finished: <CheckCircle2 className={iconCls} aria-hidden />,
  Committed: <ShieldCheck className={iconCls} aria-hidden />,
  Pending: <CircleDashed className={iconCls} aria-hidden />,
  'Pending Approval': <Clock className={iconCls} aria-hidden />,
  Provisioning: <Loader2 className={iconCls} aria-hidden />,
  Failed: <XCircle className={iconCls} aria-hidden />,
  Rejected: <CircleSlash className={iconCls} aria-hidden />,
  Expired: <TimerOff className={iconCls} aria-hidden />,
  Unverifiable: <HelpCircle className={iconCls} aria-hidden />,
};

export function AccessStatusBadge({ status, availabilityConfirmed }: { status: AccessStatus; availabilityConfirmed?: boolean }) {
  const rule = ACCESS_STATUS_RULES[status];
  const unconfirmedCommit = status === 'Committed' && availabilityConfirmed === false;
  return (
    <Badge
      tone={unconfirmedCommit ? 'amber' : rule.tone}
      icon={unconfirmedCommit ? <AlertTriangle className={iconCls} aria-hidden /> : ACCESS_ICON[status]}
      title={unconfirmedCommit ? 'Committed — availability not confirmed (treated as not completed)' : rule.description}
    >
      {status}
      {unconfirmedCommit && <span className="font-normal opacity-80">· unconfirmed</span>}
    </Badge>
  );
}

export function DeviceBadge({ assignment }: { assignment: DeviceAssignment }) {
  const assigned = assignment === 'Device Assigned';
  return (
    <Badge
      tone={assigned ? 'blue' : 'gray'}
      icon={<Laptop className={iconCls} aria-hidden />}
      title={assigned ? 'A device record exists. Delivery must be confirmed in ServiceNow.' : 'No device record associated.'}
    >
      {assignment}
    </Badge>
  );
}

export function BuTag({ bu }: { bu: string }) {
  return <span className="inline-flex rounded-md bg-navy-900/5 px-2 py-0.5 text-xs font-semibold text-navy-700">{bu}</span>;
}
