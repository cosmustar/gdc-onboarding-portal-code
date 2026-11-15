import { KeyRound, LayoutDashboard, ShieldAlert, Users, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../utils/cn';

export const NAV_ITEMS = [
  { to: '/overview', label: 'Overview', icon: LayoutDashboard, title: 'Overview', subtitle: 'Executive summary of onboarding progress' },
  { to: '/employees', label: 'Employees', icon: Users, title: 'Employees', subtitle: 'Everyone in the onboarding project' },
  { to: '/accesses', label: 'Accesses', icon: KeyRound, title: 'Accesses', subtitle: 'Traceability of every access request' },
] as const;

export function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-30 bg-navy-900/40 lg:hidden" onClick={onClose} aria-hidden />}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-navy-800 text-slate-300 transition-transform duration-200 lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Primary"
      >
        <div className="flex h-16 items-center justify-between gap-3 border-b border-white/10 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">GDC</div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-white">GDC Brazil</p>
              <p className="text-xs text-slate-400">Onboarding Portal</p>
            </div>
          </div>
          <button type="button" className="rounded p-1 text-slate-400 hover:text-white focus-ring lg:hidden" onClick={onClose} aria-label="Close navigation">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-5">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Menu</p>
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                  isActive ? 'bg-navy-700 text-white shadow-inner' : 'text-slate-300 hover:bg-white/5 hover:text-white',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn('h-[18px] w-[18px]', isActive ? 'text-accent' : 'text-slate-400 group-hover:text-slate-200')} aria-hidden />
                  {label}
                  {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="m-3 rounded-lg border border-white/10 bg-white/5 p-3.5 text-xs leading-relaxed text-slate-400">
          <p className="mb-1 flex items-center gap-1.5 font-semibold text-slate-200">
            <ShieldAlert className="h-3.5 w-3.5 text-amber-300" aria-hidden />
            Prototype
          </p>
          All data is fictional. Manager filtering is a client-side simulation, not authorization.
        </div>
      </aside>
    </>
  );
}
