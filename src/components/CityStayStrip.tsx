import { getCityImage, handleImageError } from '../data/getImage';

interface CityStayStripProps {
  cities: string[];
  /** Small caption above the tiles. */
  caption?: string;
  className?: string;
}

/** Labeled per-city image tiles, used on multi-city trips so the hotel card reflects every stop. */
export default function CityStayStrip({ cities, caption = 'Stays in each city', className = '' }: CityStayStripProps) {
  if (cities.length === 0) return null;
  return (
    <div className={className}>
      <p className="text-[11px] font-medium uppercase tracking-wide text-ink/40">{caption}</p>
      <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {cities.map((city) => (
          <div key={city} className="relative h-16 overflow-hidden rounded-lg bg-ink/5">
            <img
              src={getCityImage(city, 'card')}
              alt={city}
              loading="lazy"
              onError={handleImageError}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
            <span className="absolute inset-x-2 bottom-1 truncate text-[11px] font-semibold text-white">{city}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
