import { KeyRound, LayoutDashboard, PanelLeftClose, PanelLeftOpen, ShieldAlert, Users, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../utils/cn';

export const NAV_ITEMS = [
  { to: '/overview', label: 'Overview', icon: LayoutDashboard, title: 'Overview', subtitle: 'Executive summary of onboarding progress' },
  { to: '/employees', label: 'Employees', icon: Users, title: 'Employees', subtitle: 'Everyone in the onboarding project' },
  { to: '/accesses', label: 'Accesses', icon: KeyRound, title: 'Accesses', subtitle: 'Traceability of every access request' },
] as const;

/**
 * Navigation sidebar.
 *  - Small screens: always an overlay, opened with the header menu button.
 *  - Large screens: pinned (pushes the content) by default. It can be hidden
 *    with "Hide menu"; it then opens as an overlay from the header menu button,
 *    the same way as on small screens, until it is pinned again.
 */
export function Sidebar({
  open,
  onClose,
  pinned,
  onTogglePinned,
}: {
  /** Overlay open (small screens, or large screens while not pinned). */
  open: boolean;
  onClose: () => void;
  /** Large screens only: the sidebar stays visible and pushes the content. */
  pinned: boolean;
  onTogglePinned: () => void;
}) {
  return (
    <>
      {open && <div className={cn('fixed inset-0 z-30 bg-navy-900/40', pinned && 'lg:hidden')} onClick={onClose} aria-hidden />}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-navy-800 text-slate-300 transition-transform duration-200',
          open ? 'translate-x-0' : '-translate-x-full',
          pinned && 'lg:translate-x-0',
        )}
        aria-label="Primary"
      >
        <div className="flex h-16 items-center justify-between gap-2 border-b border-white/10 pl-5 pr-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">GDC</div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-white">GDC Brazil</p>
              <p className="whitespace-nowrap text-xs text-slate-400">Onboarding Portal</p>
            </div>
          </div>
          <div className="flex items-center">
            <button
              type="button"
              className="hidden rounded p-1 text-slate-400 hover:text-white focus-ring lg:inline-flex"
              onClick={onTogglePinned}
              aria-label={pinned ? 'Hide menu' : 'Keep menu open'}
              title={pinned ? 'Hide menu' : 'Keep menu open'}
            >
              {pinned ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
            </button>
            <button type="button" className={cn('rounded p-1 text-slate-400 hover:text-white focus-ring', pinned && 'lg:hidden')} onClick={onClose} aria-label="Close navigation">
              <X className="h-5 w-5" />
            </button>
          </div>
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
          {import.meta.env.VITE_DATA_SOURCE === 'csv' ? 'Data from a Power BI export (local file).' : 'All data is fictional.'} Manager filtering is a
          client-side simulation, not authorization.
        </div>
      </aside>
    </>
  );
}
