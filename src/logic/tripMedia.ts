import { getCityImage } from '../data/getImage';
import type { TripPackage } from '../types';

/**
 * Builds a destination-specific hero preview strip: the trip's own cover image,
 * plus one photo per city in a multi-city trip (or a couple of extra variations
 * for a legacy single-destination trip), sourced from the images-master.json
 * data layer via getImage.ts.
 */
export function getHeroImages(pkg: TripPackage): string[] {
  if (pkg.cities && pkg.cities.length > 0) {
    const cityImages = pkg.cities.map((city) => getCityImage(city, 'hero'));
    return [pkg.coverImageUrl, ...cityImages].slice(0, 4);
  }

  const destination = pkg.destination.split(',')[0].trim();
  return [pkg.coverImageUrl, getCityImage(destination, 'hero'), getCityImage(destination, 'card')].slice(0, 4);
}

/** Google Maps link for the area a hotel sits in, e.g. "Best Hotels in Seminyak Bali". */
export function hotelAreaMapsLink(hotelArea: string, city: string): string {
  return `https://maps.google.com/?q=${encodeURIComponent(`hotels in ${hotelArea} ${city}`)}`;
}

/** Google Maps link for a city's international airport. */
export function airportMapsLink(city: string): string {
  return `https://maps.google.com/?q=${encodeURIComponent(`${city} International Airport`)}`;
}

/** Deterministic pseudo-random 0..1 value derived from a string, for stable "random" values. */
function seededFraction(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return (Math.abs(hash) % 1000) / 1000;
}

/** Formats a number of Indonesian Rupiah as "Rp 150.000" (dot thousands separator, no decimals). */
export function formatIDR(amount: number): string {
  return `Rp ${new Intl.NumberFormat('id-ID').format(Math.round(amount))}`;
}

/** Deterministic per-day estimated local transport cost (rental car / bus / MRT) in IDR. */
export function dailyTransportCostIDR(destinationId: string, dayNumber: number): number {
  const fraction = seededFraction(`${destinationId}-transport-${dayNumber}`);
  const min = 50000;
  const max = 300000;
  const raw = min + fraction * (max - min);
  return Math.round(raw / 5000) * 5000;
}
