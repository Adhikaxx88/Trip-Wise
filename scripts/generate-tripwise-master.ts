/**
 * One-off generator for src/data/tripwise-master.json.
 * Consolidates the real data already in geography.ts + transport.ts into a
 * single JSON file, and fills in the per-city attraction/restaurant/hero-image
 * fields the spec asks for using clearly-generic, template-based entries
 * (no fabricated specific business names) since we have no verified data
 * source for real attractions/restaurants per city.
 *
 * Run with: npx tsx scripts/generate-tripwise-master.ts
 */
import { writeFileSync } from 'node:fs';
import { COUNTRIES, INDONESIA_CITIES, type CityOption, type CountryOption } from '../src/data/geography';
import { intercityTransport, getIntracityOptions } from '../src/data/transport';

function unsplash(keywords: string, w = 800, h = 500): string {
  const seed = keywords
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
}

function mapsLink(place: string): string {
  return `https://maps.google.com/?q=${encodeURIComponent(place)}`;
}

const ATTRACTION_TEMPLATES: { suffix: string; category: string; timeSlot: string; costTier: number }[] = [
  { suffix: 'Old Town Walking Tour', category: 'landmark', timeSlot: 'morning', costTier: 0 },
  { suffix: 'National Museum', category: 'culture', timeSlot: 'morning', costTier: 8 },
  { suffix: 'Central Park & Gardens', category: 'nature', timeSlot: 'afternoon', costTier: 0 },
  { suffix: 'Night Market', category: 'market', timeSlot: 'evening', costTier: 5 },
  { suffix: 'Sunset Viewpoint', category: 'viewpoint', timeSlot: 'evening', costTier: 0 },
];

const RESTAURANT_TEMPLATES: { suffix: string; mealType: 'breakfast' | 'lunch' | 'dinner'; priceRange: string }[] = [
  { suffix: 'Local Breakfast Kitchen', mealType: 'breakfast', priceRange: '$' },
  { suffix: 'Downtown Lunch House', mealType: 'lunch', priceRange: '$$' },
  { suffix: 'Rooftop Dinner Spot', mealType: 'dinner', priceRange: '$$$' },
];

function buildCityEntry(city: CityOption, countryName: string) {
  const label = `${city.name}, ${countryName}`;
  return {
    name: city.name,
    country: countryName,
    image: city.imageUrl,
    mapsLink: city.mapsLink,
    heroImages: [0, 1, 2].map((i) => unsplash(`${city.name} ${countryName} travel ${i}`, 400, 300)),
    hotels: {
      area: `Central ${city.name}`,
      image: unsplash(`${city.name} hotel exterior`, 800, 500),
      mapsLink: mapsLink(`hotels in Central ${city.name} ${countryName}`),
      priceRange: '$$',
    },
    attractions: ATTRACTION_TEMPLATES.map((t) => ({
      name: `${city.name} ${t.suffix}`,
      description: `A popular ${t.category} stop when visiting ${label}.`,
      image: unsplash(`${city.name} ${t.category}`, 400, 300),
      mapsLink: mapsLink(`${city.name} ${t.suffix} ${countryName}`),
      cost: t.costTier,
      duration: '2 hours',
      category: t.category,
      timeSlot: t.timeSlot,
    })),
    restaurants: RESTAURANT_TEMPLATES.map((t) => ({
      name: `${city.name} ${t.suffix}`,
      cuisine: 'Local',
      image: unsplash(`${city.name} restaurant food`, 400, 300),
      mapsLink: mapsLink(`${city.name} ${t.suffix} ${countryName}`),
      priceRange: t.priceRange,
      mealType: t.mealType,
    })),
    intracityTransport: getIntracityOptions(city.name),
  };
}

const countriesOut: Record<string, unknown> = {};
for (const country of COUNTRIES as CountryOption[]) {
  countriesOut[country.name] = {
    region: country.region,
    cities: country.cities.map((c) => buildCityEntry(c, country.name)),
  };
}
countriesOut['Indonesia'] = {
  region: 'Asia',
  cities: INDONESIA_CITIES.map((c) => buildCityEntry(c, 'Indonesia')),
};

const routesOut: Record<string, unknown> = {};
for (const [key, options] of Object.entries(intercityTransport)) {
  routesOut[key] = options;
}

const fallbacks = {
  unknownCityImage: 'https://picsum.photos/seed/travel-default/800/500',
  unknownCityMapsLink: 'https://maps.google.com/?q=travel+destination',
  unknownAttractionImage: 'https://picsum.photos/seed/travel-activity/400/300',
  unknownRouteType: 'flight',
  genericBookingUrl: 'https://www.traveloka.com',
};

const master = {
  generatedAt: new Date().toISOString(),
  countries: countriesOut,
  routes: routesOut,
  fallbacks,
};

writeFileSync('src/data/tripwise-master.json', JSON.stringify(master));
const cityCount = Object.values(countriesOut).reduce(
  (sum, c) => sum + (c as { cities: unknown[] }).cities.length,
  0,
);
console.log(
  `Wrote src/data/tripwise-master.json: ${Object.keys(countriesOut).length} countries, ${cityCount} cities, ${Object.keys(routesOut).length} curated routes.`,
);
