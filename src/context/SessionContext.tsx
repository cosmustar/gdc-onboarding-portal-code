/**
 * Demo session — simulates "who is signed in".
 *
 * Production: replace with an Okta OIDC provider (e.g. @okta/okta-react) and
 * read the role/manager identity from validated token claims. The selection is
 * persisted to localStorage here ONLY so the demo survives a page refresh.
 *
 * Two different concepts live here and must not be confused:
 *  - `session`        WHO is signed in (admin or a specific manager). Determines
 *                     which records the data service returns (authorization —
 *                     enforced server-side in production).
 *  - `managerFilter`  an optional VIEW filter an administrator can apply to narrow
 *                     the global data to one manager. It is not authorization and
 *                     does not exist for managers (they are always scoped).
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { dataService } from '../services';
import type { Manager, Session } from '../types/models';

const STORAGE_KEY = 'gdc-onboarding.demo-session.v1';
const FILTER_KEY = 'gdc-onboarding.admin-manager-filter.v1';
const DEFAULT_SESSION: Session = { role: 'admin' };

export interface DemoUserProfile {
  name: string;
  firstName: string;
  title: string;
  email: string;
  roleLabel: string;
}

const ADMIN_PROFILE: DemoUserProfile = {
  name: 'Alex Moreno',
  firstName: 'Alex',
  title: 'Onboarding Program Administrator',
  email: 'alex.moreno@example.test',
  roleLabel: 'Administrator',
};

interface SessionContextValue {
  session: Session;
  setSession: (s: Session) => void;
  demoManagers: Manager[];
  profile: DemoUserProfile;
  /** Admin-only view filter ('' = All Managers). Always '' for managers. */
  managerFilter: string;
  setManagerFilter: (managerId: string) => void;
  /** Manager whose team is currently shown, or null for all managers. */
  scopedManager: Manager | null;
  /** Human-readable scope, e.g. "All Managers" or "Laura Mendes". */
  scopeLabel: string;
}

const SessionContext = createContext<SessionContextValue | null>(null);

function readStoredSession(): Session {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SESSION;
    const parsed = JSON.parse(raw) as Partial<Session> & { managerId?: unknown };
    if (parsed.role === 'admin') return { role: 'admin' };
    if (parsed.role === 'manager' && typeof parsed.managerId === 'string') return { role: 'manager', managerId: parsed.managerId };
  } catch {
    /* storage unavailable or corrupt — fall back to default */
  }
  return DEFAULT_SESSION;
}

function readStoredFilter(): string {
  try {
    return localStorage.getItem(FILTER_KEY) ?? '';
  } catch {
    return '';
  }
}

function store(key: string, value: string | null) {
  try {
    if (value) localStorage.setItem(key, value);
    else localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<Session>(readStoredSession);
  const [managerFilter, setManagerFilterState] = useState<string>(readStoredFilter);
  const [demoManagers, setDemoManagers] = useState<Manager[]>([]);

  useEffect(() => {
    dataService.listDemoManagers().then(setDemoManagers).catch(() => setDemoManagers([]));
  }, []);

  const setManagerFilter = useCallback((id: string) => {
    setManagerFilterState(id);
    store(FILTER_KEY, id || null);
  }, []);

  const setSession = useCallback(
    (s: Session) => {
      setSessionState(s);
      store(STORAGE_KEY, JSON.stringify(s));
      // A new signed-in user starts with a clean view: admin filters never carry over.
      setManagerFilter('');
    },
    [setManagerFilter],
  );

  // If a stored manager / filter no longer exists in the dataset, fall back safely.
  useEffect(() => {
    if (demoManagers.length === 0) return;
    if (session.role === 'manager' && !demoManagers.some((m) => m.managerId === session.managerId)) setSession(DEFAULT_SESSION);
    if (managerFilter && !demoManagers.some((m) => m.managerId === managerFilter)) setManagerFilter('');
  }, [demoManagers, session, managerFilter, setSession, setManagerFilter]);

  const value = useMemo<SessionContextValue>(() => {
    const find = (id: string) => demoManagers.find((m) => m.managerId === id) ?? null;
    const signedInManager = session.role === 'manager' ? find(session.managerId) : null;
    const effectiveFilter = session.role === 'admin' ? managerFilter : '';
    const scopedManager = session.role === 'manager' ? signedInManager : effectiveFilter ? find(effectiveFilter) : null;

    const profile: DemoUserProfile = signedInManager
      ? {
          name: signedInManager.name,
          firstName: signedInManager.name.split(' ')[0],
          title: signedInManager.title,
          email: signedInManager.email,
          roleLabel: 'Manager',
        }
      : session.role === 'admin'
        ? ADMIN_PROFILE
        : { name: 'Loading…', firstName: '', title: '', email: '', roleLabel: 'Manager' };

    return {
      session,
      setSession,
      demoManagers,
      profile,
      managerFilter: effectiveFilter,
      setManagerFilter,
      scopedManager,
      scopeLabel: scopedManager?.name ?? (session.role === 'admin' ? 'All Managers' : '…'),
    };
  }, [session, setSession, demoManagers, managerFilter, setManagerFilter]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
