/**
 * Joins raw records into view models and computes every metric dynamically.
 * Nothing shown in the UI is hardcoded.
 */
import type { AccessRequest, BusinessUnit, Employee, Manager, OnboardingStatus } from '../types/models';
import { BUSINESS_UNITS } from '../types/models';
import { isFutureDate } from '../utils/date';
import { calculateOnboardingStatus, getDeviceAssignment, isAccessCompleted, type DeviceAssignment } from './status';

export interface EmployeeView extends Employee {
  managerName: string;
  onboardingStatus: OnboardingStatus;
  deviceAssignment: DeviceAssignment;
  isUpcoming: boolean;
  accessTotal: number;
  accessCompleted: number;
  accessOutstanding: number;
}

export interface AccessView extends AccessRequest {
  employeeName: string;
  lanId: string;
  businessUnit: BusinessUnit;
  managerId: string;
  managerName: string;
  isCompleted: boolean;
}

export function buildEmployeeViews(employees: Employee[], requests: AccessRequest[], managers: Manager[]): EmployeeView[] {
  const managerName = new Map(managers.map((m) => [m.managerId, m.name]));
  const byEmployee = groupRequests(requests);
  return employees.map((e) => {
    const reqs = byEmployee.get(e.employeeId) ?? [];
    const completed = reqs.filter(isAccessCompleted).length;
    return {
      ...e,
      managerName: managerName.get(e.managerId) ?? 'Unknown manager',
      onboardingStatus: calculateOnboardingStatus(reqs),
      deviceAssignment: getDeviceAssignment(e),
      isUpcoming: isFutureDate(e.startDate),
      accessTotal: reqs.length,
      accessCompleted: completed,
      accessOutstanding: reqs.length - completed,
    };
  });
}

export function buildAccessViews(requests: AccessRequest[], employees: EmployeeView[]): AccessView[] {
  const byId = new Map(employees.map((e) => [e.employeeId, e]));
  const views: AccessView[] = [];
  for (const r of requests) {
    const e = byId.get(r.employeeId);
    if (!e) continue; // outside the authorized scope
    views.push({
      ...r,
      employeeName: e.fullName,
      lanId: e.lanId,
      businessUnit: e.businessUnit,
      managerId: e.managerId,
      managerName: e.managerName,
      isCompleted: isAccessCompleted(r),
    });
  }
  return views;
}

export function groupRequests(requests: AccessRequest[]): Map<string, AccessRequest[]> {
  const map = new Map<string, AccessRequest[]>();
  for (const r of requests) {
    const list = map.get(r.employeeId);
    if (list) list.push(r);
    else map.set(r.employeeId, [r]);
  }
  return map;
}

export interface OverviewMetrics {
  totalAccesses: number;
  totalEmployees: number;
  totalManagers: number;
  pendingAccesses: number;
  awaitingApproval: number;
  onboarding: Record<OnboardingStatus, number>;
  byBusinessUnit: { businessUnit: BusinessUnit; employees: number }[];
  upcomingWithoutDevice: number;
  upcomingCount: number;
}

export function computeOverviewMetrics(employees: EmployeeView[], accesses: AccessView[]): OverviewMetrics {
  const onboarding: Record<OnboardingStatus, number> = { Finished: 0, Pending: 0, 'Not Requested in IDC': 0 };
  for (const e of employees) onboarding[e.onboardingStatus] += 1;

  const upcoming = employees.filter((e) => e.isUpcoming);
  return {
    totalAccesses: accesses.length,
    totalEmployees: new Set(employees.map((e) => e.employeeId)).size,
    totalManagers: new Set(employees.map((e) => e.managerId)).size,
    pendingAccesses: accesses.filter((a) => !a.isCompleted).length,
    awaitingApproval: accesses.filter((a) => a.status === 'Pending Approval').length,
    onboarding,
    byBusinessUnit: BUSINESS_UNITS.map((bu) => ({
      businessUnit: bu,
      employees: employees.filter((e) => e.businessUnit === bu).length,
    })),
    upcomingWithoutDevice: upcoming.filter((e) => e.deviceAssignment === 'Not Assigned').length,
    upcomingCount: upcoming.length,
  };
}
