export function daysBetweenInclusive(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const diff = Math.round((end.getTime() - start.getTime()) / 86_400_000);
  return Math.max(1, diff + 1);
}

export function formatDateRange(startDate: string | null, endDate: string | null): string {
  if (!startDate || !endDate) return '';
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const startLabel = start.toLocaleDateString('en-US', opts);
  const endLabel = end.toLocaleDateString('en-US', {
    ...opts,
    year: start.getFullYear() !== end.getFullYear() ? 'numeric' : undefined,
  });
  return `${startLabel} – ${endLabel}`;
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysIso(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00`);
  d.setDate(d.getDate() + days);
  // Format in local time: toISOString() is UTC and would shift the date back a day
  // for users east of UTC (e.g. Indonesia, UTC+7).
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function formatFullDate(isoDateTime: string | null): string {
  if (!isoDateTime) return '';
  return new Date(isoDateTime).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}
