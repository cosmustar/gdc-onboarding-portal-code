import { buildDataset, type MockDataset } from '../data/mock/buildDataset';
import type { Manager, Session } from '../types/models';
import type { OnboardingDataService, ScopedData } from './OnboardingDataService';

const SIMULATED_LATENCY_MS = 450;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * In-memory implementation backed by fictional data.
 * Scope filtering here is a DEMO SIMULATION, not authorization.
 *
 * Append `?simulateError=1` to the URL to preview the error state.
 */
export class MockOnboardingDataService implements OnboardingDataService {
  private dataset: MockDataset | null = null;

  private get data(): MockDataset {
    this.dataset ??= buildDataset();
    return this.dataset;
  }

  async listDemoManagers(): Promise<Manager[]> {
    return structuredClone(this.data.managers);
  }

  async getScopedData(scope: Session): Promise<ScopedData> {
    await delay(SIMULATED_LATENCY_MS);
    if (new URLSearchParams(window.location.search).has('simulateError')) {
      throw new Error('Simulated data source error (remove ?simulateError from the URL).');
    }

    const { managers, employees, accessRequests, generatedAt } = this.data;
    const visibleEmployees = scope.role === 'admin' ? employees : employees.filter((e) => e.managerId === scope.managerId);
    const ids = new Set(visibleEmployees.map((e) => e.employeeId));

    return structuredClone({
      managers: scope.role === 'admin' ? managers : managers.filter((m) => m.managerId === scope.managerId),
      employees: visibleEmployees,
      accessRequests: accessRequests.filter((r) => ids.has(r.employeeId)),
      metadata: { lastUpdatedAt: generatedAt, sourceLabel: 'Fictional mock dataset' },
    });
  }
}
