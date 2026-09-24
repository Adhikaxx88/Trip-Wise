import type { SyntheticEvent } from 'react';
import imagesData from './images-master.json';

interface CityImages {
  hero: string;
  card: string;
  hotel: string;
}

interface ImagesMaster {
  cities: Record<string, CityImages>;
  activities: Record<string, string>;
  transport: Record<string, string>;
  hotels: Record<string, string>;
  airlines?: Record<string, string>;
  fallback: {
    city: string;
    activity: string;
    transport: string;
    hotel: string;
    hero: string;
  };
}

const images = imagesData as ImagesMaster;

/**
 * Neutral, local, always-available placeholder (brand gradient + plane glyph).
 * Used instead of a random stock photo so a broken image never shows something
 * unrelated to the place.
 */
export const FALLBACK_IMAGE = '/images/placeholder-travel.svg';

/** True when a URL is empty or is the neutral placeholder (i.e. there's no real photo to show). */
export function isFallbackImage(url: string | null | undefined): boolean {
  return !url || url.endsWith(FALLBACK_IMAGE);
}

/**
 * Hosts whose image URLs are fixed, specific files (never "random photo per seed").
 * Wikimedia/Wikipedia hold the verified images-master.json entries; images.unsplash.com
 * serves the hand-picked photo IDs used on the landing page.
 */
const TRUSTED_IMAGE_HOSTS = new Set([
  'commons.wikimedia.org',
  'upload.wikimedia.org',
  'en.wikipedia.org',
  'images.unsplash.com',
]);

/**
 * Returns `url` only when it comes from a trusted, deterministic source (a local
 * /path or a TRUSTED_IMAGE_HOSTS URL), otherwise `fallback`. Guards against stale
 * image URLs persisted in saved trips (localStorage) from older builds, which used
 * a random-photo service and could show a completely unrelated place.
 */
export function trustedImage(url: string | null | undefined, fallback: string = FALLBACK_IMAGE): string {
  if (!url) return fallback;
  if (url.startsWith('/') && !url.startsWith('//')) return url;
  try {
    return TRUSTED_IMAGE_HOSTS.has(new URL(url).hostname) ? url : fallback;
  } catch {
    return fallback;
  }
}

/** Shared <img onError> handler: swap to the neutral placeholder exactly once. */
export function handleImageError(e: SyntheticEvent<HTMLImageElement>): void {
  const img = e.currentTarget;
  img.onerror = null;
  if (!img.src.endsWith(FALLBACK_IMAGE)) img.src = FALLBACK_IMAGE;
}

export const getCityImage = (city: string, type: 'hero' | 'card' | 'hotel' = 'card'): string =>
  images.cities[city]?.[type] ?? images.fallback[type === 'hero' ? 'hero' : 'city'];

export const getActivityImage = (activityName: string): string => {
  const slug = activityName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-');
  if (images.activities[slug]) return images.activities[slug];
  const keywords = [
    // Specific/compound tokens first so e.g. "Arrive in Bali & check in" (slug
    // contains "check-in") resolves to the hotel photo rather than falling
    // through to a later, more generic keyword.
    'check-in',
    'departure',
    'airport',
    'hotel',
    'waterfall',
    'breakfast',
    'lunch',
    'dinner',
    'temple',
    'market',
    'food',
    'museum',
    'hiking',
    'spa',
    'sunset',
    'snorkel',
    'surf',
    'cook',
    'shop',
    'beach',
    // Deliberately no generic 'tour' keyword: the only tour photo is a specific
    // Hoi An landmark, which would mislabel e.g. a Paris walking tour.
  ];
  for (const kw of keywords) {
    if (slug.includes(kw) && images.activities[kw]) return images.activities[kw];
  }
  return images.activities.default;
};

export const getTransportImage = (type: string): string =>
  images.transport[type.toLowerCase().replace(/\s+/g, '-')] ?? images.transport.default;

export const getHotelImage = (tier: 'budget' | 'standard' | 'luxury'): string =>
  images.hotels[tier] ?? images.hotels.standard;

/** Airline logo by display name (e.g. "Garuda Indonesia"); falls back to the neutral placeholder. */
export const getAirlineLogo = (airline: string): string => images.airlines?.[airline] ?? FALLBACK_IMAGE;
