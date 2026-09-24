import type { TripPackage } from '../types';

function unsplashUrl(photoId: string, width = 1600): string {
  return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=${width}&q=80`;
}

function unsplashKeywords(keywords: string, width = 400, height = 300): string {
  return `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(keywords).replace(/%20/g, '+')}`;
}

/** Generic, always-available fallback used by every <img onError> in the app. */
export const GENERIC_FALLBACK_IMAGE = 'https://source.unsplash.com/800x500/?travel+destination+beautiful';

/**
 * Builds a destination-specific hero preview strip: the trip's own cover image,
 * plus one keyword-searched Unsplash photo per city in a multi-city trip (or a
 * few destination/tag-based variations for a legacy single-destination trip).
 */
export function getHeroImages(pkg: TripPackage): string[] {
  if (pkg.cities && pkg.cities.length > 0) {
    const cityImages = pkg.cities.map((city) => unsplashKeywords(`${city}+skyline+travel`));
    return [pkg.coverImageUrl, ...cityImages].slice(0, 4);
  }

  const destination = pkg.destination.split(',')[0].trim();
  const tagImages = (pkg.tags.length > 0 ? pkg.tags : ['landmark', 'city', 'travel']).map((tag) =>
    unsplashKeywords(`${destination}+${tag}`),
  );
  return [pkg.coverImageUrl, ...tagImages].slice(0, 4);
}

export const HOTEL_PLACEHOLDER_IMAGE = unsplashUrl('1566073771259-6a8506099945', 800);
export const FLIGHT_PLACEHOLDER_IMAGE = unsplashUrl('1436491865332-7a61a109cc05', 800);

/** A generic, always-available fallback image for a place/activity card. */
export const ACTIVITY_FALLBACK_IMAGE = unsplashUrl('1476514525535-07fb3b4ae5f1', 800);

/** Best-effort dynamic photo for a place by name. Unreliable — callers must handle onError. */
export function activityImageUrl(name: string, city?: string): string {
  const keywords = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 3)
    .join('+');
  const suffix = city ? `+${city.toLowerCase().replace(/\s+/g, '+')}` : '';
  return `https://source.unsplash.com/120x90/?${keywords}${suffix}`;
}

/** Google Maps link for a named place, optionally scoped to a city. */
export function placeMapsLink(name: string, city?: string): string {
  const query = city ? `${name} ${city}` : name;
  return `https://maps.google.com/?q=${encodeURIComponent(query)}`;
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

/** Plausible static rating (e.g. 4.3) derived deterministically from a hotel name. */
export function hotelRating(hotelName: string): number {
  const rating = 3.8 + seededFraction(hotelName) * 1.1;
  return Math.round(rating * 10) / 10;
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
