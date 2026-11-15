import { Clock3, Lock, Menu, UserRound, Users } from 'lucide-react';
import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useSession } from '../../context/SessionContext';
import { cn } from '../../utils/cn';
import { formatDateTime } from '../../utils/date';
import { DemoManagerSwitcher } from './DemoManagerSwitcher';
import { NAV_ITEMS, Sidebar } from './Sidebar';

export function AppLayout() {
  const [navOpen, setNavOpen] = useState(false);
  const { pathname } = useLocation();
  const page = NAV_ITEMS.find((n) => pathname.startsWith(n.to)) ?? NAV_ITEMS[0];

  return (
    <div className="min-h-screen bg-canvas">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:shadow">
        Skip to content
      </a>
      <Sidebar mobileOpen={navOpen} onClose={() => setNavOpen(false)} />
      <div className="lg:pl-64">
        <Header title={page.title} subtitle={page.subtitle} onOpenNav={() => setNavOpen(true)} />
        <ScopeStrip />
        <main id="main" className="mx-auto max-w-[1440px] px-4 pb-12 pt-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function Header({ title, subtitle, onOpenNav }: { title: string; subtitle: string; onOpenNav: () => void }) {
  const { profile } = useSession();
  const { metadata, state } = useData();
  const initials = profile.name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('');

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <button type="button" onClick={onOpenNav} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus-ring lg:hidden" aria-label="Open navigation">
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold text-navy-900">{title}</h1>
          <p className="hidden truncate text-xs text-slate-500 sm:block">{subtitle}</p>
        </div>

        <div className="ml-auto flex items-center gap-3 lg:gap-5">
          <div className="hidden items-center gap-1.5 text-xs text-slate-500 md:flex" aria-live="polite">
            <Clock3 className="h-3.5 w-3.5" aria-hidden />
            {state === 'loading' || !metadata ? 'Refreshing…' : <>Last updated {formatDateTime(metadata.lastUpdatedAt)}</>}
          </div>
          <DemoManagerSwitcher />
          <div className="hidden items-center gap-2.5 border-l border-slate-200 pl-4 sm:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-700 text-xs font-semibold text-white" aria-hidden>
              {initials || <UserRound className="h-4 w-4" />}
            </div>
            <div className="hidden leading-tight lg:block">
              <p className="text-sm font-medium text-navy-900">{profile.name}</p>
              <p className="text-xs text-slate-500">{profile.roleLabel}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

/** Global manager scope — shared by Overview, Employees and Accesses. */
function ScopeStrip() {
  const { session, scopeLabel, managerFilter, setManagerFilter, demoManagers } = useSession();
  const { metrics, state, managers } = useData();
  const options = managers.length ? managers : demoManagers;

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex min-h-[48px] max-w-[1440px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2 text-xs text-slate-500 sm:px-6 lg:px-8">
        {session.role === 'admin' ? (
          <label className="flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-400" aria-hidden />
            <span className="font-medium">Manager</span>
            <select
              aria-label="Filter all pages by manager"
              value={managerFilter}
              onChange={(e) => setManagerFilter(e.target.value)}
              className={cn(
                'h-8 cursor-pointer rounded-lg border bg-white pl-3 pr-8 text-sm transition-colors hover:border-slate-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25',
                managerFilter ? 'border-accent/60 font-medium text-navy-900' : 'border-slate-300 text-slate-700',
              )}
            >
              <option value="">All Managers</option>
              {options.map((m) => (
                <option key={m.managerId} value={m.managerId}>
                  {m.name} · {m.businessUnit}
                </option>
              ))}
            </select>
            {managerFilter && (
              <button type="button" onClick={() => setManagerFilter('')} className="rounded px-1.5 py-1 font-medium text-accent hover:text-accent-600 focus-ring">
                Show all
              </button>
            )}
          </label>
        ) : (
          <span className="inline-flex items-center gap-2 rounded-lg bg-navy-900/5 px-3 py-1.5 text-sm text-navy-900" title="Your view is automatically limited to your team.">
            <Lock className="h-3.5 w-3.5 text-slate-500" aria-hidden />
            <span>
              Your Team — <span className="font-semibold">{scopeLabel}</span>
            </span>
          </span>
        )}
        {state === 'ready' && (
          <span className="text-slate-400">
            {metrics.totalEmployees} employees · {metrics.totalAccesses} access items
          </span>
        )}
        <span className="ml-auto hidden text-slate-400 md:inline">Scope applies to every page</span>
      </div>
    </div>
  );
}
