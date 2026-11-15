/**
 * Data-source abstraction. The UI depends ONLY on this interface.
 *
 * Today:      MockOnboardingDataService (in-memory fictional data).
 * Production: an HttpOnboardingDataService calling an approved backend (BFF)
 *             that aggregates SailPoint IDC, ServiceNow and HR data.
 *
 * SECURITY: `scope` is a client-side hint for the demo only. A real backend must
 * derive the caller's identity and role from the validated Okta token and
 * enforce row-level authorization server-side, ignoring any client-sent scope.
 */
import type { AccessRequest, DatasetMetadata, Employee, Manager, Session } from '../types/models';

export interface ScopedData {
  managers: Manager[];
  employees: Employee[];
  accessRequests: AccessRequest[];
  metadata: DatasetMetadata;
}

export interface OnboardingDataService {
  /** Identities available to the Demo Manager Switcher (demo only — not needed in production). */
  listDemoManagers(): Promise<Manager[]>;
  /** All records visible to the given session. */
  getScopedData(scope: Session): Promise<ScopedData>;
}
