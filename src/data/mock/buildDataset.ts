/**
 * Builds the fictional relational dataset from the compact seed.
 * Deterministic: the same seed always produces the same records
 * (only dates shift, relative to the day the demo is run).
 */
import type { AccessRequest, AccessStatus, Employee, Manager } from '../../types/models';
import { addDays, toIsoDate } from '../../utils/date';
import { ACCESS_CATALOG, APPROVERS, EMPLOYEE_SEEDS, MANAGERS, REQUESTERS } from './seed';

const CODE_TO_STATUS: Record<string, { status: AccessStatus; availabilityConfirmed: boolean }> = {
  F: { status: 'Finished', availabilityConfirmed: true },
  C: { status: 'Committed', availabilityConfirmed: true },
  c: { status: 'Committed', availabilityConfirmed: false },
  P: { status: 'Pending', availabilityConfirmed: false },
  A: { status: 'Pending Approval', availabilityConfirmed: false },
  V: { status: 'Provisioning', availabilityConfirmed: false },
  X: { status: 'Failed', availabilityConfirmed: false },
  R: { status: 'Rejected', availabilityConfirmed: false },
  U: { status: 'Unverifiable', availabilityConfirmed: false },
};

function commentFor(status: AccessStatus, confirmed: boolean): string | null {
  switch (status) {
    case 'Failed':
      return 'Provisioning connector returned an error. A ticket was raised with the IAM support team.';
    case 'Rejected':
      return 'Rejected by approver: requested role is not aligned with the job function. Resubmission required.';
    case 'Unverifiable':
      return 'Target system did not return a verifiable state. Manual verification required.';
    case 'Committed':
      return confirmed
        ? 'Committed in IDC and availability confirmed by the target system.'
        : 'Committed in IDC; availability not yet confirmed by the target system.';
    case 'Provisioning':
      return 'Provisioning in progress in the target system.';
    case 'Pending':
      return 'Queued for processing.';
    default:
      return null;
  }
}

function isoDateTime(day: Date, hour: number, minute: number, now: Date): string {
  const d = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, minute);
  return (d > now ? now : d).toISOString();
}

export interface MockDataset {
  managers: Manager[];
  employees: Employee[];
  accessRequests: AccessRequest[];
  generatedAt: string;
}

export function buildDataset(now: Date = new Date()): MockDataset {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const managerById = new Map(MANAGERS.map((m) => [m.managerId, m]));
  const [baseAccess, ...otherAccesses] = ACCESS_CATALOG;

  const employees: Employee[] = [];
  const accessRequests: AccessRequest[] = [];
  let requestSeq = 240_101;

  EMPLOYEE_SEEDS.forEach((seed, empIdx) => {
    const manager = managerById.get(seed.managerId);
    if (!manager) throw new Error(`Seed error: unknown manager ${seed.managerId}`);

    const startDate = addDays(today, seed.startOffsetDays);
    const [first, ...rest] = seed.fullName
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .split(' ');

    employees.push({
      employeeId: seed.employeeId,
      lanId: seed.lanId,
      fullName: seed.fullName,
      email: `${first}.${rest.join('')}@example.test`,
      businessUnit: seed.businessUnit,
      jobTitle: seed.jobTitle,
      managerId: seed.managerId,
      startDate: toIsoDate(startDate),
      device: { deviceName: seed.deviceName, deviceType: seed.deviceType, source: 'mock' },
    });

    // Every employee with requests gets the base network account first,
    // then a deterministic rotation of the remaining catalog.
    const rotation = otherAccesses.map((_, i) => otherAccesses[(i + empIdx * 3) % otherAccesses.length]);
    const accesses = [baseAccess, ...rotation];
    const codes = seed.accessCodes.split('');
    const requestBase = addDays(today, Math.min(seed.startOffsetDays - 21, -10));

    codes.forEach((code, k) => {
      const mapped = CODE_TO_STATUS[code];
      if (!mapped) throw new Error(`Seed error: unknown status code "${code}"`);
      const access = accesses[k];
      const rot = empIdx + k;

      let pendingApprover: string | null = null;
      if (mapped.status === 'Pending Approval') {
        if (rot % 7 === 3) pendingApprover = null; // approver not available from source
        else if (rot % 3 === 0) pendingApprover = manager.name;
        else pendingApprover = APPROVERS[rot % APPROVERS.length];
      }

      const requestedDay = addDays(requestBase, k);
      const isDone = mapped.status === 'Finished' || mapped.status === 'Committed';
      const updatedDay = isDone ? addDays(requestedDay, 2 + (rot % 4)) : addDays(today, -(rot % 3));

      accessRequests.push({
        requestId: `REQ-${requestSeq++}`,
        accessId: access.accessId,
        accessName: access.name,
        application: access.application,
        category: access.category,
        employeeId: seed.employeeId,
        status: mapped.status,
        availabilityConfirmed: mapped.availabilityConfirmed,
        requestedBy: rot % 4 === 0 ? REQUESTERS[rot % REQUESTERS.length] : manager.name,
        pendingApprover,
        requestedAt: isoDateTime(requestedDay, 9 + (k % 3), (k * 13) % 60, now),
        lastUpdatedAt: isoDateTime(updatedDay > today ? today : updatedDay, 8 + (rot % 4), (rot * 7) % 60, now),
        comments: commentFor(mapped.status, mapped.availabilityConfirmed),
      });
    });
  });

  // Referential integrity guard: every request must reference an existing employee.
  const employeeIds = new Set(employees.map((e) => e.employeeId));
  for (const r of accessRequests) {
    if (!employeeIds.has(r.employeeId)) throw new Error(`Orphan request ${r.requestId}`);
  }

  return { managers: MANAGERS, employees, accessRequests, generatedAt: now.toISOString() };
}
