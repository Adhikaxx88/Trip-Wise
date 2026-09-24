import { Plane } from 'lucide-react';
import { getAirlineLogo, handleImageError, isFallbackImage } from '../data/getImage';
import type { FlightOption } from '../types';

interface FlightPickerProps {
  options: FlightOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}

/**
 * Verified airline logo, or null when none is mapped (e.g. Lion Air). The
 * option's own stored `logo` is intentionally ignored: trips saved by older
 * builds carry random stock photos there.
 */
function logoFor(option: FlightOption): string | null {
  const curated = getAirlineLogo(option.airline);
  return isFallbackImage(curated) ? null : curated;
}

/** "Lion Air" → "LA", "Citilink" → "CI". */
function airlineInitials(airline: string): string {
  const words = airline.split(/\s+/).filter(Boolean);
  const initials =
    words.length > 1 ? words.slice(0, 2).map((w) => w[0]) : Array.from(words[0] ?? '?').slice(0, 2);
  return initials.join('').toUpperCase();
}

export default function FlightPicker({ options, selectedId, onSelect }: FlightPickerProps) {
  return (
    <div>
      <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
        <Plane className="h-4 w-4 text-ocean-mid" aria-hidden />
        Choose your airline
      </p>
      <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'thin' }}>
        {options.map((option) => {
          const selected = option.id === selectedId;
          const logo = logoFor(option);
          return (
            <div
              key={option.id}
              className={`flex w-64 shrink-0 flex-col rounded-2xl border-2 bg-white p-3 shadow-sm transition-colors ${
                selected ? 'border-gold-accent shadow-[0_0_0_3px_rgba(255,218,97,0.25)]' : 'border-ink/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-white p-2 ring-1 ring-ink/10">
                  {logo ? (
                    <img
                      src={logo}
                      alt={`${option.airline} logo`}
                      loading="lazy"
                      onError={handleImageError}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span
                      role="img"
                      aria-label={`${option.airline} logo`}
                      className="font-display text-2xl font-bold tracking-wide text-ocean-deep"
                    >
                      {airlineInitials(option.airline)}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-semibold leading-snug text-ink">{option.airline}</p>
                  <p className="mt-1 font-display text-base text-ocean-mid">${option.pricePerPerson}</p>
                  <p className="text-xs text-ink/50">{option.duration}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
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
