/**
 * Core data models for the Onboarding Portal.
 *
 * These interfaces are the contract between the UI and the data layer.
 * The mock service returns these shapes today; a future API adapter must map
 * SailPoint IDC / ServiceNow / HR responses into the same shapes so that no
 * UI component needs to change.
 */

export type BusinessUnit = 'EMS' | 'ESS';

export const BUSINESS_UNITS: readonly BusinessUnit[] = ['EMS', 'ESS'] as const;

export interface Manager {
  managerId: string;
  name: string;
  email: string;
  title: string;
  businessUnit: BusinessUnit;
}

/** Device information. Future source: ServiceNow CMDB / asset assignment. */
export interface DeviceInfo {
  /** Device / desktop name. `null` when no device record is associated. */
  deviceName: string | null;
  deviceType: 'Laptop' | 'Desktop' | null;
  /**
   * Where this record came from. In the prototype it is always 'mock'.
   * A device name only means a record exists — it does NOT confirm delivery.
   */
  source: 'mock' | 'servicenow';
}

export interface Employee {
  employeeId: string;
  lanId: string;
  fullName: string;
  email: string;
  businessUnit: BusinessUnit;
  jobTitle: string;
  managerId: string;
  /** ISO date (YYYY-MM-DD) */
  startDate: string;
  device: DeviceInfo;
}

/** Raw access status as received from the identity system (IDC). */
export type AccessStatus =
  | 'Finished'
  | 'Pending'
  | 'Pending Approval'
  | 'Provisioning'
  | 'Failed'
  | 'Rejected'
  | 'Expired'
  | 'Committed'
  | 'Unverifiable';

export const ACCESS_STATUSES: readonly AccessStatus[] = [
  'Finished',
  'Committed',
  'Pending',
  'Pending Approval',
  'Provisioning',
  'Failed',
  'Rejected',
  'Expired',
  'Unverifiable',
] as const;

export interface AccessCatalogItem {
  accessId: string;
  name: string;
  application: string;
  category: 'Identity' | 'Collaboration' | 'Network' | 'Business Application' | 'Data' | 'Engineering';
}

/** One access request item (one access for one employee). Future source: SailPoint IDC. */
export interface AccessRequest {
  /** Unique internal key (row key, ?view= link). */
  requestId: string;
  /** ID shown on screen when it differs from the internal key (CSV mode). */
  displayRequestId?: string;
  accessId: string;
  accessName: string;
  application: string;
  /** 'Not available' when the source (e.g. Power BI export) has no category. */
  category: AccessCatalogItem['category'] | 'Not available';
  employeeId: string;
  status: AccessStatus;
  /**
   * For 'Committed' items: whether the target system confirmed the access is
   * actually available. Committed counts as completed ONLY when this is true.
   */
  availabilityConfirmed: boolean;
  requestedBy: string;
  /** Only meaningful while status is 'Pending Approval'. `null` = not available / not applicable. */
  pendingApprover: string | null;
  /** ISO datetime */
  requestedAt: string;
  /** ISO datetime */
  lastUpdatedAt: string;
  comments: string | null;
}

/** Derived onboarding status for an employee (never stored, always calculated). */
export type OnboardingStatus = 'Finished' | 'Pending' | 'Not Requested in IDC';

export const ONBOARDING_STATUSES: readonly OnboardingStatus[] = [
  'Finished',
  'Pending',
  'Not Requested in IDC',
] as const;

export interface DatasetMetadata {
  /** ISO datetime of the last data refresh. */
  lastUpdatedAt: string;
  sourceLabel: string;
}

/**
 * The identity the portal is acting for.
 * Production: derived server-side from the Okta OIDC token + role claims.
 * Prototype: chosen with the Demo Manager Switcher.
 */
export type Session =
  | { role: 'manager'; managerId: string }
  | { role: 'admin' };
