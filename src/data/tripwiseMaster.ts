import { getIntercityOptions as fallbackIntercityOptions, getIntracityOptions as fallbackIntracityOptions } from './transport';
import type { TransportOption } from '../types';

/**
 * tripwiseMaster.ts — single access layer over tripwise-master.json.
 *
 * The JSON consolidates the real geography/transport data already in
 * geography.ts and transport.ts. Per-city attractions, restaurants, and
 * hotel/hero images are template-generated (see scripts/generate-tripwise-master.ts)
 * rather than fabricated as specific real businesses, since there's no
 * verified data source for that. Routes not present in the curated JSON
 * (i.e. any pair not explicitly hand-authored in transport.ts) fall back to
 * the existing runtime generator in transport.ts, which already covers every
 * city/country combination — the JSON's `routes` section only holds the
 * routes literally hardcoded in source, matching the codebase audit.
 *
 * The JSON (~1MB) is loaded via a dynamic import so it doesn't bloat the
 * main bundle for pages that never touch trip data (Landing, Profile, etc.)
 * — it's fetched as its own chunk the first time any of the async accessors
 * below are called, then cached in memory for the rest of the session.
 */

export interface MasterAttraction {
  name: string;
  description: string;
  image: string;
  mapsLink: string;
  cost: number;
  duration: string;
  category: string;
  timeSlot: string;
}

export interface MasterRestaurant {
  name: string;
  cuisine: string;
  image: string;
  mapsLink: string;
  priceRange: string;
  mealType: 'breakfast' | 'lunch' | 'dinner';
}

export interface MasterCity {
  name: string;
  country: string;
  image: string;
  mapsLink: string;
  heroImages: string[];
  hotels: { area: string; image: string; mapsLink: string; priceRange: string };
  attractions: MasterAttraction[];
  restaurants: MasterRestaurant[];
  intracityTransport: { primaryLabel: string; options: { type: string; costPerTrip: string; image: string }[] };
}

interface MasterCountry {
  region: string;
  cities: MasterCity[];
}

interface MasterData {
  generatedAt: string;
  countries: Record<string, MasterCountry>;
  routes: Record<string, TransportOption[]>;
}

const FALLBACK_UNKNOWN_CITY_IMAGE = 'https://picsum.photos/seed/travel-default/800/500';
const FALLBACK_ATTRACTION_IMAGE = 'https://picsum.photos/seed/travel-activity/400/300';
export const GENERIC_BOOKING_URL = 'https://www.traveloka.com';

let dataPromise: Promise<MasterData> | null = null;

/** Loads (and caches) the master JSON as its own code-split chunk. */
function loadMaster(): Promise<MasterData> {
  if (!dataPromise) {
    dataPromise = import('./tripwise-master.json').then((mod) => mod.default as unknown as MasterData);
  }
  return dataPromise;
}

function unsplash(keywords: string, w = 800, h = 500): string {
  const seed = keywords
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
}

/** Get full city data (works for Indonesia and every international country in the JSON). */
export async function getCity(country: string, city: string): Promise<MasterCity | undefined> {
  const data = await loadMaster();
  return data.countries[country]?.cities.find((c) => c.name === city);
}

/** Finds a city by name alone, searching every country in the JSON (first match wins). */
export async function findCityByName(city: string): Promise<MasterCity | undefined> {
  const data = await loadMaster();
  for (const country of Object.values(data.countries)) {
    const match = country.cities.find((c) => c.name === city);
    if (match) return match;
  }
  return undefined;
}

/** Get every city known for a country. */
export async function getCitiesForCountry(country: string): Promise<MasterCity[]> {
  const data = await loadMaster();
  return data.countries[country]?.cities ?? [];
}

/** Get a generic image URL for any entity type, built from keywords (no JSON lookup needed). */
export function getImage(type: 'city' | 'attraction' | 'hotel' | 'restaurant' | 'transport', keywords: string): string {
  if (!keywords.trim()) return FALLBACK_UNKNOWN_CITY_IMAGE;
  const isSmall = type === 'attraction' || type === 'restaurant' || type === 'transport';
  return unsplash(keywords, isSmall ? 400 : 800, isSmall ? 300 : 500);
}

/** Google Maps link for any named place, optionally scoped to a city/country (pure string formatting, no JSON lookup). */
export function getMapsLink(placeName: string, city?: string, country?: string): string {
  const query = [placeName, city, country].filter(Boolean).join(' ');
  return `https://maps.google.com/?q=${encodeURIComponent(query)}`;
}

/** Attractions for a city, with a single generic fallback entry if the city isn't in the JSON. */
export async function getAttractions(country: string, city: string): Promise<MasterAttraction[]> {
  const cityData = await getCity(country, city);
  if (cityData) return cityData.attractions;
  return [
    {
      name: `${city} Highlights`,
      description: `Popular things to see and do in ${city}.`,
      image: FALLBACK_ATTRACTION_IMAGE,
      mapsLink: getMapsLink(`${city} attractions`, undefined, country),
      cost: 0,
      duration: '2 hours',
      category: 'landmark',
      timeSlot: 'morning',
    },
  ];
}

/** Restaurants for a city, empty array if unknown (no fabricated fallback restaurant). */
export async function getRestaurants(country: string, city: string): Promise<MasterRestaurant[]> {
  return (await getCity(country, city))?.restaurants ?? [];
}

/** Intracity transport options for a city — delegates to transport.ts's category-based fallback for unknown cities. */
export async function getIntracityOptions(city: string) {
  return (await findCityByName(city))?.intracityTransport ?? fallbackIntracityOptions(city);
}

/**
 * Intercity route options between two cities. Looks up the curated JSON
 * routes first (both directions), then falls back to transport.ts's runtime
 * generator, which synthesizes a sensible route for any city/country pair.
 */
export async function getIntercityRoute(
  fromCity: string,
  toCity: string,
  fromCountry?: string,
  toCountry?: string,
): Promise<TransportOption[]> {
  const data = await loadMaster();
  const direct = data.routes[`${fromCity}-${toCity}`] ?? data.routes[`${toCity}-${fromCity}`];
  if (direct) return direct;
  return fallbackIntercityOptions(fromCity, toCity, fromCountry, toCountry);
}

/** Alias matching the spec's requested name for the same lookup as getIntercityRoute. */
export async function getRoute(
  from: { city: string; country?: string },
  to: { city: string; country?: string },
): Promise<TransportOption[]> {
  return getIntercityRoute(from.city, to.city, from.country, to.country);
}

/** Booking URL for a transport type on a given route (pure lookup, no JSON needed — route is already resolved). */
export function getBookingUrl(transportType: TransportOption['type'], route: TransportOption[]): string {
  const match = route.find((r) => r.type === transportType);
  return match?.bookingUrl ?? GENERIC_BOOKING_URL;
}
