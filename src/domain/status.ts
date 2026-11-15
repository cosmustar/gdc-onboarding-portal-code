/**
 * CENTRALIZED BUSINESS RULES — access status mapping and onboarding status.
 *
 * Raw access status (from IDC) and derived onboarding status (per employee)
 * are deliberately kept separate. Every screen uses these functions; no
 * component re-implements status logic.
 */
import type { AccessRequest, AccessStatus, Employee, OnboardingStatus } from '../types/models';

/**
 * How each raw status contributes to onboarding completion.
 *  - completed:   successfully provisioned / confirmed
 *  - conditional: completed only if `availabilityConfirmed` is true (Committed)
 *  - in_progress: still moving through the workflow
 *  - blocked:     needs intervention (failed / rejected) — NOT completed
 *  - unresolved:  state cannot be confirmed — NOT completed
 */
export type AccessResolution = 'completed' | 'conditional' | 'in_progress' | 'blocked' | 'unresolved';

export type Tone = 'green' | 'amber' | 'red' | 'blue' | 'gray' | 'violet' | 'teal';

export interface AccessStatusRule {
  resolution: AccessResolution;
  tone: Tone;
  description: string;
}

export const ACCESS_STATUS_RULES: Record<AccessStatus, AccessStatusRule> = {
  Finished: { resolution: 'completed', tone: 'green', description: 'Access was successfully provisioned.' },
  Committed: {
    resolution: 'conditional',
    tone: 'teal',
    description: 'Committed in IDC. Counts as completed only when availability is confirmed.',
  },
  Pending: { resolution: 'in_progress', tone: 'amber', description: 'Request is queued and has not started processing.' },
  'Pending Approval': { resolution: 'in_progress', tone: 'amber', description: 'Waiting for an approver decision.' },
  Provisioning: { resolution: 'in_progress', tone: 'blue', description: 'Being provisioned in the target system.' },
  Failed: { resolution: 'blocked', tone: 'red', description: 'Provisioning failed. Not treated as completed.' },
  Rejected: { resolution: 'blocked', tone: 'red', description: 'Rejected by an approver. Not treated as completed.' },
  Unverifiable: {
    resolution: 'unresolved',
    tone: 'violet',
    description: 'State could not be verified. Treated as unresolved until confirmed.',
  },
};

/** True only when the access item is confirmed complete. */
export function isAccessCompleted(req: Pick<AccessRequest, 'status' | 'availabilityConfirmed'>): boolean {
  const { resolution } = ACCESS_STATUS_RULES[req.status];
  if (resolution === 'completed') return true;
  if (resolution === 'conditional') return req.availabilityConfirmed;
  return false;
}

/** "Outstanding" = requires further action (anything not confirmed complete). */
export const isAccessOutstanding = (req: AccessRequest) => !isAccessCompleted(req);

/**
 * Onboarding status for one employee, from that employee's IDC request items.
 *  - No items                         → Not Requested in IDC
 *  - All items confirmed complete     → Finished
 *  - Anything else (incl. Failed, Rejected, Unverifiable, unconfirmed Committed) → Pending
 */
export function calculateOnboardingStatus(employeeRequests: AccessRequest[]): OnboardingStatus {
  if (employeeRequests.length === 0) return 'Not Requested in IDC';
  return employeeRequests.every(isAccessCompleted) ? 'Finished' : 'Pending';
}

export const ONBOARDING_TONE: Record<OnboardingStatus, Tone> = {
  Finished: 'green',
  Pending: 'amber',
  'Not Requested in IDC': 'gray',
};

/** Device assignment is independent of onboarding status. */
export type DeviceAssignment = 'Device Assigned' | 'Not Assigned';

/**
 * A device name being present means a device record is associated — it does
 * NOT confirm physical delivery. Production must verify against ServiceNow.
 */
export function getDeviceAssignment(employee: Employee): DeviceAssignment {
  const name = employee.device.deviceName?.trim();
  return name ? 'Device Assigned' : 'Not Assigned';
}

/** Display rule for the approver column. Never invents a name. */
export function approverDisplay(req: AccessRequest): { text: string; isPlaceholder: boolean } {
  if (req.status !== 'Pending Approval') return { text: 'Not applicable', isPlaceholder: true };
  if (!req.pendingApprover) return { text: 'Not available', isPlaceholder: true };
  return { text: req.pendingApprover, isPlaceholder: false };
}
