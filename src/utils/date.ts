/** Date helpers. All "date-only" values are local-calendar YYYY-MM-DD strings. */

const pad = (n: number) => String(n).padStart(2, '0');

export function toIsoDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayIso(): string {
  return toIsoDate(new Date());
}

/** Parse YYYY-MM-DD as a local date (avoids the UTC shift of `new Date('YYYY-MM-DD')`). */
export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(base: Date, days: number): Date {
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  d.setDate(d.getDate() + days);
  return d;
}

/** Whole days from today to the given date (negative = past). */
export function daysFromToday(iso: string): number {
  const today = parseIsoDate(todayIso()).getTime();
  const target = parseIsoDate(iso).getTime();
  return Math.round((target - today) / 86_400_000);
}

export function isFutureDate(iso: string): boolean {
  return daysFromToday(iso) > 0;
}

const dateFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const dateTimeFmt = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

export function formatDate(iso: string): string {
  return dateFmt.format(parseIsoDate(iso));
}

export function formatDateTime(iso: string): string {
  return dateTimeFmt.format(new Date(iso));
}

export function relativeStartLabel(iso: string): string {
  const days = daysFromToday(iso);
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days > 1) return `In ${days} days`;
  if (days === -1) return 'Yesterday';
  return `${Math.abs(days)} days ago`;
}
