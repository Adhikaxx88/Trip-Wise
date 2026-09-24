import type { FlightOption } from '../types';

interface FlightPickerProps {
  options: FlightOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function FlightPicker({ options, selectedId, onSelect }: FlightPickerProps) {
  return (
    <div>
      <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">✈️ Choose your airline</p>
      <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'thin' }}>
        {options.map((option) => {
          const selected = option.id === selectedId;
          return (
            <div
              key={option.id}
              className={`flex w-48 shrink-0 flex-col rounded-2xl border-2 bg-white p-3 shadow-sm transition-colors ${
                selected ? 'border-gold-accent shadow-[0_0_0_3px_rgba(255,218,97,0.25)]' : 'border-ink/10'
              }`}
            >
              <div className="flex items-center gap-2">
                <img
                  src={option.logo}
                  alt={option.airline}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://picsum.photos/seed/travel-default/80/80';
                  }}
                  className="h-10 w-10 shrink-0 rounded-full object-cover"
                />
                <p className="min-w-0 truncate text-sm font-semibold text-ink">{option.airline}</p>
              </div>
              <p className="mt-2 font-display text-base text-ocean-mid">${option.pricePerPerson}</p>
              <p className="text-xs text-ink/50">{option.duration}</p>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSelect(option.id)}
                  className={`flex-1 cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    selected
                      ? 'bg-gold-accent text-ink'
                      : 'bg-ocean-mid/10 text-ocean-mid hover:bg-ocean-mid/20'
                  }`}
                >
                  {selected ? 'Selected ✓' : 'Select'}
                </button>
                <a
                  href={option.bookingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 rounded-full bg-sky-blue px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-blue-deep"
                >
                  Book ↗
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
