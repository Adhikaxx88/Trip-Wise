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
    'beach',
    'temple',
    'market',
    'food',
    'museum',
    'hiking',
    'spa',
    'sunset',
    'breakfast',
    'lunch',
    'dinner',
    'snorkel',
    'surf',
    'cook',
    'shop',
    'tour',
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
