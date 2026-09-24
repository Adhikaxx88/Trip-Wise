import { getActivityImage } from './getImage';

export interface ActivitySuggestion {
  name: string;
  cost: number;
}

export function suggestionSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Verified activity thumbnail (or the neutral placeholder) — same lookup as itinerary activities. */
export function suggestionImage(name: string): string {
  return getActivityImage(name);
}

const BEACH_CITIES = new Set([
  'Bali', 'Lombok', 'Phuket', 'Koh Samui', 'Gili Islands', 'Bora Bora', 'Fiji',
  'Labuan Bajo', 'Maldives', 'Nadi', 'Denarau Island', 'Boracay', 'Palawan',
  'Da Nang', 'Hoi An', 'Sentosa Island', 'Cancun', 'Tulum', 'Zanzibar',
]);

const CULTURE_CITIES = new Set([
  'Yogyakarta', 'Solo', 'Kyoto', 'Siem Reap', 'Luang Prabang', 'Nara',
  'Agra', 'Jaipur', 'Fez', 'Marrakech', 'Cusco', 'Petra', 'Athens',
]);

const CITY_DESTINATIONS = new Set([
  'Jakarta', 'Surabaya', 'Tokyo', 'Osaka', 'Singapore', 'Bangkok', 'Dubai',
  'New York', 'London', 'Seoul', 'Hong Kong', 'Shanghai', 'Beijing', 'Paris',
]);

const BEACH_SUGGESTIONS: ActivitySuggestion[] = [
  { name: 'Sunrise beach walk', cost: 0 },
  { name: 'Snorkeling trip', cost: 35 },
  { name: 'Surfing lesson', cost: 40 },
  { name: 'Temple visit', cost: 5 },
  { name: 'Sunset cocktails', cost: 15 },
  { name: 'Local warung dinner', cost: 12 },
  { name: 'Waterfall hike', cost: 8 },
  { name: 'Cooking class', cost: 30 },
];

const CULTURE_SUGGESTIONS: ActivitySuggestion[] = [
  { name: 'Batik workshop', cost: 20 },
  { name: 'Kraton palace tour', cost: 8 },
  { name: 'Street food tour', cost: 15 },
  { name: 'Puppet show (Wayang)', cost: 10 },
  { name: 'Sunrise at Borobudur', cost: 25 },
  { name: 'Prambanan at sunset', cost: 15 },
  { name: 'Silver smithing class', cost: 25 },
];

const CITY_SUGGESTIONS: ActivitySuggestion[] = [
  { name: 'Museum visit', cost: 12 },
  { name: 'Shopping mall', cost: 0 },
  { name: 'Rooftop bar', cost: 20 },
  { name: 'Food hall tour', cost: 18 },
  { name: 'Night market', cost: 10 },
  { name: 'City walking tour', cost: 0 },
];

const JAPAN_SUGGESTIONS: ActivitySuggestion[] = [
  { name: 'Ramen tasting', cost: 12 },
  { name: 'Onsen visit', cost: 20 },
  { name: 'Sushi making class', cost: 45 },
  { name: 'Shrine visit', cost: 0 },
  { name: 'Cherry blossom walk', cost: 0 },
  { name: 'Arcade & karaoke night', cost: 25 },
];

const GENERIC_SUGGESTIONS: ActivitySuggestion[] = [
  { name: 'City walking tour', cost: 0 },
  { name: 'Local market visit', cost: 8 },
  { name: 'Museum visit', cost: 12 },
  { name: 'Food tour', cost: 20 },
  { name: 'Sunset viewpoint', cost: 0 },
];

export function getActivitySuggestions(city: string, country?: string): ActivitySuggestion[] {
  if (BEACH_CITIES.has(city)) return BEACH_SUGGESTIONS;
  if (CULTURE_CITIES.has(city)) return CULTURE_SUGGESTIONS;
  if (CITY_DESTINATIONS.has(city)) return CITY_SUGGESTIONS;
  if (country === 'Japan') return JAPAN_SUGGESTIONS;
  return GENERIC_SUGGESTIONS;
}
