import { useEffect, useRef, useState } from 'react';
import { formatDateRange, todayIsoDate } from '../logic/dates';

interface DateRangePickerProps {
  startDate: string | null;
  endDate: string | null;
  onChange: (startDate: string | null, endDate: string | null) => void;
}

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function isoOf(year: number, month: number, day: number): string {
  const m = `${month + 1}`.padStart(2, '0');
  const d = `${day}`.padStart(2, '0');
  return `${year}-${m}-${d}`;
}

function buildMonthGrid(year: number, month: number): (string | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(isoOf(year, month, d));
  return cells;
}

const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const today = todayIsoDate();
  const initial = startDate ? new Date(`${startDate}T00:00:00`) : new Date(`${today}T00:00:00`);
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const goPrevMonth = () => {
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  };

  const goNextMonth = () => {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  };

  const handleDayClick = (iso: string) => {
    if (iso < today) return;
    if (!startDate || (startDate && endDate)) {
      onChange(iso, null);
    } else if (iso < startDate) {
      onChange(iso, null);
    } else {
      onChange(startDate, iso);
    }
  };

  const previewEnd = endDate ?? hoverDate;
  const cells = buildMonthGrid(viewYear, viewMonth);

  const triggerLabel =
    startDate && endDate
      ? formatDateRange(startDate, endDate)
      : startDate
        ? `${formatDateRange(startDate, startDate)} → select return date`
        : 'Select your travel dates';

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full rounded-2xl border-2 px-4 py-3.5 text-left text-base font-medium transition-colors cursor-pointer sm:px-6 sm:py-4 ${
          startDate && endDate
            ? 'border-ocean-mid text-ocean-deep'
            : 'border-ink/10 text-ink/50 hover:border-ocean-light/60'
        }`}
      >
        {triggerLabel}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center px-4 py-16 sm:items-center"
          style={{ backdropFilter: 'blur(12px)', background: 'rgba(0, 23, 42, 0.4)' }}
        >
          <div
            className="glass-panel w-full max-w-sm rounded-3xl p-5 shadow-2xl sm:p-6"
            style={{ background: 'color-mix(in srgb, var(--color-ocean-deepest) 92%, transparent)' }}
          >
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={goPrevMonth}
                aria-label="Previous month"
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 hover:bg-white/10 cursor-pointer"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <p className="font-display text-lg text-white">
                {MONTH_LABELS[viewMonth]} {viewYear}
              </p>
              <button
                type="button"
                onClick={goNextMonth}
                aria-label="Next month"
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 hover:bg-white/10 cursor-pointer"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            <div className="mt-4 grid grid-cols-7 gap-y-1 text-center text-xs font-semibold text-white/40">
              {WEEKDAY_LABELS.map((w, i) => (
                <span key={`${w}-${i}`}>{w}</span>
              ))}
            </div>

            <div className="mt-1 grid grid-cols-7 gap-y-1 text-center text-sm">
              {cells.map((iso, i) => {
                if (!iso) return <span key={`empty-${i}`} />;
                const disabled = iso < today;
                const isStart = iso === startDate;
                const isEnd = iso === endDate;
                const inRange =
                  startDate && previewEnd && iso > (startDate < previewEnd ? startDate : previewEnd) &&
                  iso < (startDate < previewEnd ? previewEnd : startDate);
                const isEdge = isStart || isEnd;
                return (
                  <button
                    key={iso}
                    type="button"
                    disabled={disabled}
                    onMouseEnter={() => setHoverDate(iso)}
                    onClick={() => handleDayClick(iso)}
                    className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors cursor-pointer disabled:cursor-not-allowed disabled:text-white/15 ${
                      isEdge
                        ? 'bg-gold-accent font-semibold text-ink'
                        : inRange
                          ? 'bg-gold-accent/25 text-white'
                          : disabled
                            ? ''
                            : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    {parseInt(iso.slice(8, 10), 10)}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => onChange(null, null)}
                className="text-sm font-medium text-white/50 hover:text-white cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full bg-gold-accent px-5 py-2 text-sm font-semibold text-ink hover:opacity-90 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
