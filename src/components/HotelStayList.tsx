import Button from './Button';
import { getCityImage, handleImageError } from '../data/getImage';
import type { HotelStay } from '../types';

interface HotelStayListProps {
  stays: HotelStay[];
  groupSize: number;
  showBook?: boolean;
}

/** One row per city so every stop on a multi-city trip has its own hotel, nights and price. */
export default function HotelStayList({ stays, groupSize, showBook = true }: HotelStayListProps) {
  return (
    <ul className="mt-4 space-y-2 border-t border-ink/10 pt-4">
      {stays.map((stay) => (
        <li key={stay.city} className="flex flex-wrap items-center gap-3">
          <img
            src={getCityImage(stay.city, 'card')}
            alt={stay.city}
            loading="lazy"
            onError={handleImageError}
            className="h-12 w-12 shrink-0 rounded-lg object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{stay.name}</p>
            <p className="text-xs text-ink/50">
              {stay.city} · {stay.nights} {stay.nights === 1 ? 'night' : 'nights'}
            </p>
          </div>
          <div className="text-right">
            <p className="font-display text-sm text-ocean-mid">${stay.cost.toLocaleString()}</p>
            <p className="text-[11px] text-ink/50">${Math.round(stay.cost / groupSize).toLocaleString()} / person</p>
          </div>
          {showBook && (
            <a href={stay.bookingUrl} target="_blank" rel="noreferrer">
              <Button variant="accent" className="px-3 py-1.5 text-xs">
                Book ↗
              </Button>
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}
