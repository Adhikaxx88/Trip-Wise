import type { TripPackage } from '../types';

/**
 * A small pool of known-good, hardcoded Unsplash photo IDs used to fill out
 * the hero preview strip alongside the trip's own cover image. These are
 * static travel/scenery photos (same URL pattern used in src/data/destinations.ts)
 * — there's no Unsplash API key configured, so we can't search dynamically.
 */
const FILLER_HERO_PHOTO_IDS = [
  '1488646953014-85cb44e25828', // mountain lake
  '1502602898657-3e91760cbb34', // Paris / Seine
  '1507525428034-b723cf961d3e', // beach aerial
  '1500530855697-b586d89ba3ee', // scenic travel road
];

function unsplashUrl(photoId: string, width = 1600): string {
  return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=${width}&q=80`;
}

/** Builds a 3-4 image hero strip: the trip's real cover image plus filler scenic photos. */
export function getHeroImages(pkg: TripPackage): string[] {
  const filler = FILLER_HERO_PHOTO_IDS.map((id) => unsplashUrl(id)).filter(
    (url) => url !== pkg.coverImageUrl,
  );
  return [pkg.coverImageUrl, ...filler].slice(0, 4);
}

export const HOTEL_PLACEHOLDER_IMAGE = unsplashUrl('1566073771259-6a8506099945', 800);
export const FLIGHT_PLACEHOLDER_IMAGE = unsplashUrl('1436491865332-7a61a109cc05', 800);

/** A generic, always-available fallback image for a place/activity card. */
export const ACTIVITY_FALLBACK_IMAGE = unsplashUrl('1476514525535-07fb3b4ae5f1', 800);

/** Best-effort dynamic photo for a place by name. Unreliable — callers must handle onError. */
export function activityImageUrl(name: string): string {
  return `https://source.unsplash.com/400x300/?${encodeURIComponent(name)}`;
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
