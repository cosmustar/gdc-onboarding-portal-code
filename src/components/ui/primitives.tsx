import { AlertCircle, Inbox, RotateCcw, Search, X } from 'lucide-react';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../utils/cn';

/* ---------- Card ---------- */
export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn('rounded-xl border border-slate-200/80 bg-white shadow-card', className)}>{children}</section>;
}

export function CardHeader({ title, subtitle, action }: { title: string; subtitle?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
      <div>
        <h2 className="text-sm font-semibold text-navy-900">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ---------- Button ---------- */
type ButtonVariant = 'primary' | 'secondary' | 'ghost';
const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-white hover:bg-accent-600 shadow-sm',
  secondary: 'bg-white text-navy-900 border border-slate-300 hover:bg-slate-50 hover:border-slate-400',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-navy-900',
};

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; icon?: ReactNode }>(
  function Button({ variant = 'secondary', icon, className, children, type = 'button', ...rest }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'inline-flex h-9 items-center justify-center gap-2 rounded-lg px-3.5 text-sm font-medium transition-colors focus-ring disabled:cursor-not-allowed disabled:opacity-50',
          BUTTON_VARIANTS[variant],
          className,
        )}
        {...rest}
      >
        {icon}
        {children}
      </button>
    );
  },
);

/* ---------- Search ---------- */
export function SearchInput({ value, onChange, placeholder, label }: { value: string; onChange: (v: string) => void; placeholder: string; label: string }) {
  return (
    <div className="relative min-w-[220px] flex-1 sm:max-w-sm">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
      <input
        type="search"
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-8 text-sm text-navy-900 placeholder:text-slate-400 transition-colors hover:border-slate-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-700 focus-ring"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

/* ---------- Select ---------- */
export interface SelectOption {
  value: string;
  label: string;
}

export function SelectFilter({ label, value, onChange, options, allLabel = 'All' }: { label: string; value: string; onChange: (v: string) => void; options: SelectOption[]; allLabel?: string }) {
  return (
    <label className="flex items-center gap-2 text-xs font-medium text-slate-500">
      <span className="whitespace-nowrap">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'h-9 max-w-[220px] cursor-pointer rounded-lg border bg-white pl-3 pr-8 text-sm transition-colors hover:border-slate-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25',
          value ? 'border-accent/60 text-navy-900 font-medium' : 'border-slate-300 text-slate-700',
        )}
      >
        <option value="">{allLabel}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/* ---------- Filter bar ---------- */
export function FilterBar({ children, activeCount, onClear, actions }: { children: ReactNode; activeCount: number; onClear: () => void; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-3.5">
      {children}
      <div className="ml-auto flex items-center gap-2">
        {activeCount > 0 && (
          <Button variant="ghost" onClick={onClear} icon={<RotateCcw className="h-3.5 w-3.5" />} title="Clears page filters only. Your manager context is kept.">
            Clear filters ({activeCount})
          </Button>
        )}
        {actions}
      </div>
    </div>
  );
}

/* ---------- States ---------- */
export function EmptyState({ title, description, action, icon }: { title: string; description?: string; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">{icon ?? <Inbox className="h-5 w-5" />}</div>
      <p className="text-sm font-semibold text-navy-900">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card>
      <EmptyState
        icon={<AlertCircle className="h-5 w-5 text-red-500" />}
        title="We couldn't load onboarding data"
        description={message}
        action={
          <Button variant="primary" onClick={onRetry} icon={<RotateCcw className="h-4 w-4" />}>
            Try again
          </Button>
        }
      />
    </Card>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded bg-slate-200/70', className)} aria-hidden />;
}

/* ---------- Definition list (drawers) ---------- */
export function DetailGrid({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
      {items.map((it) => (
        <div key={it.label} className="min-w-0">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{it.label}</dt>
          <dd className="mt-1 break-words text-sm text-navy-900">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Placeholder({ children }: { children: ReactNode }) {
  return <span className="italic text-slate-400">{children}</span>;
}
