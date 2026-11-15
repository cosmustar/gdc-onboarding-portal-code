/**
 * Loads the data visible to the current session and exposes enriched view models.
 * Re-fetches whenever the session (signed-in manager) changes.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { buildAccessViews, buildEmployeeViews, computeOverviewMetrics, type AccessView, type EmployeeView, type OverviewMetrics } from '../domain/enrich';
import { dataService } from '../services';
import type { DatasetMetadata, Manager } from '../types/models';
import { useSession } from './SessionContext';

type LoadState = 'loading' | 'ready' | 'error';

interface DataContextValue {
  state: LoadState;
  error: string | null;
  employees: EmployeeView[];
  accesses: AccessView[];
  /** Managers the signed-in user is authorized to see (used by the admin manager filter). */
  managers: Manager[];
  metrics: OverviewMetrics;
  metadata: DatasetMetadata | null;
  reload: () => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const { session, managerFilter } = useSession();
  const [state, setState] = useState<LoadState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [raw, setRaw] = useState<Awaited<ReturnType<typeof dataService.getScopedData>> | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const requestId = useRef(0);

  useEffect(() => {
    const id = ++requestId.current;
    setState('loading');
    setError(null);
    dataService
      .getScopedData(session)
      .then((data) => {
        if (id !== requestId.current) return; // a newer request superseded this one
        setRaw(data);
        setState('ready');
      })
      .catch((err: unknown) => {
        if (id !== requestId.current) return;
        setError(err instanceof Error ? err.message : 'Unable to load data.');
        setState('error');
      });
  }, [session, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  const value = useMemo<DataContextValue>(() => {
    const allEmployees = raw ? buildEmployeeViews(raw.employees, raw.accessRequests, raw.managers) : [];
    // Admin "filter by manager" is a VIEW filter applied on top of the authorized data.
    const employees = managerFilter ? allEmployees.filter((e) => e.managerId === managerFilter) : allEmployees;
    const accesses = raw ? buildAccessViews(raw.accessRequests, employees) : [];
    return {
      state,
      error,
      employees,
      accesses,
      managers: raw?.managers ?? [],
      metrics: computeOverviewMetrics(employees, accesses),
      metadata: raw?.metadata ?? null,
      reload,
    };
  }, [raw, state, error, reload, managerFilter]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
