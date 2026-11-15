import { FlaskConical } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSession } from '../../context/SessionContext';

const ADMIN_VALUE = '__admin__';

/**
 * DEMO ONLY — "Switch Demo User". Simulates which user is signed in.
 * In production this control is removed; identity comes from Okta SSO and
 * authorization is enforced by the backend.
 */
export function DemoManagerSwitcher() {
  const { session, setSession, demoManagers } = useSession();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const value = session.role === 'admin' ? ADMIN_VALUE : session.managerId;

  const onChange = (next: string) => {
    setSession(next === ADMIN_VALUE ? { role: 'admin' } : { role: 'manager', managerId: next });
    // Page filters (employee, approver, open drawer…) may not exist in the new user's scope.
    navigate(pathname, { replace: true });
  };

  return (
    <label
      className="flex items-center gap-2 rounded-lg border border-dashed border-amber-400 bg-amber-50/70 py-1 pl-2 pr-1"
      title="Demo only — mock authentication. Simulates the signed-in user. Production identity will come from Okta SSO."
    >
      <span className="inline-flex items-center gap-1 rounded bg-amber-400/90 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-950">
        <FlaskConical className="h-3 w-3" aria-hidden />
        Demo
      </span>
      <span className="hidden text-xs font-medium text-amber-900 xl:inline">Switch Demo User</span>
      <select
        aria-label="Switch demo user (mock authentication)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 max-w-[210px] cursor-pointer rounded-md border border-amber-300 bg-white pl-2 pr-7 text-sm font-medium text-navy-900 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
      >
        <option value={ADMIN_VALUE}>Alex Moreno · Admin</option>
        <optgroup label="Managers">
          {demoManagers.map((m) => (
            <option key={m.managerId} value={m.managerId}>
              {m.name} · {m.businessUnit}
            </option>
          ))}
        </optgroup>
      </select>
    </label>
  );
}
