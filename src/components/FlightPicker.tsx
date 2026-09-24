import { Plane } from 'lucide-react';
import { getAirlineLogo, FALLBACK_IMAGE, handleImageError } from '../data/getImage';
import type { FlightOption } from '../types';

interface FlightPickerProps {
  options: FlightOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}

/** Prefer the curated airline logo; fall back to the option's own logo when none is mapped. */
function logoFor(option: FlightOption): string {
  const curated = getAirlineLogo(option.airline);
  return curated !== FALLBACK_IMAGE ? curated : option.logo || FALLBACK_IMAGE;
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
          return (
            <div
              key={option.id}
              className={`flex w-64 shrink-0 flex-col rounded-2xl border-2 bg-white p-3 shadow-sm transition-colors ${
                selected ? 'border-gold-accent shadow-[0_0_0_3px_rgba(255,218,97,0.25)]' : 'border-ink/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-white p-2 ring-1 ring-ink/10">
                  <img
                    src={logoFor(option)}
                    alt={`${option.airline} logo`}
                    loading="lazy"
                    onError={handleImageError}
                    className="h-full w-full object-contain"
                  />
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
