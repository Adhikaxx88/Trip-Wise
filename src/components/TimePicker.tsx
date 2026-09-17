const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = ['00', '15', '30', '45'];

interface ParsedTime {
  hour: number;
  minute: string;
  period: 'AM' | 'PM';
}

function parseTime(value: string): ParsedTime {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return { hour: 9, minute: '00', period: 'AM' };
  const hour = Math.min(12, Math.max(1, parseInt(match[1], 10)));
  const minute = MINUTES.includes(match[2]) ? match[2] : '00';
  const period = match[3].toUpperCase() === 'PM' ? 'PM' : 'AM';
  return { hour, minute, period };
}

function formatTime(parsed: ParsedTime): string {
  return `${parsed.hour}:${parsed.minute} ${parsed.period}`;
}

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function TimePicker({ value, onChange, className = '' }: TimePickerProps) {
  const parsed = parseTime(value);

  const update = (patch: Partial<ParsedTime>) => {
    onChange(formatTime({ ...parsed, ...patch }));
  };

  return (
    <div className={`flex shrink-0 items-center gap-1 ${className}`}>
      <select
        value={parsed.hour}
        onChange={(e) => update({ hour: parseInt(e.target.value, 10) })}
        aria-label="Hour"
        className="rounded-lg border border-ink/10 bg-white px-1 py-1.5 text-xs focus:border-ocean-mid focus:outline-none"
      >
        {HOURS.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
      <span className="text-ink/40">:</span>
      <select
        value={parsed.minute}
        onChange={(e) => update({ minute: e.target.value })}
        aria-label="Minute"
        className="rounded-lg border border-ink/10 bg-white px-1 py-1.5 text-xs focus:border-ocean-mid focus:outline-none"
      >
        {MINUTES.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
      <select
        value={parsed.period}
        onChange={(e) => update({ period: e.target.value as 'AM' | 'PM' })}
        aria-label="AM or PM"
        className="rounded-lg border border-ink/10 bg-white px-1 py-1.5 text-xs focus:border-ocean-mid focus:outline-none"
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
}
